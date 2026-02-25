<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tax;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TaxController extends Controller
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

        $query = Tax::where('company_id', $companyId);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('type', 'like', "%{$search}%");
            });
        }

        $taxes = $query->with(['debitAccount', 'creditAccount'])->orderBy('code')
            ->paginate($request->get('per_page', 15));
        
        return response()->json($taxes);
    }

    public function store(Request $request)
    {
        $companyId = $this->getCompanyId($request);
        
        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50',
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'rate' => 'required|numeric|min:0|max:100',
            'is_active' => 'boolean',
            'debit_account_id' => 'nullable|exists:accounts,id',
            'credit_account_id' => 'nullable|exists:accounts,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $exists = Tax::where('company_id', $companyId)
            ->where('code', $request->code)
            ->exists();
        
        if ($exists) {
            return response()->json(['message' => 'Ya existe un impuesto con ese código'], 422);
        }

        $data = $validator->validated();
        $data['company_id'] = $companyId;

        // If account IDs provided, ensure they belong to the same company
        foreach (['debit_account_id','credit_account_id'] as $acctKey) {
            if (!empty($data[$acctKey])) {
                $acct = \App\Models\Account::where('company_id', $companyId)->find($data[$acctKey]);
                if (!$acct) {
                    return response()->json(['message' => "La cuenta indicada en $acctKey no existe o no pertenece a la empresa"], 422);
                }
            }
        }

        $tax = Tax::create($data);
        $tax->load(['debitAccount', 'creditAccount']);
        
        return response()->json($tax, 201);
    }

    public function show(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $tax = Tax::where('company_id', $companyId)->with(['debitAccount','creditAccount'])->findOrFail($id);
        
        return response()->json($tax);
    }

    public function update(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $tax = Tax::where('company_id', $companyId)->findOrFail($id);
        
        // Normalize account keys
        if ($request->has('debit_account_id')) {
            $request->merge(['debit_account_id' => $request->input('debit_account_id')]);
        }
        if ($request->has('credit_account_id')) {
            $request->merge(['credit_account_id' => $request->input('credit_account_id')]);
        }

        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|required|string|max:50',
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string|max:255',
            'rate' => 'sometimes|required|numeric|min:0|max:100',
            'is_active' => 'boolean',
            'debit_account_id' => 'nullable|exists:accounts,id',
            'credit_account_id' => 'nullable|exists:accounts,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->has('code') && $request->code !== $tax->code) {
            $exists = Tax::where('company_id', $companyId)
                ->where('code', $request->code)
                ->where('id', '!=', $id)
                ->exists();
            
            if ($exists) {
                return response()->json(['message' => 'Ya existe un impuesto con ese código'], 422);
            }
        }

        $data = $validator->validated();

        // Validate account ownership if provided
        foreach (['debit_account_id','credit_account_id'] as $acctKey) {
            if (!empty($data[$acctKey])) {
                $acct = \App\Models\Account::where('company_id', $companyId)->find($data[$acctKey]);
                if (!$acct) {
                    return response()->json(['message' => "La cuenta indicada en $acctKey no existe o no pertenece a la empresa"], 422);
                }
            }
        }

        $tax->update($data);
        $tax->load(['debitAccount', 'creditAccount']);
        
        return response()->json($tax);
    }

    public function destroy(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $tax = Tax::where('company_id', $companyId)->findOrFail($id);

        try {
            $tax->delete();
        } catch (QueryException $exception) {
            if ((string) $exception->getCode() === '23000') {
                return response()->json([
                    'message' => 'No se puede eliminar este impuesto porque tiene transacciones procesadas.',
                ], 422);
            }

            throw $exception;
        }
        
        return response()->json(['message' => 'Impuesto eliminado exitosamente']);
    }
}
