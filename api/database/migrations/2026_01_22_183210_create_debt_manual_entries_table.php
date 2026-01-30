<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Tạo bảng debt_manual_entries để lưu lịch sử công nợ thủ công
     * Tương tự như debt_orders nhưng cho công nợ thủ công (không có order_id)
     */
    public function up(): void
    {
        Schema::create('debt_manual_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('debt_id')->constrained('debts')->onDelete('cascade');
            $table->decimal('amount', 15, 2); // Số tiền công nợ thủ công
            $table->text('notes'); // Ghi chú khi tạo công nợ
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade'); // Agent tạo công nợ
            $table->timestamps();

            // Index để tìm nhanh các công nợ thủ công trong một debt
            $table->index(['debt_id']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('debt_manual_entries');
    }
};
