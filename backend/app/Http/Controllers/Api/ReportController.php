<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Bill;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InventoryItem;
use App\Models\JournalEntryLine;
use App\Models\AccountType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Support\AuditLogger;

class ReportController extends Controller
{
    private function getCompanyId(Request $request)
    {
        return $request->header('X-Company-Id');
    }

    public function balanceSheet(Request $request)
    {
        $companyId = $this->getCompanyId($request);
        
        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $date = $request->get('date', now()->format('Y-m-d'));

        $accounts = Account::where('company_id', $companyId)
            ->where('is_detail', true)
            ->with(['accountType'])
            ->get();

        $balances = [];
        foreach ($accounts as $account) {
            $debits = JournalEntryLine::where('account_id', $account->id)
                ->whereHas('journalEntry', function($q) use ($date) {
                    $q->where('status', 'posted')
                      ->where('entry_date', '<=', $date);
                })
                ->sum('debit');

            $credits = JournalEntryLine::where('account_id', $account->id)
                ->whereHas('journalEntry', function($q) use ($date) {
                    $q->where('status', 'posted')
                      ->where('entry_date', '<=', $date);
                })
                ->sum('credit');

            $balance = $debits - $credits;
            
            if ($balance != 0) {
                $balances[] = [
                    'account' => $account,
                    'balance' => $balance,
                ];
            }
        }

        return response()->json([
            'date' => $date,
            'balances' => $balances,
        ]);
    }

    public function cashFlow(Request $request)
    {
        $companyId = $this->getCompanyId($request);

        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $dateFrom = $request->get('date_from', now()->startOfYear()->format('Y-m-d'));
        $dateTo = $request->get('date_to', now()->format('Y-m-d'));

        $cashAccounts = Account::where('company_id', $companyId)
            ->where('is_detail', true)
            ->where(function ($q) {
                $q->where('code', '1101')->orWhere('code', '1102');
            })
            ->pluck('id');

        if ($cashAccounts->isEmpty()) {
            return response()->json([
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'items' => [],
            ]);
        }

        $lines = JournalEntryLine::whereIn('account_id', $cashAccounts)
            ->with(['account:id,code,name', 'journalEntry:id,entry_date,entry_number,description,status'])
            ->whereHas('journalEntry', function ($q) use ($dateFrom, $dateTo) {
                $q->where('status', 'posted')->whereBetween('entry_date', [$dateFrom, $dateTo]);
            })
            ->orderBy('line_number')
            ->get();

        $items = $lines->map(function ($line) {
            return [
                'entry_date' => $line->journalEntry->entry_date,
                'entry_number' => $line->journalEntry->entry_number,
                'description' => $line->description ?: $line->journalEntry->description,
                'account_code' => $line->account->code,
                'account_name' => $line->account->name,
                'inflow' => (float) $line->debit,
                'outflow' => (float) $line->credit,
            ];
        })->values();

        return response()->json([
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'items' => $items,
            'total_inflow' => $items->sum('inflow'),
            'total_outflow' => $items->sum('outflow'),
        ]);
    }

    public function journalBook(Request $request)
    {
        $companyId = $this->getCompanyId($request);

        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $dateFrom = $request->get('date_from', now()->startOfYear()->format('Y-m-d'));
        $dateTo = $request->get('date_to', now()->format('Y-m-d'));

        $lines = JournalEntryLine::with(['account:id,code,name', 'journalEntry:id,entry_date,entry_number,description,status'])
            ->whereHas('journalEntry', function ($q) use ($dateFrom, $dateTo) {
                $q->where('status', 'posted')->whereBetween('entry_date', [$dateFrom, $dateTo]);
            })
            ->get();

        $items = $lines->map(function ($line) {
            return [
                'entry_date' => $line->journalEntry->entry_date,
                'entry_number' => $line->journalEntry->entry_number,
                'description' => $line->description ?: $line->journalEntry->description,
                'account_code' => $line->account->code,
                'account_name' => $line->account->name,
                'debit' => (float) $line->debit,
                'credit' => (float) $line->credit,
            ];
        })->sortBy(['entry_date', 'entry_number'])->values();

        return response()->json([
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'items' => $items,
            'total_debit' => $items->sum('debit'),
            'total_credit' => $items->sum('credit'),
        ]);
    }

    public function accountsReceivable(Request $request)
    {
        $companyId = $this->getCompanyId($request);

        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $query = Invoice::where('company_id', $companyId)
            ->with(['customer:id,name,nit'])
            ->whereIn('status', ['pending', 'partial', 'overdue']);

        if ($request->filled('date_from')) {
            $query->whereDate('invoice_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('invoice_date', '<=', $request->date_to);
        }

        $items = $query->orderBy('invoice_date')->get()->map(function ($inv) {
            return [
                'invoice_number' => $inv->invoice_number,
                'invoice_date' => $inv->invoice_date,
                'due_date' => $inv->due_date,
                'customer' => $inv->customer?->name,
                'customer_tax_id' => $inv->customer?->nit,
                'total' => (float) $inv->total,
                'balance' => (float) $inv->balance,
                'status' => $inv->status,
            ];
        });

        return response()->json([
            'items' => $items,
            'total_balance' => $items->sum('balance'),
        ]);
    }

    public function purchaseBook(Request $request)
    {
        $companyId = $this->getCompanyId($request);

        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $query = Bill::where('company_id', $companyId)->with('supplier:id,name,rfc');

        if ($request->filled('date_from')) {
            $query->whereDate('bill_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('bill_date', '<=', $request->date_to);
        }

        $items = $query->orderBy('bill_date')->get()->map(function ($bill) {
            return [
                'invoice_date' => $bill->bill_date,
                'invoice_number' => $bill->bill_number,
                'supplier_name' => $bill->supplier?->name,
                'supplier_tax_id' => $bill->supplier?->rfc,
                'subtotal' => (float) $bill->subtotal,
                'tax_amount' => (float) $bill->tax,
                'total' => (float) $bill->total,
                'tax_name' => 'IVA',
            ];
        });

        return response()->json([
            'items' => $items,
            'total' => $items->sum('total'),
            'tax_total' => $items->sum('tax_amount'),
        ]);
    }

    public function salesBookConsumer(Request $request)
    {
        return $this->salesBookByProfile($request, ['consumidor_final']);
    }

    public function salesBookTaxpayer(Request $request)
    {
        return $this->salesBookByProfile($request, ['contribuyente', 'empresa']);
    }

    public function accountsPayable(Request $request)
    {
        $companyId = $this->getCompanyId($request);

        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $query = Bill::where('company_id', $companyId)
            ->with(['supplier:id,name,rfc'])
            ->whereIn('status', ['pending', 'partial', 'overdue']);

        if ($request->filled('date_from')) {
            $query->whereDate('bill_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('bill_date', '<=', $request->date_to);
        }

        $items = $query->orderBy('bill_date')->get()->map(function ($bill) {
            return [
                'bill_number' => $bill->bill_number,
                'bill_date' => $bill->bill_date,
                'due_date' => $bill->due_date,
                'supplier' => $bill->supplier?->name,
                'supplier_tax_id' => $bill->supplier?->rfc,
                'total' => (float) $bill->total,
                'balance' => (float) $bill->balance,
                'status' => $bill->status,
            ];
        });

        return response()->json([
            'items' => $items,
            'total_balance' => $items->sum('balance'),
        ]);
    }

    public function inventoryReport(Request $request)
    {
        $companyId = $this->getCompanyId($request);

        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $items = InventoryItem::where('company_id', $companyId)
            ->orderBy('item_code')
            ->get()
            ->map(function ($item) {
                return [
                    'item_code' => $item->item_code,
                    'name' => $item->name,
                    'unit_of_measure' => $item->unit_of_measure,
                    'current_quantity' => (float) $item->current_quantity,
                    'average_cost' => (float) $item->average_cost,
                    'value' => (float) $item->current_quantity * (float) $item->average_cost,
                ];
            });

        return response()->json([
            'items' => $items,
            'total_value' => $items->sum('value'),
        ]);
    }

    public function fiscalReport(Request $request)
    {
        $companyId = $this->getCompanyId($request);

        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $dateFrom = $request->get('date_from', now()->startOfMonth()->format('Y-m-d'));
        $dateTo = $request->get('date_to', now()->format('Y-m-d'));

        $ivaDebito = (float) Invoice::where('company_id', $companyId)
            ->whereBetween('invoice_date', [$dateFrom, $dateTo])
            ->sum('tax');

        $ivaCredito = (float) Bill::where('company_id', $companyId)
            ->whereBetween('bill_date', [$dateFrom, $dateTo])
            ->sum('tax');

        $income = (float) Invoice::where('company_id', $companyId)
            ->whereBetween('invoice_date', [$dateFrom, $dateTo])
            ->sum('subtotal');

        $expense = (float) Bill::where('company_id', $companyId)
            ->whereBetween('bill_date', [$dateFrom, $dateTo])
            ->sum('subtotal');

        $rentaBase = max(0, $income - $expense);
        $rentaEstimado = round($rentaBase * 0.30, 2);

        return response()->json([
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'iva_debito' => $ivaDebito,
            'iva_credito' => $ivaCredito,
            'iva_pagar' => $ivaDebito - $ivaCredito,
            'renta_base' => $rentaBase,
            'renta_estimado' => $rentaEstimado,
            'otros' => [
                'ventas_gravadas' => $income,
                'compras_gravadas' => $expense,
            ],
        ]);
    }

    public function export(Request $request, string $report, string $format)
    {
        $companyId = $this->getCompanyId($request);

        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $format = strtolower($format);
        if (!in_array($format, ['csv', 'excel', 'json', 'xml'])) {
            return response()->json(['message' => 'Formato no soportado'], 422);
        }

        $reportRequest = Request::createFrom($request);
        $reportRequest->headers->set('X-Company-Id', $companyId);

        $payload = match ($report) {
            'trial-balance' => $this->trialBalance($reportRequest)->getData(true),
            'balance-sheet' => $this->balanceSheet($reportRequest)->getData(true),
            'income-statement' => $this->incomeStatement($reportRequest)->getData(true),
            'purchase-book' => $this->purchaseBook($reportRequest)->getData(true),
            'sales-book-consumer' => $this->salesBookConsumer($reportRequest)->getData(true),
            'sales-book-taxpayer' => $this->salesBookTaxpayer($reportRequest)->getData(true),
            'cash-flow' => $this->cashFlow($reportRequest)->getData(true),
            'journal-book' => $this->journalBook($reportRequest)->getData(true),
            'general-ledger' => $this->generalLedger($reportRequest)->getData(true),
            'accounts-receivable' => $this->accountsReceivable($reportRequest)->getData(true),
            'accounts-payable' => $this->accountsPayable($reportRequest)->getData(true),
            'fiscal' => $this->fiscalReport($reportRequest)->getData(true),
            'inventory' => $this->inventoryReport($reportRequest)->getData(true),
            default => null,
        };

        if ($payload === null) {
            return response()->json(['message' => 'Reporte no soportado'], 422);
        }

        AuditLogger::log(
            $request,
            (int) $companyId,
            'report.export',
            'report',
            $report,
            'Exportación de reporte',
            ['report' => $report, 'format' => $format]
        );

        if ($format === 'json') {
            return response()->json($payload);
        }

        if ($format === 'xml') {
            $xml = new \SimpleXMLElement('<report/>');
            $this->arrayToXml($payload, $xml);

            return response($xml->asXML(), 200, [
                'Content-Type' => 'application/xml',
                'Content-Disposition' => 'attachment; filename="' . $report . '.xml"',
            ]);
        }

        $rows = $this->flattenRows($payload);
        $csv = $this->buildCsv($rows);
        $filename = $report . ($format === 'excel' ? '.xls' : '.csv');

        return response($csv, 200, [
            'Content-Type' => $format === 'excel' ? 'application/vnd.ms-excel' : 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    private function flattenRows(array $payload): array
    {
        $candidateKeys = ['items', 'balances', 'transactions'];
        foreach ($candidateKeys as $key) {
            if (isset($payload[$key]) && is_array($payload[$key])) {
                return array_map(function ($row) {
                    if (isset($row['account']) && is_array($row['account'])) {
                        $row['account_code'] = $row['account']['code'] ?? null;
                        $row['account_name'] = $row['account']['name'] ?? null;
                        unset($row['account']);
                    }
                    return $row;
                }, $payload[$key]);
            }
        }

        return [
            collect($payload)
                ->reject(fn($v) => is_array($v))
                ->toArray(),
        ];
    }

    private function buildCsv(array $rows): string
    {
        if (empty($rows)) {
            return "Sin datos\n";
        }

        $headers = array_keys((array) $rows[0]);
        $stream = fopen('php://temp', 'r+');
        fputcsv($stream, $headers);

        foreach ($rows as $row) {
            $line = [];
            foreach ($headers as $h) {
                $line[] = is_array($row[$h] ?? null) ? json_encode($row[$h], JSON_UNESCAPED_UNICODE) : $row[$h] ?? null;
            }
            fputcsv($stream, $line);
        }

        rewind($stream);
        $csv = stream_get_contents($stream);
        fclose($stream);

        return $csv ?: '';
    }

    private function arrayToXml(array $data, \SimpleXMLElement $xml): void
    {
        foreach ($data as $key => $value) {
            $nodeName = is_numeric($key) ? 'item' : preg_replace('/[^a-zA-Z0-9_\-]/', '_', (string) $key);
            if (is_array($value)) {
                $subnode = $xml->addChild($nodeName);
                $this->arrayToXml($value, $subnode);
            } else {
                $xml->addChild($nodeName, htmlspecialchars((string) $value));
            }
        }
    }

    private function salesBookByProfile(Request $request, array $profiles)
    {
        $companyId = $this->getCompanyId($request);

        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $query = Invoice::where('company_id', $companyId)
            ->with('customer:id,name,nit,profile_type');

        if ($request->filled('date_from')) {
            $query->whereDate('invoice_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('invoice_date', '<=', $request->date_to);
        }

        $invoices = $query->orderBy('invoice_date')->get()->filter(function ($invoice) use ($profiles) {
            $profileType = strtolower((string) ($invoice->customer?->profile_type ?? ''));
            return empty($profiles) || in_array($profileType, $profiles, true);
        });

        $items = $invoices->map(function ($invoice) {
            return [
                'invoice_date' => $invoice->invoice_date,
                'invoice_number' => $invoice->invoice_number,
                'customer_name' => $invoice->customer?->name,
                'customer_tax_id' => $invoice->customer?->nit,
                'subtotal' => (float) $invoice->subtotal,
                'tax_amount' => (float) $invoice->tax,
                'total' => (float) $invoice->total,
                'tax_name' => 'IVA',
            ];
        })->values();

        return response()->json([
            'items' => $items,
            'total' => $items->sum('total'),
            'tax_total' => $items->sum('tax_amount'),
        ]);
    }

    public function incomeStatement(Request $request)
    {
        $companyId = $this->getCompanyId($request);
        
        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $dateFrom = $request->get('date_from', now()->startOfYear()->format('Y-m-d'));
        $dateTo = $request->get('date_to', now()->format('Y-m-d'));

        $accounts = Account::where('company_id', $companyId)
            ->where('is_detail', true)
            ->with(['accountType'])
            ->whereHas('accountType', function($q) {
                $q->where('affects_results', true);
            })
            ->get();

        $balances = [];
        foreach ($accounts as $account) {
            $debits = JournalEntryLine::where('account_id', $account->id)
                ->whereHas('journalEntry', function($q) use ($dateFrom, $dateTo) {
                    $q->where('status', 'posted')
                      ->whereBetween('entry_date', [$dateFrom, $dateTo]);
                })
                ->sum('debit');

            $credits = JournalEntryLine::where('account_id', $account->id)
                ->whereHas('journalEntry', function($q) use ($dateFrom, $dateTo) {
                    $q->where('status', 'posted')
                      ->whereBetween('entry_date', [$dateFrom, $dateTo]);
                })
                ->sum('credit');

            $balance = $credits - $debits;
            
            if ($balance != 0) {
                $balances[] = [
                    'account' => $account,
                    'balance' => $balance,
                ];
            }
        }

        return response()->json([
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'balances' => $balances,
        ]);
    }

    public function trialBalance(Request $request)
    {
        $companyId = $this->getCompanyId($request);
        
        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $date = $request->get('date', now()->format('Y-m-d'));

        $accounts = Account::where('company_id', $companyId)
            ->where('is_detail', true)
            ->with(['accountType'])
            ->orderBy('code')
            ->get();

        $balances = [];
        $totalDebits = 0;
        $totalCredits = 0;

        foreach ($accounts as $account) {
            $debits = JournalEntryLine::where('account_id', $account->id)
                ->whereHas('journalEntry', function($q) use ($date) {
                    $q->where('status', 'posted')
                      ->where('entry_date', '<=', $date);
                })
                ->sum('debit');

            $credits = JournalEntryLine::where('account_id', $account->id)
                ->whereHas('journalEntry', function($q) use ($date) {
                    $q->where('status', 'posted')
                      ->where('entry_date', '<=', $date);
                })
                ->sum('credit');

            if ($debits > 0 || $credits > 0) {
                $balances[] = [
                    'account' => $account,
                    'debits' => $debits,
                    'credits' => $credits,
                    'balance' => $debits - $credits,
                ];
                
                $totalDebits += $debits;
                $totalCredits += $credits;
            }
        }

        return response()->json([
            'date' => $date,
            'balances' => $balances,
            'total_debits' => $totalDebits,
            'total_credits' => $totalCredits,
        ]);
    }

    public function generalLedger(Request $request)
    {
        $companyId = $this->getCompanyId($request);
        
        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $accountId = $request->get('account_id');
        $dateFrom = $request->get('date_from', now()->startOfMonth()->format('Y-m-d'));
        $dateTo = $request->get('date_to', now()->format('Y-m-d'));

        if (!$accountId) {
            return response()->json(['message' => 'Account ID required'], 400);
        }

        $account = Account::where('company_id', $companyId)->findOrFail($accountId);

        $entries = JournalEntryLine::where('account_id', $accountId)
            ->whereHas('journalEntry', function($q) use ($dateFrom, $dateTo) {
                $q->where('status', 'posted')
                  ->whereBetween('entry_date', [$dateFrom, $dateTo]);
            })
            ->with(['journalEntry'])
            ->orderBy('created_at')
            ->get();

        $runningBalance = 0;
        $transactions = [];

        foreach ($entries as $entry) {
            $runningBalance += ($entry->debit - $entry->credit);
            
            $transactions[] = [
                'date' => $entry->journalEntry->entry_date,
                'entry_number' => $entry->journalEntry->entry_number,
                'description' => $entry->description ?? $entry->journalEntry->description,
                'debit' => $entry->debit,
                'credit' => $entry->credit,
                'balance' => $runningBalance,
            ];
        }

        return response()->json([
            'account' => $account,
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'transactions' => $transactions,
        ]);
    }
}
