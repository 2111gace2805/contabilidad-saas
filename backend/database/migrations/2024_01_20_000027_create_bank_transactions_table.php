<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bank_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('bank_account_id');
            $table->date('transaction_date');
            $table->enum('transaction_type', ['deposit', 'withdrawal', 'transfer']);
            $table->decimal('amount', 15, 2);
            $table->string('reference_number', 100)->nullable();
            $table->text('description');
            $table->enum('counterparty_type', ['customer', 'supplier', 'other'])->nullable();
            $table->unsignedBigInteger('counterparty_id')->nullable();
            $table->unsignedBigInteger('journal_entry_id')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->timestamp('created_at')->useCurrent();
            
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->foreign('bank_account_id')->references('id')->on('bank_accounts')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users');
            $table->index('company_id');
            $table->index('bank_account_id');
            $table->index('transaction_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_transactions');
    }
};
