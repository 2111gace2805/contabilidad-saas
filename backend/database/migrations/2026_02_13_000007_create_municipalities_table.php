<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('municipalities')) return;

        Schema::create('municipalities', function (Blueprint $table) {
            $table->id();
            $table->string('muni_id', 20)->nullable();
            $table->string('depa_id', 10)->index();
            $table->string('muni_nombre');
            $table->enum('muni_status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->timestamps();

            $table->foreign('depa_id')->references('depa_id')->on('departments')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('municipalities');
    }
};
