<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('journal_entry_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->string('code', 10); // PD, PI, PB, etc.
            $table->string('name', 100);
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->unique(['company_id', 'code']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('journal_entry_types');
    }
};
