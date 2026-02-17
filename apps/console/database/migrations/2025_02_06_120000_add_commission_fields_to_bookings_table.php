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
        if (! Schema::hasTable('bookings')) {
            return;
        }

        Schema::table('bookings', function (Blueprint $table) {
            if (! Schema::hasColumn('bookings', 'total_amount_lkr')) {
                $table->decimal('total_amount_lkr', 10, 2)->nullable();
            }

            if (! Schema::hasColumn('bookings', 'commission_rate')) {
                $table->decimal('commission_rate', 10, 6)->default(0.022);
            }

            if (! Schema::hasColumn('bookings', 'commission_amount_lkr')) {
                $table->decimal('commission_amount_lkr', 10, 2)->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('bookings')) {
            return;
        }

        $columnsToDrop = array_values(array_filter([
            Schema::hasColumn('bookings', 'total_amount_lkr') ? 'total_amount_lkr' : null,
            Schema::hasColumn('bookings', 'commission_rate') ? 'commission_rate' : null,
            Schema::hasColumn('bookings', 'commission_amount_lkr') ? 'commission_amount_lkr' : null,
        ]));

        if (! count($columnsToDrop)) {
            return;
        }

        Schema::table('bookings', function (Blueprint $table) use ($columnsToDrop) {
            $table->dropColumn($columnsToDrop);
        });
    }
};
