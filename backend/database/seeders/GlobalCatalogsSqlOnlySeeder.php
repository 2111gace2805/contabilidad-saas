<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class GlobalCatalogsSqlOnlySeeder extends Seeder
{
    public function run()
    {
        $path = base_path('documentacion/database_contablidad_facelectronica.sql');

        if (!File::exists($path)) {
            $this->command->error(
