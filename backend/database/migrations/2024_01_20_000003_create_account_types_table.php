<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('account_types', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->string('code', 50);
            $table->string('name');
            $table->enum('nature', ['deudora', 'acreedora']);
            $table->boolean('affects_balance')->default(false);
            $table->boolean('affects_results')->default(false);
            $table->integer('sort_order')->default(0);
            
            $table->unique(['company_id', 'code']);
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->index('company_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('account_types');
    }
};
