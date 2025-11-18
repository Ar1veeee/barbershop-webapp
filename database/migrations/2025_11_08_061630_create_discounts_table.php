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
        Schema::create('discounts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique()->nullable();
            $table->text('description')->nullable();
            $table->enum('discount_type', ['percentage', 'fixed_amount']);
            $table->decimal('discount_value', 10, 2);
            $table->decimal('max_discount_amount', 10, 2)->nullable();
            $table->decimal('min_order_amount', 10, 2)->nullable();
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->integer('usage_limit')->nullable();
            $table->integer('used_count')->default(0);
            $table->integer('customer_usage_limit')->nullable();
            $table->boolean('is_active')->default(true);
            $table->enum('applies_to', ['all', 'specific'])->default('all');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

        /**
         * Reverse the migrations.
         */
        public
        function down(): void
        {
            Schema::dropIfExists('discounts');
        }
    };
