<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Thay đổi cấu trúc bảng debts để hỗ trợ gộp công nợ:
     * - order_id thành nullable (một công nợ có thể có nhiều đơn hàng)
     * - Thêm unique constraint cho (customer_id, agent_id) để đảm bảo mỗi cặp chỉ có một công nợ tổng
     */
    public function up(): void
    {
        Schema::table('debts', function (Blueprint $table) {
            // Thay đổi order_id thành nullable
            $table->foreignId('order_id')->nullable()->change();
        });

        // Thêm index mới cho (customer_id, agent_id, status) để tìm nhanh công nợ tổng
        // Không drop index cũ vì có thể đang được sử dụng
        Schema::table('debts', function (Blueprint $table) {
            $table->index(['customer_id', 'agent_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('debts', function (Blueprint $table) {
            // Xóa index mới
            $table->dropIndex(['customer_id', 'agent_id', 'status']);
            
            // Khôi phục order_id thành not null (cần migrate dữ liệu trước)
            $table->foreignId('order_id')->nullable(false)->change();
        });
    }
};
