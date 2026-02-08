<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('journal_entries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->string('entry_number', 50);
            $table->date('entry_date');
            $table->enum('entry_type', ['diario', 'ingresos', 'egresos', 'ajuste']);
            $table->text('description');
            $table->enum('status', ['draft', 'posted', 'void'])->default('draft');
            $table->unsignedBigInteger('created_by');
            $table->timestamp('posted_at')->nullable();
            $table->timestamp('voided_at')->nullable();
            $table->unsignedBigInteger('voided_by')->nullable();
            $table->timestamps();
            
            $table->unique(['company_id', 'entry_number']);
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('voided_by')->references('id')->on('users');
            $table->index('company_id');
            $table->index('entry_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_entries');
    }
};
