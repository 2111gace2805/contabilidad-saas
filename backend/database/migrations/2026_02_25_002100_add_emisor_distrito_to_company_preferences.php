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
            if (!Schema::hasColumn('company_preferences', 'emisor_distrito')) {
                $table->string('emisor_distrito', 10)->nullable()->after('emisor_municipio');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('company_preferences')) {
            return;
        }

        Schema::table('company_preferences', function (Blueprint $table) {
            if (Schema::hasColumn('company_preferences', 'emisor_distrito')) {
                $table->dropColumn('emisor_distrito');
            }
        });
    }
};
