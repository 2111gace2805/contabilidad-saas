<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('customer_payments') && Schema::hasTable('payment_applications')) {
            return;
        }

        Schema::create('customer_payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('company_id')->index();
            $table->uuid('customer_id')->index();
            $table->date('payment_date');
            $table->decimal('amount', 15, 2)->default(0);
            $table->uuid('payment_method_id')->nullable();
            $table->string('reference')->nullable();
            $table->string('status')->default('draft');
            $table->uuid('journal_entry_id')->nullable();
            $table->timestamps();
        });

        Schema::create('payment_applications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('payment_id')->index();
            $table->uuid('invoice_id')->index();
            $table->decimal('applied_amount', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_applications');
        Schema::dropIfExists('customer_payments');
    }
};
