<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InvoiceCorrelativesSeeder extends Seeder
{
    public function run(): void
    {
        $companies = DB::table('companies')->pluck('id');

        foreach ($companies as $companyId) {
            $mainBranch = DB::table('branches')
                ->where('company_id', $companyId)
                ->where('type', 'casa_matriz')
                ->orderBy('mh_code')
                ->first();

            if (!$mainBranch) {
                continue;
            }

            $documentTypes = DB::table('document_types')
                ->where('company_id', $companyId)
                ->pluck('id');

            foreach ($documentTypes as $documentTypeId) {
                $exists = DB::table('invoice_correlatives')
                    ->where('company_id', $companyId)
                    ->where('document_type_id', $documentTypeId)
                    ->where('branch_id', $mainBranch->id)
                    ->exists();

                if (!$exists) {
                    DB::table('invoice_correlatives')->insert([
                        'company_id' => $companyId,
                        'document_type_id' => $documentTypeId,
                        'branch_id' => $mainBranch->id,
                        'next_number' => 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }
}
