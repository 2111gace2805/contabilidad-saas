<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->string('code', 50);
            $table->string('name');
            $table->unsignedBigInteger('account_type_id');
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->integer('level')->default(1);
            $table->boolean('is_detail')->default(false);
            $table->boolean('active')->default(true);
            $table->timestamps();
            
            $table->unique(['company_id', 'code']);
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->foreign('account_type_id')->references('id')->on('account_types');
            $table->foreign('parent_id')->references('id')->on('accounts');
            $table->index('company_id');
            $table->index('parent_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
