<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class JournalEntrySequencesSeeder extends Seeder
{
    public function run(): void
    {
        // No initial sequences by default. Create a placeholder for demo companies if needed.
        // Example: DB::table('journal_entry_sequences')->insert([
        //     'id' => (string) Str::uuid(),
        //     'company_id' => '00000000-0000-0000-0000-000000000000',
        //     'entry_type' => 'PD',
        //     'fiscal_year' => date('Y'),
        //     'current_number' => 0,
        //     'prefix' => 'PD',
        //     'created_at' => now(),
        //     'updated_at' => now(),
        // ]);
    }
}
