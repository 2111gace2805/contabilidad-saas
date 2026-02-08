<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('journal_entry_prefixes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->string('module', 50);
            $table->string('prefix', 10);
            $table->string('description');
            $table->boolean('active')->default(true);
            $table->timestamp('created_at')->useCurrent();
            
            $table->unique(['company_id', 'module']);
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->index('company_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_entry_prefixes');
    }
};
