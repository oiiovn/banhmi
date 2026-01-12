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
        Schema::create('order_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Người thực hiện
            $table->string('action'); // add_item, remove_item, update_quantity, update_discount, accept_order
            $table->string('entity_type')->nullable(); // order_item, order
            $table->unsignedBigInteger('entity_id')->nullable(); // ID của item hoặc order
            $table->json('old_value')->nullable(); // Giá trị trước khi thay đổi
            $table->json('new_value')->nullable(); // Giá trị sau khi thay đổi
            $table->text('description')->nullable(); // Mô tả chi tiết
            $table->timestamps();
            
            $table->index(['order_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_audit_logs');
    }
};
