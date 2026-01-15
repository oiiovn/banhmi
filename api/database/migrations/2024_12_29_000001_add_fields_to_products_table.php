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
            $table->string('sku')->nullable()->after('id'); // Mã sản phẩm
            $table->decimal('wholesale_price', 10, 2)->nullable()->after('price'); // Giá sỉ
            $table->decimal('original_price', 10, 2)->nullable()->after('wholesale_price'); // Giá gốc
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['sku', 'wholesale_price', 'original_price']);
        });
    }
};





