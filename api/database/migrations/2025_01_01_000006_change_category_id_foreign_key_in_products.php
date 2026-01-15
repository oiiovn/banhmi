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
            // Drop existing foreign key
            $table->dropForeign(['category_id']);
            
            // Make category_id nullable first
            $table->unsignedBigInteger('category_id')->nullable()->change();
            
            // Add new foreign key with onDelete('set null')
            $table->foreign('category_id')
                  ->references('id')
                  ->on('categories')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Drop the new foreign key
            $table->dropForeign(['category_id']);
            
            // Make category_id not nullable
            $table->unsignedBigInteger('category_id')->nullable(false)->change();
            
            // Restore original foreign key with cascade
            $table->foreign('category_id')
                  ->references('id')
                  ->on('categories')
                  ->onDelete('cascade');
        });
    }
};





