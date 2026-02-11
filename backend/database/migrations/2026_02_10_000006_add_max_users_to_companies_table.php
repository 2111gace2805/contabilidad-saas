<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $blueprint) {
            $blueprint->integer('max_users')->default(3)->after('currency');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $blueprint) {
            $blueprint->dropColumn('max_users');
        });
    }
};
