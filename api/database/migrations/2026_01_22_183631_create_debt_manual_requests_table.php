<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Tạo bảng debt_manual_requests để lưu các yêu cầu công nợ thủ công đang chờ khách hàng xác nhận
     */
    public function up(): void
    {
        Schema::create('debt_manual_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('agent_id')->constrained('users')->onDelete('cascade');
            $table->decimal('amount', 15, 2); // Số tiền công nợ
            $table->text('notes'); // Ghi chú
            $table->enum('status', ['pending', 'confirmed', 'rejected'])->default('pending');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade'); // Agent tạo yêu cầu
            $table->foreignId('confirmed_by')->nullable()->constrained('users')->onDelete('set null'); // Customer xác nhận
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamps();

            // Index để tìm nhanh các yêu cầu
            $table->index(['customer_id', 'status']);
            $table->index(['agent_id', 'status']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('debt_manual_requests');
    }
};
