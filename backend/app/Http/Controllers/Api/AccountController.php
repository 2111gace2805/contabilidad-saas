<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AccountController extends Controller
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

        $accounts = Account::where('company_id', $companyId)
            ->with(['accountType', 'parent', 'children'])
            ->orderBy('code')
            ->get();
        
        return response()->json($accounts);
    }

    public function store(Request $request)
    {
        $companyId = $this->getCompanyId($request);
        
        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        // Accept frontend field names and normalize them to backend fields
        if ($request->has('parent_account_id')) {
            $request->merge(['parent_id' => $request->input('parent_account_id')]);
        }

        if ($request->has('allows_transactions')) {
            $request->merge(['is_detail' => $request->input('allows_transactions')]);
        }

        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:20',
            'name' => 'required|string|max:255',
            'account_type_id' => 'required|exists:account_types,id',
            'parent_id' => 'nullable|exists:accounts,id',
            'level' => 'required|integer|min:1',
            'is_detail' => 'boolean',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['company_id'] = $companyId;

        $account = Account::create($data);
        $account->load(['accountType', 'parent']);
        
        return response()->json($account, 201);
    }

    public function show(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $account = Account::where('company_id', $companyId)
            ->with(['accountType', 'parent', 'children'])
            ->findOrFail($id);
        
        return response()->json($account);
    }

    public function update(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $account = Account::where('company_id', $companyId)->findOrFail($id);
        
        // Normalize frontend keys
        if ($request->has('parent_account_id')) {
            $request->merge(['parent_id' => $request->input('parent_account_id')]);
        }

        if ($request->has('allows_transactions')) {
            $request->merge(['is_detail' => $request->input('allows_transactions')]);
        }

        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|required|string|max:20',
            'name' => 'sometimes|required|string|max:255',
            'account_type_id' => 'sometimes|required|exists:account_types,id',
            'parent_id' => 'nullable|exists:accounts,id',
            'level' => 'sometimes|required|integer|min:1',
            'is_detail' => 'boolean',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $account->update($validator->validated());
        $account->load(['accountType', 'parent']);
        
        return response()->json($account);
    }

    public function destroy(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $account = Account::where('company_id', $companyId)->findOrFail($id);
        
        if ($account->children()->count() > 0) {
            return response()->json(['message' => 'Cannot delete account with children'], 400);
        }
        
        if ($account->journalEntryLines()->count() > 0) {
            return response()->json(['message' => 'Cannot delete account with journal entries'], 400);
        }
        
        $account->delete();
        
        return response()->json(['message' => 'Account deleted successfully']);
    }

    public function hierarchy(Request $request)
    {
        $companyId = $this->getCompanyId($request);
        
        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $accounts = Account::where('company_id', $companyId)
            ->whereNull('parent_id')
            ->with(['accountType', 'children' => function ($query) {
                $query->with('children.children.children');
            }])
            ->orderBy('code')
            ->get();
        
        return response()->json($accounts);
    }

    /**
     * Importa un catálogo de cuentas desde un payload (array de filas)
     * Cada fila debe contener: code,name,account_type,nature,parent_code,level,is_postable,affects_tax,tax_type
     */
    public function import(Request $request)
    {
        $companyId = $this->getCompanyId($request);

        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $rows = $request->all();

        if (!is_array($rows)) {
            return response()->json(['message' => 'Invalid payload, expected array of rows'], 422);
        }

        // Normalize and filter out empty rows
        $normalized = array_values(array_filter(array_map(function ($r) {
            if (!is_array($r)) return null;
            $code = trim($r['code'] ?? '');
            $name = trim($r['name'] ?? '');
            if ($code === '' || $name === '') return null;
            return [
                'code' => $code,
                'name' => trim($r['name'] ?? ''),
                'account_type' => trim($r['account_type'] ?? ''),
                'nature' => trim($r['nature'] ?? ''),
                'parent_code' => trim($r['parent_code'] ?? ''),
                'level' => intval($r['level'] ?? 1),
                'is_postable' => filter_var($r['is_postable'] ?? false, FILTER_VALIDATE_BOOLEAN),
                'affects_tax' => filter_var($r['affects_tax'] ?? false, FILTER_VALIDATE_BOOLEAN),
                'tax_type' => trim($r['tax_type'] ?? ''),
            ];
        }, $rows)));

        // Sort by level ascending to ensure parents are created first
        usort($normalized, function ($a, $b) {
            return $a['level'] <=> $b['level'];
        });

        $created = [];

        foreach ($normalized as $row) {
            // Find or create account type
            $accountType = \App\Models\AccountType::where('company_id', $companyId)
                ->whereRaw('UPPER(name) = UPPER(?)', [$row['account_type']])
                ->first();

            if (!$accountType) {
                // Attempt to derive nature mapping
                $nature = strtoupper($row['nature']) === 'DEBE' ? 'deudora' : 'acreedora';
                $accountType = \App\Models\AccountType::create([
                    'company_id' => $companyId,
                    'code' => substr(strtoupper(preg_replace('/[^A-Z0-9]/', '', $row['account_type'])), 0, 10) ?: 'T',
                    'name' => $row['account_type'] ?: 'Tipo',
                    'nature' => $nature,
                    'affects_balance' => false,
                    'affects_results' => false,
                ]);
            }

            // Find parent account by code if provided
            $parent = null;
            if ($row['parent_code']) {
                $parent = Account::where('company_id', $companyId)
                    ->where('code', $row['parent_code'])
                    ->first();
            }

            $accountData = [
                'company_id' => $companyId,
                'code' => $row['code'],
                'name' => $row['name'],
                'account_type_id' => $accountType->id,
                'parent_id' => $parent ? $parent->id : null,
                'level' => $row['level'],
                'is_detail' => (bool) $row['is_postable'],
                'active' => true,
            ];

            // Create or update account by code
            $account = Account::updateOrCreate([
                'company_id' => $companyId,
                'code' => $row['code'],
            ], $accountData);

            $created[] = $account;
        }

        return response()->json([
            'message' => 'Catálogo cargado correctamente',
            'created' => $created
        ], 201);
    }

    public function downloadTemplate()
    {
        $filePath = public_path('plantilla.csv');

        if (!file_exists($filePath)) {
            return response()->json(['message' => 'Template file not found'], 404);
        }

        return response()->download($filePath, 'plantilla.csv');
    }
}
