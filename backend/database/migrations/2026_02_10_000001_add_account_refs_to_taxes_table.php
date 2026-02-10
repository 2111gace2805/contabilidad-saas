<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('taxes', function (Blueprint $table) {
            $table->unsignedBigInteger('debit_account_id')->nullable()->after('is_active');
            $table->unsignedBigInteger('credit_account_id')->nullable()->after('debit_account_id');

            $table->foreign('debit_account_id')->references('id')->on('accounts')->nullOnDelete();
            $table->foreign('credit_account_id')->references('id')->on('accounts')->nullOnDelete();

            $table->index('debit_account_id');
            $table->index('credit_account_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('taxes', function (Blueprint $table) {
            $table->dropForeign(['debit_account_id']);
            $table->dropForeign(['credit_account_id']);
            $table->dropColumn(['debit_account_id', 'credit_account_id']);
        });
    }
};