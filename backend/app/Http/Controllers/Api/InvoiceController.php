<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class InvoiceController extends Controller
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

        $query = Invoice::where('company_id', $companyId)
            ->with(['customer']);

        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $invoices = $query->orderBy('invoice_date', 'desc')
            ->orderBy('invoice_number', 'desc')
            ->paginate($request->get('per_page', 15));
        
        return response()->json($invoices);
    }

    public function store(Request $request)
    {
        $companyId = $this->getCompanyId($request);
        
        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|exists:customers,id',
            'invoice_number' => 'required|string|max:50',
            'invoice_date' => 'required|date',
            'due_date' => 'required|date',
            'subtotal' => 'required|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'balance' => 'nullable|numeric|min:0',
            'status' => 'required|in:draft,issued,paid,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        
        $customer = Customer::where('company_id', $companyId)
            ->where('id', $data['customer_id'])
            ->first();
        
        if (!$customer) {
            return response()->json(['message' => 'Customer not found in current company'], 404);
        }

        $data['company_id'] = $companyId;

        $invoice = Invoice::create($data);
        $invoice->load('customer');
        
        return response()->json($invoice, 201);
    }

    public function show(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $invoice = Invoice::where('company_id', $companyId)
            ->with(['customer', 'payments'])
            ->findOrFail($id);
        
        return response()->json($invoice);
    }

    public function update(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $invoice = Invoice::where('company_id', $companyId)->findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'customer_id' => 'sometimes|required|exists:customers,id',
            'invoice_number' => 'sometimes|required|string|max:50',
            'invoice_date' => 'sometimes|required|date',
            'due_date' => 'sometimes|required|date',
            'subtotal' => 'sometimes|required|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'total' => 'sometimes|required|numeric|min:0',
            'balance' => 'nullable|numeric|min:0',
            'status' => 'sometimes|required|in:draft,issued,paid,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $invoice->update($validator->validated());
        $invoice->load('customer');
        
        return response()->json($invoice);
    }

    public function destroy(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $invoice = Invoice::where('company_id', $companyId)->findOrFail($id);
        
        if ($invoice->status !== 'draft') {
            return response()->json(['message' => 'Only draft invoices can be deleted'], 400);
        }
        
        $invoice->delete();
        
        return response()->json(['message' => 'Invoice deleted successfully']);
    }
}
