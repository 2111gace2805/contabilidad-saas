<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('economic_activities')) return;

        Schema::create('economic_activities', function (Blueprint $table) {
            $table->string('id', 5)->primary();
            $table->string('name');
            $table->boolean('is_parent')->default(false);
            $table->string('parent_id', 5)->nullable();
            $table->integer('order_number')->default(0);
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('economic_activities');
    }
};
