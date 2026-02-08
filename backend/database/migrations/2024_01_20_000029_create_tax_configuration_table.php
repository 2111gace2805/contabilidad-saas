<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tax_configuration', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->string('tax_code', 50);
            $table->string('tax_name');
            $table->enum('tax_type', ['debit', 'credit', 'withholding']);
            $table->decimal('percentage', 5, 2);
            $table->unsignedBigInteger('account_id');
            $table->boolean('is_active')->default(true);
            $table->string('apply_condition', 50)->default('always');
            $table->decimal('minimum_amount', 15, 2)->default(0);
            $table->timestamps();
            
            $table->unique(['company_id', 'tax_code']);
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->foreign('account_id')->references('id')->on('accounts');
            $table->index('company_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tax_configuration');
    }
};
