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
            return response()->json(['message' => 'ID de empresa requerido'], 400);
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

        if ($request->has('entry_number')) {
            $query->where('entry_number', 'like', '%' . $request->entry_number . '%');
        }

        if ($request->has('description')) {
            $query->where('description', 'like', '%' . $request->description . '%');
        }

        if ($request->has('entry_type')) {
            $query->where('entry_type', $request->entry_type);
        }

        $entries = $query->orderBy('entry_date', 'desc')
            ->orderBy('entry_type', 'asc')
            ->orderBy('type_number', 'desc')
            ->paginate($request->get('per_page', 15));
        
        return response()->json($entries);
    }

    public function store(Request $request)
    {
        $companyId = $this->getCompanyId($request);
        
        if (!$companyId) {
            return response()->json(['message' => 'ID de empresa requerido'], 400);
        }

        $validator = Validator::make($request->all(), [
            'entry_date' => 'required|date',
            'entry_type' => 'nullable|string|max:50', // default will be 'PD' if not provided
            'description' => 'nullable|string',
            'lines' => 'required|array|min:1',
            'lines.*.account_id' => 'required|exists:accounts,id',
            'lines.*.debit' => 'required|numeric|min:0',
            'lines.*.credit' => 'required|numeric|min:0',
            'lines.*.description' => 'nullable|string',
            'lines.*.line_number' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        // default entry type to PD when not provided
        $data['entry_type'] = strtoupper($data['entry_type'] ?? 'PD');
        $status = strtoupper($request->status ?? 'DRAFT');
        
        $totalDebit = array_sum(array_column($data['lines'], 'debit'));
        $totalCredit = array_sum(array_column($data['lines'], 'credit'));
        
        if ($status === 'POSTED' && abs($totalDebit - $totalCredit) > 0.01) {
            return response()->json(['message' => 'El debe y el haber deben estar cuadrados para contabilizar'], 400);
        }

        DB::beginTransaction();
        try {
            $entry = JournalEntry::create([
                'company_id' => $companyId,
                'entry_date' => $data['entry_date'],
                'entry_type' => $data['entry_type'],
                'description' => $data['description'] ?? '',
                'status' => JournalEntry::STATUS_DRAFT, // Always create as draft first
                'created_by' => $request->user()->id,
            ]);

            foreach ($data['lines'] as $line) {
                $account = \App\Models\Account::findOrFail($line['account_id']);
                if (!$account->is_detail) {
                    throw new \Exception("La cuenta {$account->code} - {$account->name} no es una cuenta de detalle (imputable).");
                }

                if (($line['debit'] != 0 && $line['credit'] != 0) || ($line['debit'] == 0 && $line['credit'] == 0)) {
                    throw new \Exception("Cada línea debe tener un cargo o un abono (no ambos ni ninguno).");
                }

                JournalEntryLine::create([
                    'journal_entry_id' => $entry->id,
                    'account_id' => $line['account_id'],
                    'debit' => $line['debit'],
                    'credit' => $line['credit'],
                    'description' => $line['description'] ?? null,
                    'line_number' => $line['line_number'],
                ]);
            }

            // If user explicitly sent POSTED, we try to post it immediately
            if (strtoupper($request->status) === 'POSTED') {
                $this->assignNumbersAndPost($entry);
            }

            DB::commit();
            
            $entry->load(['lines.account', 'creator']);
            
            return response()->json($entry, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al crear la póliza', 'error' => $e->getMessage()], 500);
        }
    }

    private function assignNumbersAndPost(JournalEntry $entry)
    {
        $totalDebit = $entry->lines->sum('debit');
        $totalCredit = $entry->lines->sum('credit');

        if (abs($totalDebit - $totalCredit) > 0.01) {
            throw new \Exception('El debe y el haber deben estar cuadrados para contabilizar');
        }

        // Get last global sequence number
        $lastGlobal = JournalEntry::lockForUpdate()
            ->where('company_id', $entry->company_id)
            ->whereNotNull('sequence_number')
            ->orderBy('sequence_number', 'desc')
            ->first();
        $nextSequence = ($lastGlobal->sequence_number ?? 0) + 1;

        // Get last type-specific number
        $lastType = JournalEntry::lockForUpdate()
            ->where('company_id', $entry->company_id)
            ->where('entry_type', $entry->entry_type)
            ->whereNotNull('type_number')
            ->orderBy('type_number', 'desc')
            ->first();
        $nextTypeNumber = ($lastType->type_number ?? 0) + 1;

        $prefix = strtoupper($entry->entry_type);
        // Format: <PREFIX><7-digit-sequence> e.g. PX0000001
        $entryNumber = $prefix . str_pad($nextTypeNumber, 7, '0', STR_PAD_LEFT);

        $entry->update([
            'sequence_number' => $nextSequence, // We keep global sequence for internal audit/order
            'type_number' => $nextTypeNumber,
            'entry_number' => $entryNumber,
            'status' => JournalEntry::STATUS_POSTED,
        ]);
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
        
        if (strtoupper($entry->status) !== 'DRAFT') {
            return response()->json(['message' => 'Solo se pueden actualizar pólizas en borrador'], 400);
        }

        $validator = Validator::make($request->all(), [
            'entry_date' => 'sometimes|required|date',
            'entry_type' => 'sometimes|required|string|max:50',
            'description' => 'sometimes|nullable|string',
            'lines' => 'sometimes|required|array|min:1',
            'lines.*.account_id' => 'required|exists:accounts,id',
            'lines.*.debit' => 'required|numeric|min:0',
            'lines.*.credit' => 'required|numeric|min:0',
            'lines.*.description' => 'nullable|string',
            'lines.*.line_number' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $status = strtoupper($request->status ?? $entry->status);

        if (isset($data['lines'])) {
            $totalDebit = array_sum(array_column($data['lines'], 'debit'));
            $totalCredit = array_sum(array_column($data['lines'], 'credit'));
            
            if ($status === 'POSTED' && abs($totalDebit - $totalCredit) > 0.01) {
                return response()->json(['message' => 'El debe y el haber deben estar cuadrados para contabilizar'], 400);
            }
        }

        DB::beginTransaction();
        try {
            $entry->update([
                'entry_date' => $data['entry_date'] ?? $entry->entry_date,
                'entry_type' => $data['entry_type'] ?? $entry->entry_type,
                'description' => array_key_exists('description', $data) ? ($data['description'] ?? '') : $entry->description,
                'status' => $status,
            ]);

            if (isset($data['lines'])) {
                $entry->lines()->delete();
                
                foreach ($data['lines'] as $line) {
                    $account = \App\Models\Account::findOrFail($line['account_id']);
                    if (!$account->is_detail) {
                        throw new \Exception("La cuenta {$account->code} - {$account->name} no es una cuenta de detalle (imputable).");
                    }

                    if (($line['debit'] != 0 && $line['credit'] != 0) || ($line['debit'] == 0 && $line['credit'] == 0)) {
                        throw new \Exception("Cada línea debe tener un cargo o un abono (no ambos ni ninguno).");
                    }

                    JournalEntryLine::create([
                        'journal_entry_id' => $entry->id,
                        'account_id' => $line['account_id'],
                        'debit' => $line['debit'],
                        'credit' => $line['credit'],
                        'description' => $line['description'] ?? null,
                        'line_number' => $line['line_number'],
                    ]);
                }
            }

            DB::commit();
            
            $entry->load(['lines.account', 'creator']);
            
            return response()->json($entry);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al actualizar la póliza', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $entry = JournalEntry::where('company_id', $companyId)->findOrFail($id);
        
        if (strtoupper($entry->status) !== 'DRAFT') {
            return response()->json(['message' => 'Solo se pueden eliminar pólizas en borrador'], 400);
        }

        DB::beginTransaction();
        try {
            $entry->lines()->delete();
            $entry->delete();
            
            DB::commit();
            
            return response()->json(['message' => 'Póliza eliminada exitosamente']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al eliminar la póliza', 'error' => $e->getMessage()], 500);
        }
    }

    public function post(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        $entry = JournalEntry::where('company_id', $companyId)->findOrFail($id);
        
        if (strtoupper($entry->status) !== 'DRAFT') {
            return response()->json(['message' => 'Solo se pueden contabilizar pólizas en borrador'], 400);
        }

        DB::beginTransaction();
        try {
            $this->assignNumbersAndPost($entry);
            DB::commit();
            
            $entry->load(['lines.account', 'creator']);
            return response()->json(['message' => 'Póliza contabilizada exitosamente', 'entry' => $entry]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al contabilizar la póliza', 'error' => $e->getMessage()], 400);
        }
    }

    public function requestVoid(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        $entry = JournalEntry::where('company_id', $companyId)->findOrFail($id);

        if (strtoupper($entry->status) !== 'POSTED') {
            return response()->json(['message' => 'Solo se pueden anular pólizas contabilizadas'], 400);
        }

        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|min:10',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $entry->update([
            'status' => JournalEntry::STATUS_PENDING_VOID,
            'void_reason' => $request->reason,
            'void_requested_by' => $request->user()->id,
            'void_requested_at' => now(),
        ]);

        return response()->json(['message' => 'Solicitud de anulación enviada', 'entry' => $entry]);
    }

    public function authorizeVoid(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        $entry = JournalEntry::where('company_id', $companyId)->findOrFail($id);

        if (strtoupper($entry->status) !== 'PENDING_VOID') {
            return response()->json(['message' => 'Solo se pueden autorizar anulaciones pendientes'], 400);
        }

        // Role check should be handled by middleware, but adding a safety check if needed
        // For now assuming existing auth middleware handles user role.

        $entry->update([
            'status' => JournalEntry::STATUS_VOIDED,
            'void_authorized_by' => $request->user()->id,
            'void_authorized_at' => now(),
        ]);

        return response()->json(['message' => 'Póliza anulada exitosamente', 'entry' => $entry]);
    }

    public function pendingVoids(Request $request)
    {
        $companyId = $this->getCompanyId($request);
        
        $entries = JournalEntry::where('company_id', $companyId)
            ->where('status', JournalEntry::STATUS_PENDING_VOID)
            ->with(['creator', 'voidRequestedBy', 'lines.account'])
            ->get();
            
        return response()->json($entries);
    }
}
