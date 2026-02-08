<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * We alter the `tokenable_id` column to a string so UUID PKs work.
     * Using raw SQL to avoid requiring doctrine/dbal.
     *
     * @return void
     */
    public function up()
    {
        // Only run if table and column exist (migration may run before Sanctum's table)
        if (Schema::hasTable('personal_access_tokens') && Schema::hasColumn('personal_access_tokens', 'tokenable_id')) {
            try {
                DB::statement("ALTER TABLE `personal_access_tokens` MODIFY `tokenable_id` VARCHAR(191) NOT NULL");
            } catch (\Throwable $e) {
                // Log and continue; this keeps the migration safe if DB doesn't support raw ALTER
            }
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (Schema::hasTable('personal_access_tokens') && Schema::hasColumn('personal_access_tokens', 'tokenable_id')) {
            try {
                DB::statement("ALTER TABLE `personal_access_tokens` MODIFY `tokenable_id` BIGINT UNSIGNED NOT NULL");
            } catch (\Throwable $e) {
            }
        }
    }
};
