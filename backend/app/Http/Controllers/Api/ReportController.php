<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\JournalEntryLine;
use App\Models\AccountType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
