<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('depreciation_schedules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('fixed_asset_id');
            $table->date('period_date');
            $table->decimal('depreciation_amount', 15, 2);
            $table->decimal('accumulated_depreciation', 15, 2);
            $table->decimal('net_book_value', 15, 2);
            $table->unsignedBigInteger('journal_entry_id')->nullable();
            $table->timestamp('created_at')->useCurrent();
            
            $table->unique(['fixed_asset_id', 'period_date']);
            $table->foreign('fixed_asset_id')->references('id')->on('fixed_assets')->onDelete('cascade');
            $table->foreign('journal_entry_id')->references('id')->on('journal_entries');
            $table->index('fixed_asset_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('depreciation_schedules');
    }
};
