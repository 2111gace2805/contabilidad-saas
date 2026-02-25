<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('company_preferences')) {
            return;
        }

        Schema::table('company_preferences', function (Blueprint $table) {
            if (!Schema::hasColumn('company_preferences', 'emisor_nombre_comercial')) {
                $table->string('emisor_nombre_comercial')->nullable()->after('dte_point_of_sale_code');
            }
            if (!Schema::hasColumn('company_preferences', 'emisor_tipo_establecimiento')) {
                $table->string('emisor_tipo_establecimiento', 10)->nullable()->after('emisor_nombre_comercial');
            }
            if (!Schema::hasColumn('company_preferences', 'emisor_correo')) {
                $table->string('emisor_correo')->nullable()->after('emisor_tipo_establecimiento');
            }
            if (!Schema::hasColumn('company_preferences', 'emisor_cod_actividad')) {
                $table->string('emisor_cod_actividad', 10)->nullable()->after('emisor_correo');
            }
            if (!Schema::hasColumn('company_preferences', 'emisor_desc_actividad')) {
                $table->string('emisor_desc_actividad')->nullable()->after('emisor_cod_actividad');
            }
            if (!Schema::hasColumn('company_preferences', 'emisor_departamento')) {
                $table->string('emisor_departamento', 10)->nullable()->after('emisor_desc_actividad');
            }
            if (!Schema::hasColumn('company_preferences', 'emisor_municipio')) {
                $table->string('emisor_municipio', 10)->nullable()->after('emisor_departamento');
            }
            if (!Schema::hasColumn('company_preferences', 'emisor_direccion_complemento')) {
                $table->text('emisor_direccion_complemento')->nullable()->after('emisor_municipio');
            }
            if (!Schema::hasColumn('company_preferences', 'emisor_cod_estable')) {
                $table->string('emisor_cod_estable', 10)->nullable()->after('emisor_direccion_complemento');
            }
            if (!Schema::hasColumn('company_preferences', 'emisor_cod_punto_venta')) {
                $table->string('emisor_cod_punto_venta', 10)->nullable()->after('emisor_cod_estable');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('company_preferences')) {
            return;
        }

        Schema::table('company_preferences', function (Blueprint $table) {
            $columns = [
                'emisor_nombre_comercial',
                'emisor_tipo_establecimiento',
                'emisor_correo',
                'emisor_cod_actividad',
                'emisor_desc_actividad',
                'emisor_departamento',
                'emisor_municipio',
                'emisor_direccion_complemento',
                'emisor_cod_estable',
                'emisor_cod_punto_venta',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('company_preferences', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
