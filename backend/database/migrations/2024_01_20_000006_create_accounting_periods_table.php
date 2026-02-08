<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounting_periods', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->enum('period_type', ['monthly', 'annual']);
            $table->integer('fiscal_year');
            $table->integer('period_number');
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['open', 'closed'])->default('open');
            $table->timestamp('closed_at')->nullable();
            $table->unsignedBigInteger('closed_by')->nullable();
            $table->unsignedBigInteger('closing_entry_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();
            
            $table->unique(['company_id', 'fiscal_year', 'period_number', 'period_type'], 'ap_comp_fy_num_type_uq');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->foreign('closed_by')->references('id')->on('users');
            $table->index(['company_id', 'fiscal_year']);
            $table->index(['company_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounting_periods');
    }
};
