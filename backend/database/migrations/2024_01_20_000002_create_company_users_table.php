<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_users', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('user_id');
            $table->enum('role', ['admin', 'accountant', 'viewer']);
            $table->timestamps();
            
            $table->unique(['company_id', 'user_id']);
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('company_id');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_users');
    }
};
