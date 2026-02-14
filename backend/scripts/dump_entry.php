<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\JournalEntry;

$entry = JournalEntry::where('company_id', 1)->orderBy('id', 'desc')->with('lines')->first();
if (!$entry) { echo "No entry\n"; exit(1);} 
print_r($entry->toArray());
