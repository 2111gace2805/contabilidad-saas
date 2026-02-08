<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('rfc', 50);
            $table->string('nrc', 50)->nullable();
            $table->string('nit', 50)->nullable();
            $table->enum('taxpayer_type', ['micro', 'pequeño', 'mediano', 'grande'])->nullable();
            $table->boolean('is_withholding_agent')->default(false);
            $table->text('address')->nullable();
            $table->text('address_line2')->nullable();
            $table->string('municipality', 100)->nullable();
            $table->string('department', 100)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('postal_code', 20)->nullable();
            $table->string('country', 100)->default('El Salvador');
            $table->string('employer_registration', 50)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('business_activity')->nullable();
            $table->integer('fiscal_year_start')->default(1);
            $table->string('currency', 10)->default('MXN');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
