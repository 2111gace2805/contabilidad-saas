<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InvoiceSequencesSeeder extends Seeder
{
    public function run(): void
    {
        $year = date('Y');

        $companies = DB::table('companies')->pluck('id');

        foreach ($companies as $companyId) {
            $exists = DB::table('invoice_sequences')
                ->where('company_id', $companyId)
                ->where('fiscal_year', $year)
                ->exists();

            if (!$exists) {
                DB::table('invoice_sequences')->insert([
                    'id' => (string) Str::uuid(),
                    'company_id' => $companyId,
                    'fiscal_year' => $year,
                    'prefix' => 'F',
                    'current_number' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
