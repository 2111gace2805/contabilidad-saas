<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoice_sequences', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('company_id')->index();
            $table->integer('fiscal_year')->index();
            $table->string('prefix', 10)->nullable();
            $table->unsignedBigInteger('current_number')->default(0);
            $table->timestamps();

            $table->unique(['company_id', 'fiscal_year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_sequences');
    }
};
