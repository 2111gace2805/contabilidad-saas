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

        $stats = [
            'customers' => Customer::where('company_id', $companyId)->where('active', true)->count(),
            'suppliers' => Supplier::where('company_id', $companyId)->where('active', true)->count(),
            'accounts' => Account::where('company_id', $companyId)->where('active', true)->count(),
            'journal_entries' => JournalEntry::where('company_id', $companyId)->count(),
            
            'receivables' => [
                'total' => Invoice::where('company_id', $companyId)
                    ->whereIn('status', ['issued'])
                    ->sum('total'),
                'overdue' => Invoice::where('company_id', $companyId)
                    ->where('status', 'issued')
                    ->where('due_date', '<', now())
                    ->sum('total'),
            ],
            
            'payables' => [
                'total' => Bill::where('company_id', $companyId)
                    ->whereIn('status', ['received'])
                    ->sum('total'),
                'overdue' => Bill::where('company_id', $companyId)
                    ->where('status', 'received')
                    ->where('due_date', '<', now())
                    ->sum('total'),
            ],
            
            'recent_entries' => JournalEntry::where('company_id', $companyId)
                ->with(['creator', 'lines.account'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(),
                
            'recent_invoices' => Invoice::where('company_id', $companyId)
                ->with(['customer'])
                ->orderBy('invoice_date', 'desc')
                ->limit(5)
                ->get(),
                
            'recent_bills' => Bill::where('company_id', $companyId)
                ->with(['supplier'])
                ->orderBy('bill_date', 'desc')
                ->limit(5)
                ->get(),
                
            'pending_voids_count' => JournalEntry::where('company_id', $companyId)
                ->where('status', JournalEntry::STATUS_PENDING_VOID)
                ->count(),
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
