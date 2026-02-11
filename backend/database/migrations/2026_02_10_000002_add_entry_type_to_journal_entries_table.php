<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up()
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            // Fix entry_type column
            if (Schema::hasColumn('journal_entries', 'entry_type')) {
                $table->string('entry_type', 10)->nullable()->change();
            } else {
                $table->string('entry_type', 10)->nullable()->after('entry_number');
            }
            
            // Fix status column to be uppercase and use enum
            // We use string first to avoid enum change issues with some DB drivers
            $table->string('status', 20)->default('DRAFT')->change();
        });

        // Ensure existing data is uppercase if any (though currently 0 records)
        DB::table('journal_entries')->where('status', 'draft')->update(['status' => 'DRAFT']);
        DB::table('journal_entries')->where('status', 'posted')->update(['status' => 'POSTED']);
        DB::table('journal_entries')->where('status', 'void')->update(['status' => 'VOIDED']);
    }

    public function down()
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->enum('status', ['draft', 'posted', 'void'])->default('draft')->change();
        });
    }
};
