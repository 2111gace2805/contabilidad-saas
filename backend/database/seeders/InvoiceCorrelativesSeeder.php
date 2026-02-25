<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class InvoiceCorrelativesSeeder extends Seeder
{
    public function run(): void
    {
        if (!Schema::hasTable('branches') || !Schema::hasTable('document_types') || !Schema::hasTable('invoice_correlatives')) {
            $this->command?->warn('InvoiceCorrelativesSeeder omitido: tablas requeridas no disponibles.');
            return;
        }

        $hasType = Schema::hasColumn('branches', 'type');
        $hasMhCode = Schema::hasColumn('branches', 'mh_code');
        $hasCode = Schema::hasColumn('branches', 'code');

        $companies = DB::table('companies')->pluck('id');

        foreach ($companies as $companyId) {
            $mainBranch = null;

            if ($hasType) {
                $mainBranchQuery = DB::table('branches')
                    ->where('company_id', $companyId)
                    ->where('type', 'casa_matriz');

                if ($hasMhCode) {
                    $mainBranchQuery->orderBy('mh_code');
                }

                $mainBranch = $mainBranchQuery->first();
            }

            if (!$mainBranch && $hasCode) {
                $mainBranch = DB::table('branches')
                    ->where('company_id', $companyId)
                    ->where('code', 'M001-P001')
                    ->first();
            }

            if (!$mainBranch) {
                $fallbackQuery = DB::table('branches')->where('company_id', $companyId);
                if ($hasMhCode) {
                    $fallbackQuery->orderBy('mh_code');
                }
                $mainBranch = $fallbackQuery->first();
            }

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
