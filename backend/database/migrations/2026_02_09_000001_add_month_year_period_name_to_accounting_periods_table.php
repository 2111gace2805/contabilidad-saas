<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('accounting_periods', function (Blueprint $table) {
            if (!Schema::hasColumn('accounting_periods', 'month')) {
                $table->unsignedTinyInteger('month')->nullable()->after('period_number');
            }
            if (!Schema::hasColumn('accounting_periods', 'year')) {
                $table->unsignedSmallInteger('year')->nullable()->after('month');
            }
            if (!Schema::hasColumn('accounting_periods', 'period_name')) {
                $table->string('period_name')->nullable()->after('year');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('accounting_periods', function (Blueprint $table) {
            if (Schema::hasColumn('accounting_periods', 'period_name')) {
                $table->dropColumn('period_name');
            }
            if (Schema::hasColumn('accounting_periods', 'year')) {
                $table->dropColumn('year');
            }
            if (Schema::hasColumn('accounting_periods', 'month')) {
                $table->dropColumn('month');
            }
        });
    }
};
