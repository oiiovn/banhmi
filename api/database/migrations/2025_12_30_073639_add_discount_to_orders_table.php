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
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('discount', 10, 2)->default(0)->after('total_amount');
            $table->timestamp('accepted_at')->nullable()->after('notes');
            $table->foreignId('accepted_by')->nullable()->after('accepted_at')->constrained('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['accepted_by']);
            $table->dropColumn(['discount', 'accepted_at', 'accepted_by']);
        });
    }
};
