<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class InventoryItemController extends Controller
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

        $query = InventoryItem::where('company_id', $companyId);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('item_code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $items = $query->orderBy('item_code')
            ->paginate($request->get('per_page', 15));
        
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $companyId = $this->getCompanyId($request);
        
        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $validator = Validator::make($request->all(), [
            'item_code' => 'required|string|max:50',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'unit_of_measure' => 'required|string|max:20',
            'cost_method' => 'nullable|string|max:20',
            'current_quantity' => 'nullable|numeric|min:0',
            'average_cost' => 'nullable|numeric|min:0',
            'inventory_account_id' => 'nullable|exists:accounts,id',
            'cogs_account_id' => 'nullable|exists:accounts,id',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['company_id'] = $companyId;
        
        if (isset($data['inventory_account_id'])) {
            $inventoryAccount = Account::where('company_id', $companyId)
                ->where('id', $data['inventory_account_id'])
                ->first();
            
            if (!$inventoryAccount) {
                return response()->json(['message' => 'Inventory account not found in current company'], 404);
            }
        }
        
        if (isset($data['cogs_account_id'])) {
            $cogsAccount = Account::where('company_id', $companyId)
                ->where('id', $data['cogs_account_id'])
                ->first();
            
            if (!$cogsAccount) {
                return response()->json(['message' => 'COGS account not found in current company'], 404);
            }
        }

        $item = InventoryItem::create($data);
        
        return response()->json($item, 201);
    }

    public function show(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $item = InventoryItem::where('company_id', $companyId)
            ->with(['transactions'])
            ->findOrFail($id);
        
        return response()->json($item);
    }

    public function update(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $item = InventoryItem::where('company_id', $companyId)->findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'item_code' => 'sometimes|required|string|max:50',
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'unit_of_measure' => 'sometimes|required|string|max:20',
            'cost_method' => 'nullable|string|max:20',
            'current_quantity' => 'nullable|numeric|min:0',
            'average_cost' => 'nullable|numeric|min:0',
            'inventory_account_id' => 'nullable|exists:accounts,id',
            'cogs_account_id' => 'nullable|exists:accounts,id',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $item->update($validator->validated());
        
        return response()->json($item);
    }

    public function destroy(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $item = InventoryItem::where('company_id', $companyId)->findOrFail($id);
        
        $item->delete();
        
        return response()->json(['message' => 'Inventory item deleted successfully']);
    }
}
