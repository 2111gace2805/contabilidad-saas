<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_applications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('payment_id');
            $table->unsignedBigInteger('invoice_id');
            $table->decimal('amount', 15, 2);
            $table->timestamp('created_at')->useCurrent();
            
            $table->foreign('payment_id')->references('id')->on('customer_payments')->onDelete('cascade');
            $table->foreign('invoice_id')->references('id')->on('invoices');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_applications');
    }
};
