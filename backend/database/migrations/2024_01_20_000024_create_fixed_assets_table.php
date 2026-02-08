<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fixed_assets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->string('asset_number', 50);
            $table->string('name');
            $table->text('description')->nullable();
            $table->date('acquisition_date');
            $table->decimal('acquisition_cost', 15, 2);
            $table->decimal('salvage_value', 15, 2)->default(0);
            $table->integer('useful_life_years');
            $table->enum('depreciation_method', ['straight_line', 'declining_balance'])->default('straight_line');
            $table->unsignedBigInteger('asset_account_id')->nullable();
            $table->unsignedBigInteger('depreciation_account_id')->nullable();
            $table->unsignedBigInteger('accumulated_depreciation_account_id')->nullable();
            $table->enum('status', ['active', 'disposed', 'sold'])->default('active');
            $table->unsignedBigInteger('journal_entry_id')->nullable();
            $table->timestamps();
            
            $table->unique(['company_id', 'asset_number']);
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->foreign('asset_account_id')->references('id')->on('accounts');
            $table->foreign('depreciation_account_id')->references('id')->on('accounts');
            $table->foreign('accumulated_depreciation_account_id')->references('id')->on('accounts');
            $table->foreign('journal_entry_id')->references('id')->on('journal_entries');
            $table->index('company_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fixed_assets');
    }
};
