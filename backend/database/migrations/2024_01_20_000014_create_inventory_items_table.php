<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->string('item_code', 50);
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('unit_of_measure', 50);
            $table->enum('cost_method', ['average', 'fifo', 'lifo'])->default('average');
            $table->decimal('current_quantity', 15, 4)->default(0);
            $table->decimal('average_cost', 15, 4)->default(0);
            $table->unsignedBigInteger('inventory_account_id')->nullable();
            $table->unsignedBigInteger('cogs_account_id')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            
            $table->unique(['company_id', 'item_code']);
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->foreign('inventory_account_id')->references('id')->on('accounts');
            $table->foreign('cogs_account_id')->references('id')->on('accounts');
            $table->index('company_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
