<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccountType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AccountTypeController extends Controller
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

        $accountTypes = AccountType::where('company_id', $companyId)
            ->orderBy('code')
            ->get();
        
        return response()->json($accountTypes);
    }

    public function store(Request $request)
    {
        $companyId = $this->getCompanyId($request);
        
        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:10',
            'name' => 'required|string|max:100',
            'nature' => 'required|in:deudora,acreedora',
            'affects_balance' => 'boolean',
            'affects_results' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['company_id'] = $companyId;

        $accountType = AccountType::create($data);
        
        return response()->json($accountType, 201);
    }

    public function show(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $accountType = AccountType::where('company_id', $companyId)
            ->findOrFail($id);
        
        return response()->json($accountType);
    }

    public function update(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $accountType = AccountType::where('company_id', $companyId)->findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|required|string|max:10',
            'name' => 'sometimes|required|string|max:100',
            'nature' => 'sometimes|required|in:deudora,acreedora',
            'affects_balance' => 'boolean',
            'affects_results' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $accountType->update($validator->validated());
        
        return response()->json($accountType);
    }

    public function destroy(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $accountType = AccountType::where('company_id', $companyId)->findOrFail($id);
        
        $accountType->delete();
        
        return response()->json(['message' => 'Account type deleted successfully']);
    }
}
