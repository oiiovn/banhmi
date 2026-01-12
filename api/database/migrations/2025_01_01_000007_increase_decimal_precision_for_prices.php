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
        Schema::table('products', function (Blueprint $table) {
            // Tăng độ dài từ decimal(10, 2) lên decimal(15, 2) để hỗ trợ giá trị lớn hơn
            // decimal(15, 2) = 13 chữ số trước dấu thập phân + 2 chữ số sau
            $table->decimal('price', 15, 2)->nullable()->change();
            $table->decimal('wholesale_price', 15, 2)->nullable()->change();
            $table->decimal('original_price', 15, 2)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Revert về decimal(10, 2)
            $table->decimal('price', 10, 2)->nullable()->change();
            $table->decimal('wholesale_price', 10, 2)->nullable()->change();
            $table->decimal('original_price', 10, 2)->nullable()->change();
        });
    }
};




