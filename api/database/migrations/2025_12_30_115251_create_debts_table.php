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
        Schema::create('debts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('customer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('agent_id')->constrained('users')->onDelete('cascade');
            $table->decimal('total_amount', 15, 2); // Tổng số tiền nợ
            $table->decimal('paid_amount', 15, 2)->default(0); // Số tiền đã thanh toán
            $table->decimal('remaining_amount', 15, 2); // Số tiền còn lại
            $table->enum('status', ['pending', 'partial', 'paid', 'cancelled'])->default('pending');
            $table->date('due_date')->nullable(); // Ngày đến hạn
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['customer_id', 'status']);
            $table->index(['agent_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('debts');
    }
};
