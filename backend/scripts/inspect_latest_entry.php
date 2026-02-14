<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\JournalEntry;

$entry = JournalEntry::where('company_id', 1)->orderBy('id', 'desc')->with('lines.account')->first();
if (!$entry) {
    echo "No entry found\n";
    exit(1);
}

echo "ID: " . $entry->id . PHP_EOL;
echo "Status: " . $entry->status . PHP_EOL;
echo "Entry number: " . ($entry->entry_number ?? '') . PHP_EOL;
echo "Type number: " . ($entry->type_number ?? '') . PHP_EOL;
echo "Lines:\n";
foreach ($entry->lines as $line) {
    echo " - account_id=" . $line->account_id . " debit=" . $line->debit . " credit=" . $line->credit . "\n";
}
