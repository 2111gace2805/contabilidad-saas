<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->text('void_reason')->nullable()->after('status');
            $table->foreignId('void_requested_by')->nullable()->constrained('users')->after('void_reason');
            $table->timestamp('void_requested_at')->nullable()->after('void_requested_by');
            $table->foreignId('void_authorized_by')->nullable()->constrained('users')->after('void_requested_at');
            $table->timestamp('void_authorized_at')->nullable()->after('void_authorized_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->dropForeign(['void_requested_by']);
            $table->dropForeign(['void_authorized_by']);
            $table->dropColumn([
                'void_reason',
                'void_requested_by',
                'void_requested_at',
                'void_authorized_by',
                'void_authorized_at'
            ]);
        });
    }
};
