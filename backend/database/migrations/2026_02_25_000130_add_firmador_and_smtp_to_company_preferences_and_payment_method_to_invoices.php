<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('company_preferences')) {
            Schema::table('company_preferences', function (Blueprint $table) {
                if (!Schema::hasColumn('company_preferences', 'firmador_certificate_name')) {
                    $table->string('firmador_certificate_name')->nullable()->after('primary_color');
                }
                if (!Schema::hasColumn('company_preferences', 'firmador_certificate_content')) {
                    $table->longText('firmador_certificate_content')->nullable()->after('firmador_certificate_name');
                }
                if (!Schema::hasColumn('company_preferences', 'firmador_private_key_name')) {
                    $table->string('firmador_private_key_name')->nullable()->after('firmador_certificate_content');
                }
                if (!Schema::hasColumn('company_preferences', 'firmador_private_key_content')) {
                    $table->longText('firmador_private_key_content')->nullable()->after('firmador_private_key_name');
                }
                if (!Schema::hasColumn('company_preferences', 'firmador_api_password')) {
                    $table->string('firmador_api_password')->nullable()->after('firmador_private_key_content');
                }
                if (!Schema::hasColumn('company_preferences', 'firmador_api_url')) {
                    $table->string('firmador_api_url')->nullable()->after('firmador_api_password');
                }
                if (!Schema::hasColumn('company_preferences', 'smtp_provider')) {
                    $table->string('smtp_provider', 30)->nullable()->after('firmador_api_url');
                }
                if (!Schema::hasColumn('company_preferences', 'smtp_url')) {
                    $table->string('smtp_url')->nullable()->after('smtp_provider');
                }
                if (!Schema::hasColumn('company_preferences', 'smtp_api_key')) {
                    $table->string('smtp_api_key')->nullable()->after('smtp_url');
                }
                if (!Schema::hasColumn('company_preferences', 'smtp_host')) {
                    $table->string('smtp_host')->nullable()->after('smtp_api_key');
                }
                if (!Schema::hasColumn('company_preferences', 'smtp_port')) {
                    $table->unsignedInteger('smtp_port')->nullable()->after('smtp_host');
                }
                if (!Schema::hasColumn('company_preferences', 'smtp_username')) {
                    $table->string('smtp_username')->nullable()->after('smtp_port');
                }
                if (!Schema::hasColumn('company_preferences', 'smtp_password')) {
                    $table->string('smtp_password')->nullable()->after('smtp_username');
                }
                if (!Schema::hasColumn('company_preferences', 'smtp_encryption')) {
                    $table->string('smtp_encryption', 10)->nullable()->after('smtp_password');
                }
                if (!Schema::hasColumn('company_preferences', 'smtp_region')) {
                    $table->string('smtp_region', 30)->nullable()->after('smtp_encryption');
                }
            });
        }

        if (Schema::hasTable('invoices')) {
            Schema::table('invoices', function (Blueprint $table) {
                if (!Schema::hasColumn('invoices', 'payment_method_id')) {
                    $table->unsignedBigInteger('payment_method_id')->nullable()->after('customer_id');
                    $table->foreign('payment_method_id')->references('id')->on('payment_methods')->nullOnDelete();
                    $table->index('payment_method_id');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('invoices') && Schema::hasColumn('invoices', 'payment_method_id')) {
            Schema::table('invoices', function (Blueprint $table) {
                $table->dropForeign(['payment_method_id']);
                $table->dropIndex(['payment_method_id']);
                $table->dropColumn('payment_method_id');
            });
        }

        if (Schema::hasTable('company_preferences')) {
            Schema::table('company_preferences', function (Blueprint $table) {
                $columns = [
                    'firmador_certificate_name',
                    'firmador_certificate_content',
                    'firmador_private_key_name',
                    'firmador_private_key_content',
                    'firmador_api_password',
                    'firmador_api_url',
                    'smtp_provider',
                    'smtp_url',
                    'smtp_api_key',
                    'smtp_host',
                    'smtp_port',
                    'smtp_username',
                    'smtp_password',
                    'smtp_encryption',
                    'smtp_region',
                ];

                foreach ($columns as $column) {
                    if (Schema::hasColumn('company_preferences', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }
};
