<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Tạo bảng debt_orders để liên kết nhiều đơn hàng với một công nợ tổng
     */
    public function up(): void
    {
        Schema::create('debt_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('debt_id')->constrained('debts')->onDelete('cascade');
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->decimal('amount', 15, 2); // Số tiền của đơn hàng này trong công nợ
            $table->timestamps();

            // Đảm bảo mỗi đơn hàng chỉ liên kết với một công nợ
            $table->unique(['order_id']);
            
            // Index để tìm nhanh các đơn hàng trong một công nợ
            $table->index(['debt_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('debt_orders');
    }
};
