<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounting_segments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->string('code', 50);
            $table->string('name');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('parent_segment_id')->nullable();
            $table->integer('level')->default(1);
            $table->integer('digit_length')->default(2);
            $table->integer('sequence')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamp('created_at')->useCurrent();
            
            $table->unique(['company_id', 'code']);
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->foreign('parent_segment_id')->references('id')->on('accounting_segments');
            $table->index('company_id');
            $table->index('parent_segment_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounting_segments');
    }
};
