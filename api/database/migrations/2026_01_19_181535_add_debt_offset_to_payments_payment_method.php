<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Thêm 'debt_offset' vào ENUM payment_method
        DB::statement("ALTER TABLE payments MODIFY COLUMN payment_method ENUM('cash', 'bank_transfer', 'debt_offset', 'other') DEFAULT 'cash'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Chuyển các payment có debt_offset về other trước khi xóa enum value
        DB::table('payments')->where('payment_method', 'debt_offset')->update(['payment_method' => 'other']);
        
        // Xóa 'debt_offset' khỏi ENUM
        DB::statement("ALTER TABLE payments MODIFY COLUMN payment_method ENUM('cash', 'bank_transfer', 'other') DEFAULT 'cash'");
    }
};
