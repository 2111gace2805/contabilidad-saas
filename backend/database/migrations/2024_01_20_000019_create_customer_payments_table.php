<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('customer_id');
            $table->string('payment_number', 50);
            $table->date('payment_date');
            $table->decimal('amount', 15, 2);
            $table->string('payment_method', 50);
            $table->string('reference', 100)->nullable();
            $table->unsignedBigInteger('journal_entry_id')->nullable();
            $table->timestamp('created_at')->useCurrent();
            
            $table->unique(['company_id', 'payment_number']);
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->foreign('customer_id')->references('id')->on('customers');
            $table->foreign('journal_entry_id')->references('id')->on('journal_entries');
            $table->index('company_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_payments');
    }
};
