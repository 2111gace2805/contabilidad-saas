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
            if (!Schema::hasColumn('company_preferences', 'dte_establishment_code')) {
                $table->string('dte_establishment_code', 4)->default('M001')->after('primary_color');
            }

            if (!Schema::hasColumn('company_preferences', 'dte_point_of_sale_code')) {
                $table->string('dte_point_of_sale_code', 4)->default('P001')->after('dte_establishment_code');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('company_preferences')) {
            return;
        }

        Schema::table('company_preferences', function (Blueprint $table) {
            if (Schema::hasColumn('company_preferences', 'dte_point_of_sale_code')) {
                $table->dropColumn('dte_point_of_sale_code');
            }
            if (Schema::hasColumn('company_preferences', 'dte_establishment_code')) {
                $table->dropColumn('dte_establishment_code');
            }
        });
    }
};
