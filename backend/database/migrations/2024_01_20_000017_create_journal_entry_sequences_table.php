<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('journal_entry_sequences', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('accounting_period_id');
            $table->string('module', 50);
            $table->integer('last_number')->default(0);
            $table->timestamps();
            
            $table->unique(['company_id', 'accounting_period_id', 'module'], 'jes_comp_period_module_uq');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->foreign('accounting_period_id')->references('id')->on('accounting_periods')->onDelete('cascade');
            $table->index('company_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_entry_sequences');
    }
};
