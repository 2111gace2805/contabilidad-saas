<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bills', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('supplier_id');
            $table->string('bill_number', 50);
            $table->date('bill_date');
            $table->date('due_date');
            $table->decimal('subtotal', 15, 2);
            $table->decimal('tax', 15, 2)->default(0);
            $table->decimal('total', 15, 2);
            $table->decimal('balance', 15, 2);
            $table->enum('status', ['pending', 'partial', 'paid', 'overdue', 'void'])->default('pending');
            $table->unsignedBigInteger('journal_entry_id')->nullable();
            $table->timestamps();
            
            $table->unique(['company_id', 'bill_number']);
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->foreign('supplier_id')->references('id')->on('suppliers');
            $table->foreign('journal_entry_id')->references('id')->on('journal_entries');
            $table->index('company_id');
            $table->index('supplier_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bills');
    }
};
