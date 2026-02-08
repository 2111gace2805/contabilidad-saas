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
}
