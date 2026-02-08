<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BankAccountController extends Controller
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

        $accounts = BankAccount::where('company_id', $companyId)
            ->with(['account'])
            ->orderBy('bank_name')
            ->get();
        
        return response()->json($accounts);
    }

    public function store(Request $request)
    {
        $companyId = $this->getCompanyId($request);
        
        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $validator = Validator::make($request->all(), [
            'account_id' => 'required|exists:accounts,id',
            'bank_name' => 'required|string|max:255',
            'account_number' => 'required|string|max:50',
            'account_type' => 'required|string|max:50',
            'currency' => 'required|string|max:3',
            'balance' => 'nullable|numeric',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        
        $account = Account::where('company_id', $companyId)
            ->where('id', $data['account_id'])
            ->first();
        
        if (!$account) {
            return response()->json(['message' => 'Account not found in current company'], 404);
        }

        $data['company_id'] = $companyId;

        $bankAccount = BankAccount::create($data);
        $bankAccount->load('account');
        
        return response()->json($bankAccount, 201);
    }

    public function show(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $bankAccount = BankAccount::where('company_id', $companyId)
            ->with(['account', 'transactions'])
            ->findOrFail($id);
        
        return response()->json($bankAccount);
    }

    public function update(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $bankAccount = BankAccount::where('company_id', $companyId)->findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'account_id' => 'sometimes|required|exists:accounts,id',
            'bank_name' => 'sometimes|required|string|max:255',
            'account_number' => 'sometimes|required|string|max:50',
            'account_type' => 'sometimes|required|string|max:50',
            'currency' => 'sometimes|required|string|max:3',
            'balance' => 'nullable|numeric',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $bankAccount->update($validator->validated());
        $bankAccount->load('account');
        
        return response()->json($bankAccount);
    }

    public function destroy(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $bankAccount = BankAccount::where('company_id', $companyId)->findOrFail($id);
        
        $bankAccount->delete();
        
        return response()->json(['message' => 'Bank account deleted successfully']);
    }
}
