<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\BankTransaction;
use App\Models\Bill;
use App\Models\Company;
use App\Models\InventoryItem;
use App\Models\Supplier;
use App\Models\SupplierPayment;
use App\Support\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class BillController extends Controller
{

    private function normalizeTaxId(?string $taxId): string
    {
        return preg_replace('/[^0-9A-Za-z]/', '', strtoupper((string) $taxId)) ?? '';
    }

    private function validateDteReceptorNitForCompany(int $companyId, array $data): ?array
    {
        if (empty($data['dte_receptor']) || !is_array($data['dte_receptor'])) {
            return null;
        }

        $company = Company::where('id', $companyId)->first();
        if (!$company) {
            return ['message' => 'Company not found'];
        }

        $companyNitNormalized = $this->normalizeTaxId((string) ($company->nit ?? $company->rfc ?? ''));
        if ($companyNitNormalized === '') {
            return ['message' => 'La compañía no tiene NIT configurado para validar la recepción del DTE'];
        }

        $receptorNit = (string) ($data['dte_receptor']['nit'] ?? '');
        $receptorNitNormalized = $this->normalizeTaxId($receptorNit);
        if ($receptorNitNormalized === '') {
            return ['message' => 'El JSON del DTE no contiene NIT del receptor'];
        }

        if ($receptorNitNormalized !== $companyNitNormalized) {
            return ['message' => 'El NIT del receptor del DTE no coincide con el NIT de la compañía activa'];
        }

        return null;
    }

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
                $data['supplier_tax_id_snapshot'] = $supplier->nit;
            }
            if (empty($data['supplier_phone_snapshot'])) {
                $data['supplier_phone_snapshot'] = $supplier->phone;
            }
            if (empty($data['supplier_email_snapshot'])) {
                $data['supplier_email_snapshot'] = $supplier->email;
            }
            if (empty($data['supplier_address_snapshot'])) {
                $data['supplier_address_snapshot'] = $supplier->address;
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
                    $query->orWhere('nit', $taxId);
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
            'nit' => $taxId !== '' ? $taxId : null,
            'phone' => $data['supplier_phone_snapshot'] ?? null,
            'email' => $data['supplier_email_snapshot'] ?? null,
            'address' => $data['supplier_address_snapshot'] ?? null,
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
            'supplier_phone_snapshot' => 'nullable|string|max:50',
            'supplier_email_snapshot' => 'nullable|string|max:255',
            'supplier_address_snapshot' => 'nullable|string',
            'is_fiscal_credit' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        $nitValidationError = $this->validateDteReceptorNitForCompany((int) $companyId, $data);
        if ($nitValidationError) {
            return response()->json($nitValidationError, 422);
        }

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
        if (!empty($data['dte_cuerpo_documento']) && is_array($data['dte_cuerpo_documento'])) {
            $this->syncInventoryFromDteItems((int) $companyId, $data['dte_cuerpo_documento']);
        }
        $bill->load('supplier');

        AuditLogger::log(
            $request,
            (int) $companyId,
            'bill.create',
            'bill',
            (string) $bill->id,
            'Factura de compra creada',
            [
                'bill_number' => $bill->bill_number,
                'total' => $bill->total,
                'status' => $bill->status,
            ]
        );
        
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
            'supplier_phone_snapshot' => 'nullable|string|max:50',
            'supplier_email_snapshot' => 'nullable|string|max:255',
            'supplier_address_snapshot' => 'nullable|string',
            'is_fiscal_credit' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        $nitValidationError = $this->validateDteReceptorNitForCompany((int) $companyId, $data);
        if ($nitValidationError) {
            return response()->json($nitValidationError, 422);
        }

        if (array_key_exists('supplier_id', $data) || array_key_exists('supplier_name_snapshot', $data) || array_key_exists('supplier_tax_id_snapshot', $data)) {
            $resolvedSupplierId = $this->resolveSupplierId((int) $companyId, $data);
            $data['supplier_id'] = $resolvedSupplierId;
        }

        if (array_key_exists('tipo_dte', $data) && !array_key_exists('is_fiscal_credit', $data)) {
            $data['is_fiscal_credit'] = ($data['tipo_dte'] ?? null) === '03';
        }

        $bill->update($data);
        $bill->load('supplier');

        AuditLogger::log(
            $request,
            (int) $companyId,
            'bill.update',
            'bill',
            (string) $bill->id,
            'Factura de compra actualizada',
            [
                'bill_number' => $bill->bill_number,
                'total' => $bill->total,
                'status' => $bill->status,
            ]
        );
        
        return response()->json($bill);
    }

    public function pay(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);

        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $bill = Bill::where('company_id', $companyId)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'bank_account_id' => 'required|exists:bank_accounts,id',
            'amount' => 'nullable|numeric|min:0.01',
            'payment_date' => 'nullable|date',
            'reference' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $paymentAmount = (float) ($data['amount'] ?? $bill->balance);
        $currentBalance = (float) $bill->balance;

        if ($currentBalance <= 0) {
            return response()->json(['message' => 'Bill already paid'], 400);
        }

        if ($paymentAmount > $currentBalance) {
            return response()->json(['message' => 'Payment amount cannot exceed bill balance'], 422);
        }

        $bankAccount = BankAccount::where('company_id', $companyId)
            ->where('id', $data['bank_account_id'])
            ->first();

        if (!$bankAccount) {
            return response()->json(['message' => 'Bank account not found in current company'], 404);
        }

        if ((float) $bankAccount->current_balance < $paymentAmount) {
            return response()->json(['message' => 'Insufficient bank account balance'], 422);
        }

        $paymentDate = $data['payment_date'] ?? now()->toDateString();

        DB::transaction(function () use ($companyId, $bill, $bankAccount, $paymentAmount, $paymentDate, $data, $request) {
            $nextNumber = sprintf('PG-%s-%06d', now()->format('Ymd'), (int) ((SupplierPayment::max('id') ?? 0) + 1));

            $supplierPayment = SupplierPayment::create([
                'company_id' => $companyId,
                'supplier_id' => $bill->supplier_id,
                'payment_number' => $nextNumber,
                'payment_date' => $paymentDate,
                'amount' => $paymentAmount,
                'payment_method' => 'bank_transfer',
                'reference' => $data['reference'] ?? $bill->bill_number,
            ]);

            $bill->payments()->attach($supplierPayment->id, ['amount' => $paymentAmount]);

            $newBalance = round(((float) $bill->balance - $paymentAmount), 2);
            $bill->balance = $newBalance;
            $bill->status = $newBalance <= 0 ? 'paid' : 'partial';
            if (!empty($data['notes'])) {
                $existingNotes = (string) ($bill->notes ?? '');
                $bill->notes = trim($existingNotes . "\n" . 'Pago: ' . $data['notes']);
            }
            $bill->save();

            $bankAccount->current_balance = round(((float) $bankAccount->current_balance - $paymentAmount), 2);
            $bankAccount->save();

            BankTransaction::create([
                'company_id' => $companyId,
                'bank_account_id' => $bankAccount->id,
                'transaction_date' => $paymentDate,
                'transaction_type' => 'withdrawal',
                'amount' => $paymentAmount,
                'reference_number' => $data['reference'] ?? $supplierPayment->payment_number,
                'description' => 'Pago de factura de compra ' . $bill->bill_number,
                'counterparty_type' => 'supplier',
                'counterparty_id' => $bill->supplier_id,
                'created_by' => $request->user()?->id,
            ]);
        });

        $bill->refresh();
        $bill->load('supplier');

        AuditLogger::log(
            $request,
            (int) $companyId,
            'bill.pay',
            'bill',
            (string) $bill->id,
            'Pago aplicado a factura de compra',
            [
                'bill_number' => $bill->bill_number,
                'paid_amount' => $paymentAmount,
                'new_balance' => $bill->balance,
                'status' => $bill->status,
            ]
        );

        return response()->json([
            'message' => 'Pago aplicado correctamente',
            'bill' => $bill,
        ]);
    }

    private function syncInventoryFromDteItems(int $companyId, array $lines): void
    {
        foreach ($lines as $line) {
            $tipoItem = (int) ($line['tipoItem'] ?? 0);
            $isProduct = in_array($tipoItem, [1, 3, 4], true);
            if (!$isProduct) {
                continue;
            }

            $itemCode = trim((string) ($line['codigo'] ?? ''));
            if ($itemCode === '') {
                $itemCode = 'ITEM-' . (string) ($line['numItem'] ?? uniqid());
            }

            $description = trim((string) ($line['descripcion'] ?? 'Producto desde DTE'));
            $quantity = (float) ($line['cantidad'] ?? 0);
            if ($quantity <= 0) {
                $quantity = 1;
            }

            $unitCost = (float) ($line['precioUni'] ?? 0);
            if ($unitCost <= 0) {
                $lineTotal = (float) (($line['ventaGravada'] ?? 0) + ($line['ventaExenta'] ?? 0) + ($line['ventaNoSuj'] ?? 0));
                $unitCost = $lineTotal > 0 ? $lineTotal / $quantity : 0;
            }

            $item = InventoryItem::where('company_id', $companyId)
                ->where('item_code', $itemCode)
                ->first();

            if (!$item) {
                InventoryItem::create([
                    'company_id' => $companyId,
                    'item_code' => $itemCode,
                    'name' => mb_substr($description, 0, 255),
                    'description' => $description,
                    'unit_of_measure' => (string) ($line['uniMedida'] ?? 'UNI'),
                    'cost_method' => 'average',
                    'current_quantity' => $quantity,
                    'average_cost' => $unitCost,
                    'active' => true,
                ]);
                continue;
            }

            $oldQty = (float) $item->current_quantity;
            $oldCost = (float) $item->average_cost;
            $newQty = $oldQty + $quantity;

            if ($newQty > 0) {
                $item->average_cost = (($oldQty * $oldCost) + ($quantity * $unitCost)) / $newQty;
            }
            $item->current_quantity = $newQty;
            $item->save();
        }
    }

    public function destroy(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $bill = Bill::where('company_id', $companyId)->findOrFail($id);
        
        if ($bill->status !== 'draft') {
            return response()->json(['message' => 'Only draft bills can be deleted'], 400);
        }

        $billNumber = $bill->bill_number;
        $bill->delete();

        AuditLogger::log(
            $request,
            (int) $companyId,
            'bill.delete',
            'bill',
            (string) $id,
            'Factura de compra eliminada',
            [
                'bill_number' => $billNumber,
            ]
        );
        
        return response()->json(['message' => 'Bill deleted successfully']);
    }
}
