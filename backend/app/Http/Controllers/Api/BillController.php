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

    private function resolveSupplierId(int $companyId, array &$data): ?int
    {
        if (!empty($data['supplier_id'])) {
            $supplier = Supplier::where('company_id', $companyId)
                ->where('id', $data['supplier_id'])
                ->first();

            if (!$supplier) {
                return null;
            }

            if (empty($data['supplier_name_snapshot'])) {
                $data['supplier_name_snapshot'] = $supplier->name;
            }
            if (empty($data['supplier_tax_id_snapshot'])) {
                $data['supplier_tax_id_snapshot'] = $supplier->rfc;
            }

            return (int) $supplier->id;
        }

        $name = trim((string) ($data['supplier_name_snapshot'] ?? ''));
        $taxId = trim((string) ($data['supplier_tax_id_snapshot'] ?? ''));

        if ($name === '' && $taxId === '') {
            return null;
        }

        $existing = Supplier::where('company_id', $companyId)
            ->where(function ($query) use ($name, $taxId) {
                if ($taxId !== '') {
                    $query->orWhere('rfc', $taxId);
                }
                if ($name !== '') {
                    $query->orWhere('name', $name);
                }
            })
            ->first();

        if ($existing) {
            return (int) $existing->id;
        }

        $generatedCode = 'PROV-AUTO-' . strtoupper(substr(md5($name . $taxId . now()->timestamp), 0, 8));
        $created = Supplier::create([
            'company_id' => $companyId,
            'code' => $generatedCode,
            'name' => $name !== '' ? $name : 'Proveedor desde DTE',
            'rfc' => $taxId !== '' ? $taxId : null,
            'active' => true,
            'credit_days' => 30,
        ]);

        return (int) $created->id;
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
            'supplier_id' => 'nullable|exists:suppliers,id',
            'bill_number' => 'required|string|max:50',
            'bill_date' => 'required|date',
            'due_date' => 'nullable|date',
            'subtotal' => 'required|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'balance' => 'nullable|numeric|min:0',
            'status' => 'nullable|string|max:20',
            'notes' => 'nullable|string',
            'tipo_dte' => 'nullable|string|max:5',
            'dte_version' => 'nullable|integer|min:1|max:99',
            'dte_ambiente' => 'nullable|string|max:5',
            'dte_numero_control' => 'nullable|string|max:80',
            'dte_codigo_generacion' => 'nullable|string|max:80',
            'dte_fec_emi' => 'nullable|date',
            'dte_hor_emi' => 'nullable|string|max:20',
            'dte_sello_recibido' => 'nullable|string',
            'dte_firma_electronica' => 'nullable|string',
            'dte_emisor' => 'nullable|array',
            'dte_receptor' => 'nullable|array',
            'dte_cuerpo_documento' => 'nullable|array',
            'dte_resumen' => 'nullable|array',
            'dte_apendice' => 'nullable|array',
            'dte_raw_json' => 'nullable|string',
            'supplier_name_snapshot' => 'nullable|string|max:255',
            'supplier_tax_id_snapshot' => 'nullable|string|max:50',
            'is_fiscal_credit' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if (empty($data['bill_number']) && !empty($data['dte_numero_control'])) {
            $data['bill_number'] = $data['dte_numero_control'];
        }
        if (empty($data['bill_date']) && !empty($data['dte_fec_emi'])) {
            $data['bill_date'] = $data['dte_fec_emi'];
        }
        if (empty($data['due_date'])) {
            $data['due_date'] = $data['bill_date'];
        }
        if (!isset($data['balance'])) {
            $data['balance'] = $data['total'];
        }
        if (empty($data['status'])) {
            $data['status'] = 'pending';
        }

        if (!array_key_exists('is_fiscal_credit', $data)) {
            $data['is_fiscal_credit'] = ($data['tipo_dte'] ?? null) === '03';
        }

        $resolvedSupplierId = $this->resolveSupplierId((int) $companyId, $data);
        if ($resolvedSupplierId === null && empty($data['supplier_name_snapshot'])) {
            return response()->json(['message' => 'Supplier data required (supplier_id or supplier snapshot)'], 422);
        }
        $data['supplier_id'] = $resolvedSupplierId;

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
            'supplier_id' => 'nullable|exists:suppliers,id',
            'bill_number' => 'sometimes|required|string|max:50',
            'bill_date' => 'sometimes|required|date',
            'due_date' => 'nullable|date',
            'subtotal' => 'sometimes|required|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'total' => 'sometimes|required|numeric|min:0',
            'balance' => 'nullable|numeric|min:0',
            'status' => 'nullable|string|max:20',
            'notes' => 'nullable|string',
            'tipo_dte' => 'nullable|string|max:5',
            'dte_version' => 'nullable|integer|min:1|max:99',
            'dte_ambiente' => 'nullable|string|max:5',
            'dte_numero_control' => 'nullable|string|max:80',
            'dte_codigo_generacion' => 'nullable|string|max:80',
            'dte_fec_emi' => 'nullable|date',
            'dte_hor_emi' => 'nullable|string|max:20',
            'dte_sello_recibido' => 'nullable|string',
            'dte_firma_electronica' => 'nullable|string',
            'dte_emisor' => 'nullable|array',
            'dte_receptor' => 'nullable|array',
            'dte_cuerpo_documento' => 'nullable|array',
            'dte_resumen' => 'nullable|array',
            'dte_apendice' => 'nullable|array',
            'dte_raw_json' => 'nullable|string',
            'supplier_name_snapshot' => 'nullable|string|max:255',
            'supplier_tax_id_snapshot' => 'nullable|string|max:50',
            'is_fiscal_credit' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if (array_key_exists('supplier_id', $data) || array_key_exists('supplier_name_snapshot', $data) || array_key_exists('supplier_tax_id_snapshot', $data)) {
            $resolvedSupplierId = $this->resolveSupplierId((int) $companyId, $data);
            $data['supplier_id'] = $resolvedSupplierId;
        }

        if (array_key_exists('tipo_dte', $data) && !array_key_exists('is_fiscal_credit', $data)) {
            $data['is_fiscal_credit'] = ($data['tipo_dte'] ?? null) === '03';
        }

        $bill->update($data);
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
