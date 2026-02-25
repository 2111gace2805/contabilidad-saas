<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            if (!Schema::hasColumn('invoices', 'notes')) {
                $table->text('notes')->nullable()->after('status');
            }

            if (!Schema::hasColumn('invoices', 'tipo_dte')) {
                $table->string('tipo_dte', 5)->nullable()->after('notes');
            }
            if (!Schema::hasColumn('invoices', 'dte_version')) {
                $table->unsignedTinyInteger('dte_version')->nullable()->after('tipo_dte');
            }
            if (!Schema::hasColumn('invoices', 'dte_ambiente')) {
                $table->string('dte_ambiente', 5)->nullable()->after('dte_version');
            }
            if (!Schema::hasColumn('invoices', 'dte_numero_control')) {
                $table->string('dte_numero_control', 80)->nullable()->after('dte_ambiente');
            }
            if (!Schema::hasColumn('invoices', 'dte_codigo_generacion')) {
                $table->string('dte_codigo_generacion', 80)->nullable()->after('dte_numero_control');
            }
            if (!Schema::hasColumn('invoices', 'dte_fec_emi')) {
                $table->date('dte_fec_emi')->nullable()->after('dte_codigo_generacion');
            }
            if (!Schema::hasColumn('invoices', 'dte_hor_emi')) {
                $table->string('dte_hor_emi', 20)->nullable()->after('dte_fec_emi');
            }
            if (!Schema::hasColumn('invoices', 'dte_sello_recibido')) {
                $table->text('dte_sello_recibido')->nullable()->after('dte_hor_emi');
            }
            if (!Schema::hasColumn('invoices', 'dte_firma_electronica')) {
                $table->text('dte_firma_electronica')->nullable()->after('dte_sello_recibido');
            }
            if (!Schema::hasColumn('invoices', 'dte_emisor')) {
                $table->json('dte_emisor')->nullable()->after('dte_firma_electronica');
            }
            if (!Schema::hasColumn('invoices', 'dte_receptor')) {
                $table->json('dte_receptor')->nullable()->after('dte_emisor');
            }
            if (!Schema::hasColumn('invoices', 'dte_cuerpo_documento')) {
                $table->json('dte_cuerpo_documento')->nullable()->after('dte_receptor');
            }
            if (!Schema::hasColumn('invoices', 'dte_resumen')) {
                $table->json('dte_resumen')->nullable()->after('dte_cuerpo_documento');
            }
            if (!Schema::hasColumn('invoices', 'dte_apendice')) {
                $table->json('dte_apendice')->nullable()->after('dte_resumen');
            }
            if (!Schema::hasColumn('invoices', 'dte_raw_json')) {
                $table->longText('dte_raw_json')->nullable()->after('dte_apendice');
            }

            if (!Schema::hasColumn('invoices', 'customer_name_snapshot')) {
                $table->string('customer_name_snapshot', 255)->nullable()->after('dte_raw_json');
            }
            if (!Schema::hasColumn('invoices', 'customer_tax_id_snapshot')) {
                $table->string('customer_tax_id_snapshot', 50)->nullable()->after('customer_name_snapshot');
            }
            if (!Schema::hasColumn('invoices', 'customer_phone_snapshot')) {
                $table->string('customer_phone_snapshot', 50)->nullable()->after('customer_tax_id_snapshot');
            }
            if (!Schema::hasColumn('invoices', 'customer_email_snapshot')) {
                $table->string('customer_email_snapshot', 255)->nullable()->after('customer_phone_snapshot');
            }
            if (!Schema::hasColumn('invoices', 'customer_address_snapshot')) {
                $table->text('customer_address_snapshot')->nullable()->after('customer_email_snapshot');
            }

            if (!Schema::hasColumn('invoices', 'is_fiscal_credit')) {
                $table->boolean('is_fiscal_credit')->default(false)->after('customer_address_snapshot');
            }
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $columns = [
                'tipo_dte',
                'dte_version',
                'dte_ambiente',
                'dte_numero_control',
                'dte_codigo_generacion',
                'dte_fec_emi',
                'dte_hor_emi',
                'dte_sello_recibido',
                'dte_firma_electronica',
                'dte_emisor',
                'dte_receptor',
                'dte_cuerpo_documento',
                'dte_resumen',
                'dte_apendice',
                'dte_raw_json',
                'customer_name_snapshot',
                'customer_tax_id_snapshot',
                'customer_phone_snapshot',
                'customer_email_snapshot',
                'customer_address_snapshot',
                'is_fiscal_credit',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('invoices', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
