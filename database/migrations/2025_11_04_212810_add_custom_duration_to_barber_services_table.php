<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // database/migrations/xxxx_add_custom_duration_to_barber_services_table.php

    public function up()
    {
        Schema::table('barber_services', function (Blueprint $table) {
            $table->integer('custom_duration')->nullable()->after('custom_price');
        });
    }

    public function down()
    {
        Schema::table('barber_services', function (Blueprint $table) {
            $table->dropColumn('custom_duration');
        });
    }
};
