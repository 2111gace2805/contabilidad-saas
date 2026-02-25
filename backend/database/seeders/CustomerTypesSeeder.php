<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CustomerTypesSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            ['code' => 'CONSUMIDOR_FINAL', 'name' => 'Consumidor Final'],
            ['code' => 'CONTRIBUYENTE', 'name' => 'Contribuyente'],
            ['code' => 'GOBIERNO', 'name' => 'Institución de Gobierno'],
            ['code' => 'EXPORTACION', 'name' => 'Cliente de Exportación'],
            ['code' => 'PERSONA_NATURAL', 'name' => 'Persona Natural'],
            ['code' => 'PERSONERIA_JURIDICA', 'name' => 'Personería Jurídica'],
        ];

        foreach ($defaults as $d) {
            DB::table('customer_types')->updateOrInsert(
                ['code' => $d['code']],
                [
                    'name' => $d['name'],
                    'is_active' => !in_array($d['code'], ['PERSONA_NATURAL', 'PERSONERIA_JURIDICA'], true),
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }
    }
}
