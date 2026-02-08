<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class JournalEntryController extends Controller
{
    private function getCompanyId(Request $request)
    {
        return $request->header('X-Company-Id');
    }

    public function index(Request $request)
    {
        $companyId = $this->getCompanyId($request);
        
        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $query = JournalEntry::where('company_id', $companyId)
            ->with(['creator', 'lines.account']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from')) {
            $query->where('entry_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('entry_date', '<=', $request->date_to);
        }

        $entries = $query->orderBy('entry_date', 'desc')
            ->orderBy('entry_number', 'desc')
            ->paginate($request->get('per_page', 15));
        
        return response()->json($entries);
    }

    public function store(Request $request)
    {
        $companyId = $this->getCompanyId($request);
        
        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $validator = Validator::make($request->all(), [
            'entry_date' => 'required|date',
            'entry_type' => 'required|string|max:50',
            'description' => 'required|string',
            'lines' => 'required|array|min:2',
            'lines.*.account_id' => 'required|exists:accounts,id',
            'lines.*.debit' => 'required|numeric|min:0',
            'lines.*.credit' => 'required|numeric|min:0',
            'lines.*.description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        
        $totalDebit = array_sum(array_column($data['lines'], 'debit'));
        $totalCredit = array_sum(array_column($data['lines'], 'credit'));
        
        if (abs($totalDebit - $totalCredit) > 0.01) {
            return response()->json(['message' => 'Debits and credits must be balanced'], 400);
        }

        DB::beginTransaction();
        try {
            $entry = JournalEntry::lockForUpdate()
                ->where('company_id', $companyId)
                ->orderBy('entry_number', 'desc')
                ->first();
            
            $entryNumber = $entry ? $entry->entry_number + 1 : 1;

            $entry = JournalEntry::create([
                'company_id' => $companyId,
                'entry_number' => $entryNumber,
                'entry_date' => $data['entry_date'],
                'entry_type' => $data['entry_type'],
                'description' => $data['description'],
                'status' => 'draft',
                'created_by' => $request->user()->id,
            ]);

            foreach ($data['lines'] as $line) {
                JournalEntryLine::create([
                    'journal_entry_id' => $entry->id,
                    'account_id' => $line['account_id'],
                    'debit' => $line['debit'],
                    'credit' => $line['credit'],
                    'description' => $line['description'] ?? null,
                ]);
            }

            DB::commit();
            
            $entry->load(['lines.account', 'creator']);
            
            return response()->json($entry, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error creating journal entry', 'error' => $e->getMessage()], 500);
        }
    }

    public function show(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $entry = JournalEntry::where('company_id', $companyId)
            ->with(['lines.account', 'creator', 'voider'])
            ->findOrFail($id);
        
        return response()->json($entry);
    }

    public function update(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $entry = JournalEntry::where('company_id', $companyId)->findOrFail($id);
        
        if ($entry->status !== 'draft') {
            return response()->json(['message' => 'Only draft entries can be updated'], 400);
        }

        $validator = Validator::make($request->all(), [
            'entry_date' => 'sometimes|required|date',
            'entry_type' => 'sometimes|required|string|max:50',
            'description' => 'sometimes|required|string',
            'lines' => 'sometimes|required|array|min:2',
            'lines.*.account_id' => 'required|exists:accounts,id',
            'lines.*.debit' => 'required|numeric|min:0',
            'lines.*.credit' => 'required|numeric|min:0',
            'lines.*.description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if (isset($data['lines'])) {
            $totalDebit = array_sum(array_column($data['lines'], 'debit'));
            $totalCredit = array_sum(array_column($data['lines'], 'credit'));
            
            if (abs($totalDebit - $totalCredit) > 0.01) {
                return response()->json(['message' => 'Debits and credits must be balanced'], 400);
            }
        }

        DB::beginTransaction();
        try {
            $entry->update([
                'entry_date' => $data['entry_date'] ?? $entry->entry_date,
                'entry_type' => $data['entry_type'] ?? $entry->entry_type,
                'description' => $data['description'] ?? $entry->description,
            ]);

            if (isset($data['lines'])) {
                $entry->lines()->delete();
                
                foreach ($data['lines'] as $line) {
                    JournalEntryLine::create([
                        'journal_entry_id' => $entry->id,
                        'account_id' => $line['account_id'],
                        'debit' => $line['debit'],
                        'credit' => $line['credit'],
                        'description' => $line['description'] ?? null,
                    ]);
                }
            }

            DB::commit();
            
            $entry->load(['lines.account', 'creator']);
            
            return response()->json($entry);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error updating journal entry', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $entry = JournalEntry::where('company_id', $companyId)->findOrFail($id);
        
        if ($entry->status !== 'draft') {
            return response()->json(['message' => 'Only draft entries can be deleted'], 400);
        }

        DB::beginTransaction();
        try {
            $entry->lines()->delete();
            $entry->delete();
            
            DB::commit();
            
            return response()->json(['message' => 'Journal entry deleted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error deleting journal entry', 'error' => $e->getMessage()], 500);
        }
    }

    public function post(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $entry = JournalEntry::where('company_id', $companyId)->findOrFail($id);
        
        if ($entry->status !== 'draft') {
            return response()->json(['message' => 'Only draft entries can be posted'], 400);
        }

        $entry->update([
            'status' => 'posted',
            'posted_at' => now(),
        ]);
        
        $entry->load(['lines.account', 'creator']);
        
        return response()->json(['message' => 'Journal entry posted successfully', 'entry' => $entry]);
    }

    public function void(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $entry = JournalEntry::where('company_id', $companyId)->findOrFail($id);
        
        if ($entry->status !== 'posted') {
            return response()->json(['message' => 'Only posted entries can be voided'], 400);
        }

        $entry->update([
            'status' => 'voided',
            'voided_at' => now(),
            'voided_by' => $request->user()->id,
        ]);
        
        $entry->load(['lines.account', 'creator', 'voider']);
        
        return response()->json(['message' => 'Journal entry voided successfully', 'entry' => $entry]);
    }
}
