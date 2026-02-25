<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Customer;
use App\Models\CompanyPreference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class InvoiceController extends Controller
{
    private function getCompanyId(Request $request)
    {
        return $request->header('X-Company-Id');
    }

    private function resolveCustomerId(int $companyId, array &$data): ?int
    {
        if (!empty($data['customer_id'])) {
            $customer = Customer::where('company_id', $companyId)
                ->where('id', $data['customer_id'])
                ->first();

            if (!$customer) {
                return null;
            }

            if (empty($data['customer_name_snapshot'])) {
                $data['customer_name_snapshot'] = $customer->name;
            }
            if (empty($data['customer_tax_id_snapshot'])) {
                $data['customer_tax_id_snapshot'] = $customer->nit;
            }
            if (empty($data['customer_phone_snapshot'])) {
                $data['customer_phone_snapshot'] = $customer->phone;
            }
            if (empty($data['customer_email_snapshot'])) {
                $data['customer_email_snapshot'] = $customer->email1 ?? $customer->email;
            }
            if (empty($data['customer_address_snapshot'])) {
                $data['customer_address_snapshot'] = $customer->address;
            }

            return (int) $customer->id;
        }

        $name = trim((string) ($data['customer_name_snapshot'] ?? ''));
        $taxId = trim((string) ($data['customer_tax_id_snapshot'] ?? ''));

        if ($name === '' && $taxId === '') {
            return null;
        }

        $existing = Customer::where('company_id', $companyId)
            ->where(function ($query) use ($name, $taxId) {
                if ($taxId !== '') {
                    $query->orWhere('nit', $taxId)->orWhere('rfc', $taxId);
                }
                if ($name !== '') {
                    $query->orWhere('name', $name);
                }
            })
            ->first();

        if ($existing) {
            return (int) $existing->id;
        }

        $generatedCode = 'CLI-AUTO-' . strtoupper(substr(md5($name . $taxId . now()->timestamp), 0, 8));
        $created = Customer::create([
            'company_id' => $companyId,
            'code' => $generatedCode,
            'name' => $name !== '' ? $name : 'Cliente desde DTE',
            'business_name' => $name !== '' ? $name : null,
            'profile_type' => 'juridical',
            'nit' => $taxId !== '' ? $taxId : null,
            'rfc' => $taxId !== '' ? $taxId : null,
            'phone' => $data['customer_phone_snapshot'] ?? null,
            'email1' => $data['customer_email_snapshot'] ?? null,
            'email' => $data['customer_email_snapshot'] ?? null,
            'address' => $data['customer_address_snapshot'] ?? null,
            'credit_days' => 30,
            'credit_limit' => 0,
            'active' => true,
        ]);

        return (int) $created->id;
    }

    private function normalizeTipoDte(?string $tipoDte): string
    {
        $raw = preg_replace('/\D/', '', (string) $tipoDte);
        if ($raw === null || $raw === '') {
            return '';
        }

        return str_pad(substr($raw, -2), 2, '0', STR_PAD_LEFT);
    }

    private function getDteControlCodes(int $companyId): array
    {
        $preference = CompanyPreference::firstOrCreate(
            ['company_id' => $companyId],
            [
                'primary_color' => 'slate',
                'dte_establishment_code' => 'M001',
                'dte_point_of_sale_code' => 'P001',
            ]
        );

        $establishment = strtoupper((string) ($preference->dte_establishment_code ?: 'M001'));
        $pointOfSale = strtoupper((string) ($preference->dte_point_of_sale_code ?: 'P001'));

        if (!preg_match('/^[A-Z][0-9]{3}$/', $establishment)) {
            $establishment = 'M001';
        }
        if (!preg_match('/^[P][0-9]{3}$/', $pointOfSale)) {
            $pointOfSale = 'P001';
        }

        return [$establishment, $pointOfSale];
    }

    private function nextDteCorrelative(int $companyId, string $tipoDte, string $establishment, string $pointOfSale): string
    {
        $prefix = sprintf('DTE-%s-%s%s-', $tipoDte, $establishment, $pointOfSale);
        $pattern = '/^DTE\-' . preg_quote($tipoDte, '/') . '\-' . preg_quote($establishment . $pointOfSale, '/') . '\-(\d{15})$/';

        $maxCorrelative = Invoice::where('company_id', $companyId)
            ->where('invoice_number', 'like', $prefix . '%')
            ->pluck('invoice_number')
            ->reduce(function (int $carry, string $value) use ($pattern) {
                if (preg_match($pattern, $value, $matches)) {
                    $number = (int) $matches[1];
                    return $number > $carry ? $number : $carry;
                }

                return $carry;
            }, 0);

        return str_pad((string) ($maxCorrelative + 1), 15, '0', STR_PAD_LEFT);
    }

    private function buildDteInvoiceNumber(int $companyId, string $tipoDte): string
    {
        [$establishment, $pointOfSale] = $this->getDteControlCodes($companyId);
        $correlative = $this->nextDteCorrelative($companyId, $tipoDte, $establishment, $pointOfSale);

        return sprintf('DTE-%s-%s%s-%s', $tipoDte, $establishment, $pointOfSale, $correlative);
    }

    private function isValidDteInvoiceNumber(string $invoiceNumber, string $tipoDte, string $establishment, string $pointOfSale): bool
    {
        $pattern = '/^DTE\-' . preg_quote($tipoDte, '/') . '\-' . preg_quote($establishment . $pointOfSale, '/') . '\-\d{15}$/';
        return (bool) preg_match($pattern, strtoupper($invoiceNumber));
    }

    public function index(Request $request)
    {
        $companyId = $this->getCompanyId($request);
        
        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $query = Invoice::where('company_id', $companyId)
            ->with(['customer', 'paymentMethod']);

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
            'customer_id' => 'nullable|exists:customers,id',
            'payment_method_id' => 'nullable|exists:payment_methods,id',
            'invoice_number' => 'nullable|string|max:50',
            'invoice_date' => 'required|date',
            'due_date' => 'nullable|date',
            'subtotal' => 'required|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'balance' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:draft,pending,partial,paid,overdue,void,cancelled,issued',
            'notes' => 'nullable|string',
            'tipo_dte' => 'required|string|max:5',
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
            'customer_name_snapshot' => 'nullable|string|max:255',
            'customer_tax_id_snapshot' => 'nullable|string|max:50',
            'customer_phone_snapshot' => 'nullable|string|max:50',
            'customer_email_snapshot' => 'nullable|string|max:255',
            'customer_address_snapshot' => 'nullable|string',
            'is_fiscal_credit' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        $data['tipo_dte'] = $this->normalizeTipoDte($data['tipo_dte'] ?? '');
        if ($data['tipo_dte'] === '') {
            return response()->json(['message' => 'tipo_dte inválido. Debe ser un código numérico de 2 dígitos.'], 422);
        }

        [$establishment, $pointOfSale] = $this->getDteControlCodes((int) $companyId);

        if (empty($data['invoice_number'])) {
            $data['invoice_number'] = $this->buildDteInvoiceNumber((int) $companyId, $data['tipo_dte']);
        }

        $data['invoice_number'] = strtoupper((string) $data['invoice_number']);
        if (!$this->isValidDteInvoiceNumber($data['invoice_number'], $data['tipo_dte'], $establishment, $pointOfSale)) {
            return response()->json([
                'message' => 'Formato inválido de número de factura. Debe cumplir: DTE-{tipo_dte}-' . $establishment . $pointOfSale . '-{15 dígitos}',
            ], 422);
        }

        $data['dte_numero_control'] = $data['invoice_number'];

        if (empty($data['due_date'])) {
            $data['due_date'] = $data['invoice_date'];
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

        $resolvedCustomerId = $this->resolveCustomerId((int) $companyId, $data);
        if ($resolvedCustomerId === null && empty($data['customer_name_snapshot'])) {
            return response()->json(['message' => 'Customer data required (customer_id or customer snapshot)'], 422);
        }
        $data['customer_id'] = $resolvedCustomerId;

        $data['company_id'] = $companyId;

        $invoice = Invoice::create($data);
        $invoice->load(['customer', 'paymentMethod']);
        
        return response()->json($invoice, 201);
    }

    public function show(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $invoice = Invoice::where('company_id', $companyId)
            ->with(['customer', 'paymentMethod', 'payments'])
            ->findOrFail($id);
        
        return response()->json($invoice);
    }

    public function update(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $invoice = Invoice::where('company_id', $companyId)->findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'customer_id' => 'nullable|exists:customers,id',
            'payment_method_id' => 'nullable|exists:payment_methods,id',
            'invoice_number' => 'sometimes|required|string|max:50',
            'invoice_date' => 'sometimes|required|date',
            'due_date' => 'nullable|date',
            'subtotal' => 'sometimes|required|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'total' => 'sometimes|required|numeric|min:0',
            'balance' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:draft,pending,partial,paid,overdue,void,cancelled,issued',
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
            'customer_name_snapshot' => 'nullable|string|max:255',
            'customer_tax_id_snapshot' => 'nullable|string|max:50',
            'customer_phone_snapshot' => 'nullable|string|max:50',
            'customer_email_snapshot' => 'nullable|string|max:255',
            'customer_address_snapshot' => 'nullable|string',
            'is_fiscal_credit' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if (array_key_exists('tipo_dte', $data)) {
            $data['tipo_dte'] = $this->normalizeTipoDte($data['tipo_dte']);
            if ($data['tipo_dte'] === '') {
                return response()->json(['message' => 'tipo_dte inválido. Debe ser un código numérico de 2 dígitos.'], 422);
            }
        }

        [$establishment, $pointOfSale] = $this->getDteControlCodes((int) $companyId);
        $tipoDteToValidate = $data['tipo_dte'] ?? $invoice->tipo_dte;
        if (is_string($tipoDteToValidate)) {
            $tipoDteToValidate = $this->normalizeTipoDte($tipoDteToValidate);
        }

        if (array_key_exists('invoice_number', $data) && !empty($data['invoice_number']) && !empty($tipoDteToValidate)) {
            $data['invoice_number'] = strtoupper((string) $data['invoice_number']);
            if (!$this->isValidDteInvoiceNumber($data['invoice_number'], (string) $tipoDteToValidate, $establishment, $pointOfSale)) {
                return response()->json([
                    'message' => 'Formato inválido de número de factura. Debe cumplir: DTE-{tipo_dte}-' . $establishment . $pointOfSale . '-{15 dígitos}',
                ], 422);
            }

            $data['dte_numero_control'] = $data['invoice_number'];
        }

        if (array_key_exists('customer_id', $data) || array_key_exists('customer_name_snapshot', $data) || array_key_exists('customer_tax_id_snapshot', $data)) {
            $resolvedCustomerId = $this->resolveCustomerId((int) $companyId, $data);
            $data['customer_id'] = $resolvedCustomerId;
        }

        if (array_key_exists('tipo_dte', $data) && !array_key_exists('is_fiscal_credit', $data)) {
            $data['is_fiscal_credit'] = ($data['tipo_dte'] ?? null) === '03';
        }

        $invoice->update($data);
        $invoice->load(['customer', 'paymentMethod']);
        
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
