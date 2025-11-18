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
        Schema::create('discount_applicables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('discount_id')->constrained()->onDelete('cascade');
            $table->enum('applicable_type', ['service', 'category', 'barber']);
            $table->unsignedBigInteger('applicable_id');
            $table->timestamps();

            $table->unique(['discount_id', 'applicable_type', 'applicable_id'], 'idx_disc_app');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discount_applicables');
    }
};
