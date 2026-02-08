<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounting_configuration', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id')->unique();
            $table->unsignedBigInteger('default_inventory_account')->nullable();
            $table->unsignedBigInteger('default_purchase_expense_account')->nullable();
            $table->unsignedBigInteger('default_vat_payable_account')->nullable();
            $table->unsignedBigInteger('default_vat_receivable_account')->nullable();
            $table->unsignedBigInteger('default_accounts_payable_account')->nullable();
            $table->unsignedBigInteger('default_accounts_receivable_account')->nullable();
            $table->unsignedBigInteger('default_sales_revenue_account')->nullable();
            $table->unsignedBigInteger('default_cost_of_sales_account')->nullable();
            $table->unsignedBigInteger('default_cash_account')->nullable();
            $table->unsignedBigInteger('default_bank_account')->nullable();
            $table->timestamps();
            
            $table->foreign('company_id', 'acct_conf_company_id_fk')->references('id')->on('companies')->onDelete('cascade');
            $table->foreign('default_inventory_account', 'acct_conf_inv_acct_fk')->references('id')->on('accounts');
            $table->foreign('default_purchase_expense_account', 'acct_conf_purchase_exp_fk')->references('id')->on('accounts');
            $table->foreign('default_vat_payable_account', 'acct_conf_vat_payable_fk')->references('id')->on('accounts');
            $table->foreign('default_vat_receivable_account', 'acct_conf_vat_recv_fk')->references('id')->on('accounts');
            $table->foreign('default_accounts_payable_account', 'acct_conf_ap_fk')->references('id')->on('accounts');
            $table->foreign('default_accounts_receivable_account', 'acct_conf_ar_fk')->references('id')->on('accounts');
            $table->foreign('default_sales_revenue_account', 'acct_conf_sales_rev_fk')->references('id')->on('accounts');
            $table->foreign('default_cost_of_sales_account', 'acct_conf_cogs_fk')->references('id')->on('accounts');
            $table->foreign('default_cash_account', 'acct_conf_cash_fk')->references('id')->on('accounts');
            $table->foreign('default_bank_account', 'acct_conf_bank_fk')->references('id')->on('accounts');
            $table->index('company_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounting_configuration');
    }
};
