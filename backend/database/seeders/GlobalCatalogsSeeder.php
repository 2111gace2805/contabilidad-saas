<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class GlobalCatalogsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * This seeder imports the global catalogs SQL provided in the repository
     * at documentacion/database_contablidad_facelectronica.sql
     */
    public function run()
    {
        // Path: workspace/documentacion/database_contablidad_facelectronica.sql
         = __DIR__ . '/../../..' . '/documentacion/database_contablidad_facelectronica.sql';

        if (!file_exists()) {
            // try from base path (backend project root)
             = base_path('../documentacion/database_contablidad_facelectronica.sql');
        }

        if (!file_exists()) {
            ->command->error(
