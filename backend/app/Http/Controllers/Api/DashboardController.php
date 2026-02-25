<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Supplier;
use App\Models\Invoice;
use App\Models\Bill;
use App\Models\JournalEntry;
use App\Models\Account;
use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
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

        $receivableStatuses = ['issued', 'pending', 'partial', 'overdue'];
        $payableStatuses = ['received', 'pending', 'partial', 'overdue'];

        $receivables = Invoice::where('company_id', $companyId)
            ->whereIn('status', $receivableStatuses)
            ->sum(DB::raw('COALESCE(balance, total)'));

        $payables = Bill::where('company_id', $companyId)
            ->whereIn('status', $payableStatuses)
            ->sum(DB::raw('COALESCE(balance, total)'));

        $inventoryValue = InventoryItem::where('company_id', $companyId)
            ->where('active', true)
            ->selectRaw('COALESCE(SUM(current_quantity * average_cost), 0) as total')
            ->value('total') ?? 0;

        $financialRows = DB::table('journal_entry_lines as l')
            ->join('journal_entries as je', 'je.id', '=', 'l.journal_entry_id')
            ->join('accounts as a', 'a.id', '=', 'l.account_id')
            ->join('account_types as at', 'at.id', '=', 'a.account_type_id')
            ->where('je.company_id', $companyId)
            ->where('je.status', JournalEntry::STATUS_POSTED)
            ->selectRaw('at.code as type_code, at.nature as nature, SUM(l.debit) as debit_sum, SUM(l.credit) as credit_sum')
            ->groupBy('at.code', 'at.nature')
            ->get();

        $totals = [
            'assets' => 0.0,
            'liabilities' => 0.0,
            'equity' => 0.0,
            'revenue' => 0.0,
            'expenses' => 0.0,
        ];

        foreach ($financialRows as $row) {
            $debit = (float) $row->debit_sum;
            $credit = (float) $row->credit_sum;
            $nature = (string) $row->nature;
            $signed = $nature === 'deudora' ? ($debit - $credit) : ($credit - $debit);

            switch ((string) $row->type_code) {
                case '1':
                    $totals['assets'] += $signed;
                    break;
                case '2':
                    $totals['liabilities'] += $signed;
                    break;
                case '3':
                    $totals['equity'] += $signed;
                    break;
                case '4':
                    $totals['revenue'] += $signed;
                    break;
                case '5':
                case '6':
                    $totals['expenses'] += $signed;
                    break;
            }
        }

        $stats = [
            'total_assets' => round($totals['assets'], 2),
            'total_liabilities' => round($totals['liabilities'], 2),
            'equity' => round($totals['equity'], 2),
            'revenue' => round($totals['revenue'], 2),
            'expenses' => round($totals['expenses'], 2),
            'net_income' => round($totals['revenue'] - $totals['expenses'], 2),
            'receivables' => round((float) $receivables, 2),
            'payables' => round((float) $payables, 2),
            'inventory_value' => round((float) $inventoryValue, 2),
            'journal_entries_count' => JournalEntry::where('company_id', $companyId)
                ->where('status', JournalEntry::STATUS_POSTED)
                ->count(),
            'pending_voids_count' => JournalEntry::where('company_id', $companyId)
                ->where('status', JournalEntry::STATUS_PENDING_VOID)
                ->count(),
            'customers' => Customer::where('company_id', $companyId)->where('active', true)->count(),
            'suppliers' => Supplier::where('company_id', $companyId)->where('active', true)->count(),
            'accounts' => Account::where('company_id', $companyId)->where('active', true)->count(),
        ];
        
        return response()->json($stats);
    }

    public function summary(Request $request)
    {
        $companyId = $this->getCompanyId($request);
        
        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $accountsByType = DB::table('accounts')
            ->join('account_types', 'accounts.account_type_id', '=', 'account_types.id')
            ->where('accounts.company_id', $companyId)
            ->select('account_types.name', DB::raw('count(*) as count'))
            ->groupBy('account_types.name')
            ->get();

        $journalEntriesByStatus = JournalEntry::where('company_id', $companyId)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        return response()->json([
            'accounts_by_type' => $accountsByType,
            'journal_entries_by_status' => $journalEntriesByStatus,
        ]);
    }
}
