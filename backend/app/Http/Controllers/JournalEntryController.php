<?php

namespace App\Http\Controllers;

use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class JournalEntryController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'date' => 'required|date',
            'description' => 'nullable|string',
            'lines' => 'required|array|min:2',
            'lines.*.account_id' => 'required|exists:accounts,id',
            'lines.*.debit' => 'required_without:lines.*.credit|numeric|min:0',
            'lines.*.credit' => 'required_without:lines.*.debit|numeric|min:0',
            'lines.*.description' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated) {
            $journalEntry = JournalEntry::create([
                'company_id' => $validated['company_id'],
                'date' => $validated['date'],
                'description' => $validated['description'],
                'status' => 'DRAFT',
            ]);

            foreach ($validated['lines'] as $line) {
                $journalEntry->lines()->create($line);
            }

            $journalEntry->validateOpenPeriod();

            if ($journalEntry->lines->sum('debit') !== $journalEntry->lines->sum('credit')) {
                throw new \Exception('The journal entry is not balanced.');
            }
        });

        return response()->json(['message' => 'Journal entry created successfully.'], 201);
    }

    public function post($id)
    {
        $journalEntry = JournalEntry::findOrFail($id);

        if ($journalEntry->status !== 'DRAFT') {
            return response()->json(['message' => 'Only draft journal entries can be posted.'], 400);
        }

        $journalEntry->validateOpenPeriod();

        if ($journalEntry->lines->sum('debit') !== $journalEntry->lines->sum('credit')) {
            return response()->json(['message' => 'The journal entry is not balanced.'], 400);
        }

        $journalEntry->update(['status' => 'POSTED']);

        return response()->json(['message' => 'Journal entry posted successfully.']);
    }
}