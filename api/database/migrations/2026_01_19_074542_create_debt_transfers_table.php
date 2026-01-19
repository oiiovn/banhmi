<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Tạo bảng debt_transfers để quản lý chuyển công nợ giữa 2 đại lý
     * Ví dụ: A nợ B 500k, B nợ A 100k → chuyển 100k → A còn nợ B 400k
     */
    public function up(): void
    {
        Schema::create('debt_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('from_debt_id')->constrained('debts')->onDelete('cascade'); // Công nợ A nợ B
            $table->foreignId('to_debt_id')->constrained('debts')->onDelete('cascade');   // Công nợ B nợ A
            $table->decimal('amount', 15, 2); // Số tiền được trừ (100k)
            $table->enum('status', ['pending', 'confirmed', 'rejected'])->default('pending');
            $table->foreignId('initiated_by')->constrained('users')->onDelete('cascade'); // A (người tạo)
            $table->foreignId('confirmed_by')->nullable()->constrained('users')->onDelete('set null'); // B (người xác nhận)
            $table->text('description')->nullable(); // Ghi chú
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamps();

            // Index để tìm nhanh các yêu cầu chuyển công nợ
            $table->index(['status', 'initiated_by']);
            $table->index(['status', 'confirmed_by']);
            $table->index('from_debt_id');
            $table->index('to_debt_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('debt_transfers');
    }
};
