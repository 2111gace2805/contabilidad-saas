<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('districts')) return;

        Schema::create('districts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('munidepa_id')->index();
            $table->string('dist_name');
            $table->enum('dist_status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->timestamps();

            $table->foreign('munidepa_id')->references('id')->on('municipalities')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('districts');
    }
};
