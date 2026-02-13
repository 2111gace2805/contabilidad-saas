<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\JournalEntry;
use Illuminate\Support\Facades\DB;

$id = $argv[1] ?? 1;
$entry = JournalEntry::with('lines')->find($id);
if (!$entry) {
    echo "Entry $id not found\n";
    exit(1);
}

try {
    if (strtoupper($entry->status) !== 'DRAFT') {
        throw new Exception('Solo se pueden contabilizar pólizas en borrador');
    }

    // validate period
    $entry->validateOpenPeriod();

    $totalDebit = $entry->lines->sum('debit');
    $totalCredit = $entry->lines->sum('credit');

    if (abs($totalDebit - $totalCredit) > 0.01) {
        throw new Exception('El debe y el haber deben estar cuadrados para contabilizar');
    }

    $fiscalYear = (int) date('Y', strtotime($entry->entry_date));

    DB::transaction(function () use ($entry, $fiscalYear) {
        $seq = DB::table('journal_entry_number_sequences')
            ->where('company_id', $entry->company_id)
            ->where('entry_type', $entry->entry_type)
            ->where('fiscal_year', $fiscalYear)
            ->lockForUpdate()
            ->first();

        if (!$seq) {
            $id = (string) \Illuminate\Support\Str::uuid();
            DB::table('journal_entry_number_sequences')->insert([
                'id' => $id,
                'company_id' => $entry->company_id,
                'entry_type' => $entry->entry_type,
                'fiscal_year' => $fiscalYear,
                'current_number' => 1,
                'prefix' => strtoupper($entry->entry_type),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $nextTypeNumber = 1;
        } else {
            $nextTypeNumber = $seq->current_number + 1;
            DB::table('journal_entry_number_sequences')
                ->where('id', $seq->id)
                ->update(['current_number' => $nextTypeNumber, 'updated_at' => now()]);
        }

        $prefix = strtoupper($entry->entry_type);
        $entryNumber = $prefix . '-' . str_pad($nextTypeNumber, 7, '0', STR_PAD_LEFT);

        $entry->update([
            'sequence_number' => null,
            'type_number' => $nextTypeNumber,
            'entry_number' => $entryNumber,
            'status' => JournalEntry::STATUS_POSTED,
            'posted_at' => now(),
        ]);
    });

    echo "Entry {$entry->id} posted successfully. entry_number={$entry->entry_number}\n";
} catch (Exception $e) {
    echo "Error posting entry: " . $e->getMessage() . "\n";
    exit(1);
}
