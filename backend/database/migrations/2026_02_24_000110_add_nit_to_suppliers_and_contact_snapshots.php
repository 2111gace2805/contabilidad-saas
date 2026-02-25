<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('suppliers', function (Blueprint $table) {
            if (!Schema::hasColumn('suppliers', 'nit')) {
                $table->string('nit', 50)->nullable()->after('name');
            }
        });

        DB::table('suppliers')
            ->whereNull('nit')
            ->update(['nit' => DB::raw('rfc')]);

        Schema::table('bills', function (Blueprint $table) {
            if (!Schema::hasColumn('bills', 'supplier_phone_snapshot')) {
                $table->string('supplier_phone_snapshot', 50)->nullable()->after('supplier_tax_id_snapshot');
            }
            if (!Schema::hasColumn('bills', 'supplier_email_snapshot')) {
                $table->string('supplier_email_snapshot')->nullable()->after('supplier_phone_snapshot');
            }
            if (!Schema::hasColumn('bills', 'supplier_address_snapshot')) {
                $table->text('supplier_address_snapshot')->nullable()->after('supplier_email_snapshot');
            }
        });
    }

    public function down(): void
    {
        Schema::table('bills', function (Blueprint $table) {
            $table->dropColumn(['supplier_phone_snapshot', 'supplier_email_snapshot', 'supplier_address_snapshot']);
        });

        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropColumn(['nit']);
        });
    }
};
