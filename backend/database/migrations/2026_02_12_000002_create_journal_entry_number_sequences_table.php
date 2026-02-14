<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('journal_entry_number_sequences')) {
            Schema::create('journal_entry_number_sequences', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('company_id');
                $table->string('entry_type', 20);
                $table->integer('fiscal_year');
                $table->bigInteger('current_number')->default(0);
                $table->string('prefix', 10)->nullable();
                $table->timestamps();

                $table->unique(['company_id', 'entry_type', 'fiscal_year'], 'journal_entry_num_seq_unique');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_entry_number_sequences');
    }
};
