<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

/**
 * Imports the raw SQL catalog published in documentacion/database_contablidad_facelectronica.sql.
 *
 * This seeder is intentionally lightweight: it just feeds the SQL file to MySQL so
 * the contabilidad.* catalog tables are created with their source data. It is
 * safe to re-run; if the tables already exist the import is skipped.
 */
class GlobalCatalogsSqlOnlySeeder extends Seeder
{
    public function run(): void
    {
        $path = $this->resolveSqlPath();

        if (!$path) {
            return;
        }

        // If the main catalog table already exists, assume the SQL was imported previously.
        if (Schema::hasTable('block_dtes')) {
            $this->command?->info('Global catalog tables already present; skipping raw SQL import.');
            return;
        }

        $sql = File::get($path);

        $statements = array_filter(array_map('trim', preg_split('/;\s*(?:\r?\n|$)/', $sql)));

        Schema::disableForeignKeyConstraints();

        foreach ($statements as $statement) {
            if ($statement === '' || str_starts_with($statement, '##')) {
                continue;
            }

            try {
                DB::unprepared($statement . ';');
            } catch (\Throwable $e) {
                $message = $e->getMessage();

                // Ignore duplicate object creation errors so the import is idempotent.
                if (str_contains($message, 'already exists')) {
                    $this->command?->warn('Skipping existing object for statement: ' . $this->statementLabel($statement));
                    continue;
                }

                throw $e;
            }
        }

        Schema::enableForeignKeyConstraints();

        $this->command?->info('Imported global catalog SQL from ' . $path);
    }

    private function resolveSqlPath(): ?string
    {
        $candidates = [
            base_path('../documentacion/database_contablidad_facelectronica.sql'), // prefer repository root copy (full data)
            base_path('documentacion/database_contablidad_facelectronica.sql'),
        ];

        $found = [];

        foreach ($candidates as $candidate) {
            if (File::exists($candidate)) {
                $found[$candidate] = File::size($candidate);
            }
        }

        if ($found) {
            arsort($found); // pick the largest available file (root copy has the full catalogs)
            $best = array_key_first($found);

            return realpath($best) ?: $best;
        }

        $this->command?->error('Global catalog SQL file not found. Expected at documentacion/database_contablidad_facelectronica.sql');

        return null;
    }

    private function statementLabel(string $statement): string
    {
        $normalized = preg_replace('/\s+/', ' ', trim($statement));

        return mb_substr($normalized, 0, 80) . (strlen($normalized) > 80 ? '…' : '');
    }

}
