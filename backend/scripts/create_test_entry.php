<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Account;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;

$companyId = 1; // seeded demo company
$accounts = Account::where('company_id', $companyId)->where('is_detail', true)->take(2)->get();
if ($accounts->count() < 2) {
    echo "Not enough detail accounts found\n";
    exit(1);
}

$entry = JournalEntry::create([
    'company_id' => $companyId,
    'entry_date' => date('Y-m-d'),
    'entry_type' => 'PD',
    'description' => 'Prueba E2E',
    'status' => JournalEntry::STATUS_DRAFT,
    'created_by' => 1,
]);

JournalEntryLine::create([
    'journal_entry_id' => $entry->id,
    'account_id' => $accounts[0]->id,
    'debit' => 100.00,
    'credit' => 0.00,
    'description' => 'Cargo prueba',
    'line_number' => 1,
]);

JournalEntryLine::create([
    'journal_entry_id' => $entry->id,
    'account_id' => $accounts[1]->id,
    'debit' => 0.00,
    'credit' => 100.00,
    'description' => 'Abono prueba',
    'line_number' => 2,
]);

echo $entry->id . PHP_EOL;
