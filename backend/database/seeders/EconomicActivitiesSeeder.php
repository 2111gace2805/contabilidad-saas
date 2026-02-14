<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EconomicActivitiesSeeder extends Seeder
{
    public function run(): void
    {
        $activities = [
            ['id' => 'A0001', 'name' => 'Comercio al por menor', 'is_parent' => false, 'order_number' => 1],
            ['id' => 'A0002', 'name' => 'Servicios profesionales', 'is_parent' => false, 'order_number' => 2],
            ['id' => 'A0003', 'name' => 'Manufactura', 'is_parent' => false, 'order_number' => 3],
        ];

        foreach ($activities as $a) {
            DB::table('economic_activities')->updateOrInsert(
                ['id' => $a['id']],
                ['name' => $a['name'], 'is_parent' => $a['is_parent'], 'order_number' => $a['order_number'], 'status' => 'ACTIVE', 'updated_at' => now(), 'created_at' => now()]
            );
        }
    }
}
