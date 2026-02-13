<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class JournalEntryNumberSequencesSeeder extends Seeder
{
    public function run(): void
    {
        $year = date('Y');

        $companies = DB::table('companies')->pluck('id');

        foreach ($companies as $companyId) {
            $types = DB::table('journal_entry_types')->where('company_id', $companyId)->pluck('code');

            foreach ($types as $type) {
                $max = DB::table('journal_entries')
                    ->where('company_id', $companyId)
                    ->where('entry_type', $type)
                    ->whereYear('entry_date', $year)
                    ->max('type_number');

                $current = $max ? (int) $max : 0;

                $exists = DB::table('journal_entry_number_sequences')
                    ->where('company_id', $companyId)
                    ->where('entry_type', $type)
                    ->where('fiscal_year', $year)
                    ->exists();

                if ($exists) {
                    DB::table('journal_entry_number_sequences')
                        ->where('company_id', $companyId)
                        ->where('entry_type', $type)
                        ->where('fiscal_year', $year)
                        ->update(['current_number' => $current, 'updated_at' => now()]);
                } else {
                    DB::table('journal_entry_number_sequences')->insert([
                        'id' => (string) Str::uuid(),
                        'company_id' => $companyId,
                        'entry_type' => $type,
                        'fiscal_year' => $year,
                        'current_number' => $current,
                        'prefix' => strtoupper($type),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }
}
