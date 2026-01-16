<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "🔍 Kiểm tra bảng debt...\n\n";

try {
    // Kiểm tra bảng debts
    if (DB::getSchemaBuilder()->hasTable('debts')) {
        echo "✅ Bảng 'debts' đã tồn tại\n";
        
        // Kiểm tra order_id nullable
        $columns = DB::select("SHOW COLUMNS FROM debts WHERE Field = 'order_id'");
        if (!empty($columns) && $columns[0]->Null === 'YES') {
            echo "✅ Cột 'order_id' trong 'debts' đã nullable\n";
        } else {
            echo "❌ Cột 'order_id' trong 'debts' CHƯA nullable!\n";
        }
    } else {
        echo "❌ Bảng 'debts' CHƯA tồn tại!\n";
    }
    
    // Kiểm tra bảng debt_orders
    if (DB::getSchemaBuilder()->hasTable('debt_orders')) {
        echo "✅ Bảng 'debt_orders' đã tồn tại\n";
        
        // Kiểm tra structure
        $columns = DB::select("SHOW COLUMNS FROM debt_orders");
        echo "   Các cột: " . implode(', ', array_column($columns, 'Field')) . "\n";
    } else {
        echo "❌ Bảng 'debt_orders' CHƯA tồn tại! (QUAN TRỌNG!)\n";
    }
    
    // Kiểm tra bảng payments
    if (DB::getSchemaBuilder()->hasTable('payments')) {
        echo "✅ Bảng 'payments' đã tồn tại\n";
    } else {
        echo "⚠️  Bảng 'payments' chưa tồn tại (không bắt buộc)\n";
    }
    
    echo "\n✅ Kiểm tra hoàn tất!\n";
    
} catch (\Exception $e) {
    echo "❌ Lỗi: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
