<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BillController extends Controller
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

        $query = Bill::where('company_id', $companyId)
            ->with(['supplier']);

        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $bills = $query->orderBy('bill_date', 'desc')
            ->orderBy('bill_number', 'desc')
            ->paginate($request->get('per_page', 15));
        
        return response()->json($bills);
    }

    public function store(Request $request)
    {
        $companyId = $this->getCompanyId($request);
        
        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $validator = Validator::make($request->all(), [
            'supplier_id' => 'required|exists:suppliers,id',
            'bill_number' => 'required|string|max:50',
            'bill_date' => 'required|date',
            'due_date' => 'required|date',
            'subtotal' => 'required|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'balance' => 'nullable|numeric|min:0',
            'status' => 'required|in:draft,received,paid,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        
        $supplier = Supplier::where('company_id', $companyId)
            ->where('id', $data['supplier_id'])
            ->first();
        
        if (!$supplier) {
            return response()->json(['message' => 'Supplier not found in current company'], 404);
        }

        $data['company_id'] = $companyId;

        $bill = Bill::create($data);
        $bill->load('supplier');
        
        return response()->json($bill, 201);
    }

    public function show(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $bill = Bill::where('company_id', $companyId)
            ->with(['supplier', 'payments'])
            ->findOrFail($id);
        
        return response()->json($bill);
    }

    public function update(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $bill = Bill::where('company_id', $companyId)->findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'supplier_id' => 'sometimes|required|exists:suppliers,id',
            'bill_number' => 'sometimes|required|string|max:50',
            'bill_date' => 'sometimes|required|date',
            'due_date' => 'sometimes|required|date',
            'subtotal' => 'sometimes|required|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'total' => 'sometimes|required|numeric|min:0',
            'balance' => 'nullable|numeric|min:0',
            'status' => 'sometimes|required|in:draft,received,paid,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $bill->update($validator->validated());
        $bill->load('supplier');
        
        return response()->json($bill);
    }

    public function destroy(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $bill = Bill::where('company_id', $companyId)->findOrFail($id);
        
        if ($bill->status !== 'draft') {
            return response()->json(['message' => 'Only draft bills can be deleted'], 400);
        }
        
        $bill->delete();
        
        return response()->json(['message' => 'Bill deleted successfully']);
    }
}
