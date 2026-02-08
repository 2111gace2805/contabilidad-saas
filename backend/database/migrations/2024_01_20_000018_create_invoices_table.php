<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('customer_id');
            $table->string('invoice_number', 50);
            $table->date('invoice_date');
            $table->date('due_date');
            $table->decimal('subtotal', 15, 2);
            $table->decimal('tax', 15, 2)->default(0);
            $table->decimal('total', 15, 2);
            $table->decimal('balance', 15, 2);
            $table->enum('status', ['pending', 'partial', 'paid', 'overdue', 'void'])->default('pending');
            $table->unsignedBigInteger('journal_entry_id')->nullable();
            $table->timestamps();
            
            $table->unique(['company_id', 'invoice_number']);
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->foreign('customer_id')->references('id')->on('customers');
            $table->foreign('journal_entry_id')->references('id')->on('journal_entries');
            $table->index('company_id');
            $table->index('customer_id');
            $table->index('invoice_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
