<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

class GlobalCatalogsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * This seeder imports the raw SQL catalogs and also hydrates our normalized
     * lookup tables (`departments`, `municipalities`, `districts`, `economic_activities`).
     */
    public function run(): void
    {
        $path = $this->resolveSqlPath();

        if (!$path) {
            return;
        }

        // Ensure the raw contabilidad.* tables exist.
        $this->call(GlobalCatalogsSqlOnlySeeder::class);

        $sql = File::get($path);

        Schema::disableForeignKeyConstraints();
        $this->seedDepartments($sql);
        $this->seedMunicipalities($sql);
        $this->seedDistricts($sql);
        $this->seedEconomicActivities($sql);
        Schema::enableForeignKeyConstraints();

        $this->command?->info('Normalized catalog tables refreshed from global SQL dataset.');
    }

    private function seedDepartments(string $sql): void
    {
        if (!Schema::hasTable('departments')) {
            $this->command?->warn('departments table not found; skipping department catalog import.');
            return;
        }

        $now = now();

        foreach ($this->extractInsertValues($sql, 'contabilidad.departamentos') as $parts) {
            if (count($parts) < 2) {
                continue;
            }

            [$depaId, $name] = $parts;

            DB::table('departments')->updateOrInsert(
                ['depa_id' => $depaId],
                [
                    'name' => $name,
                    'status' => 'ACTIVE',
                    'updated_at' => $now,
                    'created_at' => $now,
                ]
            );
        }
    }

    private function seedMunicipalities(string $sql): void
    {
        if (!Schema::hasTable('municipalities')) {
            $this->command?->warn('municipalities table not found; skipping municipality catalog import.');
            return;
        }

        $now = now();

        foreach ($this->extractInsertValues($sql, 'contabilidad.municipios') as $parts) {
            if (count($parts) < 5) {
                continue;
            }

            [$id, $muniId, $name, $depaId, $statusRaw] = array_pad($parts, 5, null);

            DB::table('municipalities')->updateOrInsert(
                ['id' => (int) $id],
                [
                    'muni_id' => $muniId ?: null,
                    'muni_nombre' => $name,
                    'depa_id' => $depaId,
                    'muni_status' => $this->statusToEnum($statusRaw, 'ACTIVE'),
                    'updated_at' => $now,
                    'created_at' => $now,
                ]
            );
        }
    }

    private function seedDistricts(string $sql): void
    {
        if (!Schema::hasTable('districts')) {
            $this->command?->warn('districts table not found; skipping district catalog import.');
            return;
        }

        $now = now();

        foreach ($this->extractInsertValues($sql, 'contabilidad.districts') as $parts) {
            if (count($parts) < 4) {
                continue;
            }

            [$id, $muniId, $name, $statusRaw] = array_pad($parts, 4, null);

            DB::table('districts')->updateOrInsert(
                ['id' => (int) $id],
                [
                    'munidepa_id' => $muniId ? (int) $muniId : null,
                    'dist_name' => $name,
                    'dist_status' => $this->statusToEnum($statusRaw, 'ACTIVE'),
                    'updated_at' => $now,
                    'created_at' => $now,
                ]
            );
        }
    }

    private function seedEconomicActivities(string $sql): void
    {
        if (!Schema::hasTable('economic_activities')) {
            $this->command?->warn('economic_activities table not found; skipping economic activities import.');
            return;
        }

        $now = now();

        foreach ($this->extractInsertValues($sql, 'contabilidad.actividad_economica') as $parts) {
            if (count($parts) < 4) {
                continue;
            }

            [$id, $name, $isParentRaw, $order] = array_pad($parts, 4, null);

            DB::table('economic_activities')->updateOrInsert(
                ['id' => $id],
                [
                    'name' => $name,
                    'is_parent' => strtolower((string) $isParentRaw) === 'si',
                    'order_number' => (int) $order,
                    'status' => 'ACTIVE',
                    'updated_at' => $now,
                    'created_at' => $now,
                ]
            );
        }
    }

    private function statusToEnum(?string $raw, string $default): string
    {
        $value = strtoupper(trim((string) $raw));

        return in_array($value, ['ACTIVE', 'INACTIVE'], true) ? $value : $default;
    }

    private function csvValues(string $valueChunk): array
    {
        // Use str_getcsv to correctly handle quoted strings and commas inside values.
        return array_map('trim', str_getcsv(trim($valueChunk), ',', "'", '\\'));
    }

    /**
     * Extract the VALUES(...) portion for every insert into a specific table.
     */
    private function extractInsertValues(string $sql, string $table): array
    {
        $values = [];

        foreach (preg_split('/\r?\n/', $sql) as $line) {
            $line = trim($line);

            if ($line === '' || stripos($line, "INSERT INTO {$table}") !== 0) {
                continue;
            }

            if (preg_match('/VALUES\s*\((.*)\)\s*;?$/i', $line, $matches)) {
                $values[] = $this->csvValues($matches[1]);
            }
        }

        return $values;
    }

    private function resolveSqlPath(): ?string
    {
        $candidates = [
            base_path('../documentacion/database_contablidad_facelectronica.sql'), // prefer root copy (full dataset)
            base_path('documentacion/database_contablidad_facelectronica.sql'),
        ];

        $found = [];

        foreach ($candidates as $candidate) {
            if (file_exists($candidate)) {
                $found[$candidate] = filesize($candidate);
            }
        }

        if ($found) {
            arsort($found);
            $best = array_key_first($found);

            return realpath($best) ?: $best;
        }

        $this->command?->error('Global catalog SQL file not found. Expected at documentacion/database_contablidad_facelectronica.sql');

        return null;
    }

}
