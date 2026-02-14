<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update existing posted entries that lack the hyphen in entry_number
        DB::table('journal_entries')
            ->whereNotNull('entry_number')
            ->where('entry_number', '!=', '')
            ->whereRaw("entry_number NOT LIKE '%-%'")
            ->whereNotNull('type_number')
            ->update(["entry_number" => DB::raw("CONCAT(UPPER(entry_type), '-', LPAD(type_number, 7, '0'))")]);
    }

    public function down(): void
    {
        // No-op: we don't remove hyphens automatically.
    }
};
