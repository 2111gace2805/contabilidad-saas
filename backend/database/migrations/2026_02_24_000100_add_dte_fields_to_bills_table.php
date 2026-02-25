<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bills', function (Blueprint $table) {
            if (!Schema::hasColumn('bills', 'notes')) {
                $table->text('notes')->nullable()->after('journal_entry_id');
            }

            if (!Schema::hasColumn('bills', 'tipo_dte')) {
                $table->string('tipo_dte', 5)->nullable()->after('notes');
            }
            if (!Schema::hasColumn('bills', 'dte_version')) {
                $table->unsignedTinyInteger('dte_version')->nullable()->after('tipo_dte');
            }
            if (!Schema::hasColumn('bills', 'dte_ambiente')) {
                $table->string('dte_ambiente', 5)->nullable()->after('dte_version');
            }
            if (!Schema::hasColumn('bills', 'dte_numero_control')) {
                $table->string('dte_numero_control', 80)->nullable()->after('dte_ambiente');
            }
            if (!Schema::hasColumn('bills', 'dte_codigo_generacion')) {
                $table->string('dte_codigo_generacion', 80)->nullable()->after('dte_numero_control');
            }
            if (!Schema::hasColumn('bills', 'dte_fec_emi')) {
                $table->date('dte_fec_emi')->nullable()->after('dte_codigo_generacion');
            }
            if (!Schema::hasColumn('bills', 'dte_hor_emi')) {
                $table->string('dte_hor_emi', 20)->nullable()->after('dte_fec_emi');
            }
            if (!Schema::hasColumn('bills', 'dte_sello_recibido')) {
                $table->text('dte_sello_recibido')->nullable()->after('dte_hor_emi');
            }
            if (!Schema::hasColumn('bills', 'dte_firma_electronica')) {
                $table->longText('dte_firma_electronica')->nullable()->after('dte_sello_recibido');
            }
            if (!Schema::hasColumn('bills', 'dte_emisor')) {
                $table->json('dte_emisor')->nullable()->after('dte_firma_electronica');
            }
            if (!Schema::hasColumn('bills', 'dte_receptor')) {
                $table->json('dte_receptor')->nullable()->after('dte_emisor');
            }
            if (!Schema::hasColumn('bills', 'dte_cuerpo_documento')) {
                $table->json('dte_cuerpo_documento')->nullable()->after('dte_receptor');
            }
            if (!Schema::hasColumn('bills', 'dte_resumen')) {
                $table->json('dte_resumen')->nullable()->after('dte_cuerpo_documento');
            }
            if (!Schema::hasColumn('bills', 'dte_apendice')) {
                $table->json('dte_apendice')->nullable()->after('dte_resumen');
            }
            if (!Schema::hasColumn('bills', 'dte_raw_json')) {
                $table->longText('dte_raw_json')->nullable()->after('dte_apendice');
            }
            if (!Schema::hasColumn('bills', 'supplier_name_snapshot')) {
                $table->string('supplier_name_snapshot', 255)->nullable()->after('dte_raw_json');
            }
            if (!Schema::hasColumn('bills', 'supplier_tax_id_snapshot')) {
                $table->string('supplier_tax_id_snapshot', 50)->nullable()->after('supplier_name_snapshot');
            }
            if (!Schema::hasColumn('bills', 'is_fiscal_credit')) {
                $table->boolean('is_fiscal_credit')->default(false)->after('supplier_tax_id_snapshot');
            }
        });

        Schema::table('bills', function (Blueprint $table) {
            $table->index(['company_id', 'is_fiscal_credit'], 'bills_company_fiscal_credit_idx');
            $table->index(['company_id', 'tipo_dte'], 'bills_company_tipo_dte_idx');
            $table->index(['company_id', 'dte_numero_control'], 'bills_company_numero_control_idx');
        });
    }

    public function down(): void
    {
        Schema::table('bills', function (Blueprint $table) {
            $table->dropIndex('bills_company_fiscal_credit_idx');
            $table->dropIndex('bills_company_tipo_dte_idx');
            $table->dropIndex('bills_company_numero_control_idx');

            $table->dropColumn([
                'is_fiscal_credit',
                'supplier_tax_id_snapshot',
                'supplier_name_snapshot',
                'dte_raw_json',
                'dte_apendice',
                'dte_resumen',
                'dte_cuerpo_documento',
                'dte_receptor',
                'dte_emisor',
                'dte_firma_electronica',
                'dte_sello_recibido',
                'dte_hor_emi',
                'dte_fec_emi',
                'dte_codigo_generacion',
                'dte_numero_control',
                'dte_ambiente',
                'dte_version',
                'tipo_dte',
            ]);
        });
    }
};
