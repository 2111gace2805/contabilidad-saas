<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CustomerTypesSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            ['code' => 'PERSONA_NATURAL', 'name' => 'Persona Natural'],
            ['code' => 'PERSONERIA_JURIDICA', 'name' => 'Personería Jurídica'],
        ];

        foreach ($defaults as $d) {
            DB::table('customer_types')->updateOrInsert(
                ['code' => $d['code']],
                ['name' => $d['name'], 'is_active' => true, 'updated_at' => now(), 'created_at' => now()]
            );
        }
    }
}
