<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            // Add global sequence number
            $table->unsignedBigInteger('sequence_number')->nullable()->after('company_id');
            // Add type-specific number
            $table->unsignedInteger('type_number')->nullable()->after('entry_type');
            
            // Allow entry_number to be nullable during migration if we keep it for now
            $table->string('entry_number', 50)->nullable()->change();
        });

        // We will populate existing data in a separate script or seeder if needed
        // but since this is a clean start for the user, we just set the structure.
    }

    public function down(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->dropColumn(['sequence_number', 'type_number']);
            $table->string('entry_number', 50)->nullable(false)->change();
        });
    }
};
