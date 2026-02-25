<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('company_preferences')) {
            return;
        }

        Schema::table('company_preferences', function (Blueprint $table) {
            if (!Schema::hasColumn('company_preferences', 'ui_theme_template')) {
                $table->string('ui_theme_template', 30)->default('default')->after('primary_color');
            }
            if (!Schema::hasColumn('company_preferences', 'ui_accent_color')) {
                $table->string('ui_accent_color', 7)->default('#1e293b')->after('ui_theme_template');
            }
            if (!Schema::hasColumn('company_preferences', 'ui_header_color')) {
                $table->string('ui_header_color', 7)->default('#ffffff')->after('ui_accent_color');
            }
            if (!Schema::hasColumn('company_preferences', 'ui_sidebar_color')) {
                $table->string('ui_sidebar_color', 7)->default('#1e293b')->after('ui_header_color');
            }
            if (!Schema::hasColumn('company_preferences', 'ui_background_color')) {
                $table->string('ui_background_color', 7)->default('#f1f5f9')->after('ui_sidebar_color');
            }
            if (!Schema::hasColumn('company_preferences', 'ui_font_family')) {
                $table->string('ui_font_family', 30)->default('inter')->after('ui_background_color');
            }
            if (!Schema::hasColumn('company_preferences', 'company_logo_png')) {
                $table->longText('company_logo_png')->nullable()->after('ui_font_family');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('company_preferences')) {
            return;
        }

        Schema::table('company_preferences', function (Blueprint $table) {
            $columns = [
                'company_logo_png',
                'ui_font_family',
                'ui_background_color',
                'ui_sidebar_color',
                'ui_header_color',
                'ui_accent_color',
                'ui_theme_template',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('company_preferences', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
