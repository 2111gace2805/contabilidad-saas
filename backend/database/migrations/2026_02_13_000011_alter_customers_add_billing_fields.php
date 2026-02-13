<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            if (!Schema::hasColumn('customers', 'customer_type_id')) {
                $table->unsignedBigInteger('customer_type_id')->nullable()->after('company_id');
            }
            if (!Schema::hasColumn('customers', 'economic_activity_id')) {
                $table->string('economic_activity_id',5)->nullable()->after('customer_type_id');
            }
            if (!Schema::hasColumn('customers', 'depa_id')) {
                $table->string('depa_id',10)->nullable()->after('economic_activity_id');
            }
            if (!Schema::hasColumn('customers', 'municipality_id')) {
                $table->unsignedBigInteger('municipality_id')->nullable()->after('depa_id');
            }
            if (!Schema::hasColumn('customers', 'district_id')) {
                $table->unsignedBigInteger('district_id')->nullable()->after('municipality_id');
            }
            if (!Schema::hasColumn('customers', 'contact_name')) {
                $table->string('contact_name')->nullable()->after('name');
            }
            if (!Schema::hasColumn('customers', 'email1')) {
                $table->string('email1')->nullable()->after('rfc');
            }
            if (!Schema::hasColumn('customers', 'email2')) {
                $table->string('email2')->nullable()->after('email1');
            }
            if (!Schema::hasColumn('customers', 'email3')) {
                $table->string('email3')->nullable()->after('email2');
            }
            if (!Schema::hasColumn('customers', 'nit')) {
                $table->string('nit',17)->nullable()->after('email3');
            }
            if (!Schema::hasColumn('customers', 'nrc')) {
                $table->string('nrc')->nullable()->after('nit');
            }
            if (!Schema::hasColumn('customers', 'dui')) {
                $table->string('dui',10)->nullable()->after('nrc');
            }
            if (!Schema::hasColumn('customers', 'is_gran_contribuyente')) {
                $table->boolean('is_gran_contribuyente')->default(false)->after('dui');
            }
            if (!Schema::hasColumn('customers', 'is_exento_iva')) {
                $table->boolean('is_exento_iva')->default(false)->after('is_gran_contribuyente');
            }
            if (!Schema::hasColumn('customers', 'is_no_sujeto_iva')) {
                $table->boolean('is_no_sujeto_iva')->default(false)->after('is_exento_iva');
            }
            if (!Schema::hasColumn('customers', 'profile_type')) {
                $table->string('profile_type')->nullable()->after('is_no_sujeto_iva');
            }
            if (!Schema::hasColumn('customers', 'business_name')) {
                $table->string('business_name')->nullable()->after('profile_type');
            }
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $cols = ['customer_type_id','economic_activity_id','depa_id','municipality_id','district_id','contact_name','email1','email2','email3','nit','nrc','dui','is_gran_contribuyente','is_exento_iva','is_no_sujeto_iva','profile_type','business_name'];
            foreach ($cols as $c) {
                if (Schema::hasColumn('customers', $c)) {
                    $table->dropColumn($c);
                }
            }
        });
    }
};
