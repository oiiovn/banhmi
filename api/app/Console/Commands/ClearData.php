<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Debt;
use App\Models\DebtOrder;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Category;
use App\Models\OrderAuditLog;

class ClearData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'data:clear {--confirm : Skip confirmation prompt}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Xóa hết dữ liệu đơn hàng, công nợ, thanh toán (giữ lại sản phẩm và danh mục)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (!$this->option('confirm')) {
            if (!$this->confirm('Bạn có chắc chắn muốn xóa TẤT CẢ dữ liệu đơn hàng, công nợ và thanh toán? (Sản phẩm và danh mục sẽ được giữ lại) Hành động này không thể hoàn tác!')) {
                $this->info('Đã hủy thao tác.');
                return 0;
            }
        }

        $this->info('Đang xóa dữ liệu...');

        try {
            // Tắt foreign key checks tạm thời
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            
            // Xóa theo thứ tự để tránh lỗi foreign key constraint
            
            // 1. Xóa audit logs
            $this->info('Đang xóa audit logs...');
            OrderAuditLog::truncate();
            
            // 2. Xóa payments
            $this->info('Đang xóa payments...');
            Payment::truncate();
            
            // 3. Xóa debt_orders (pivot table)
            $this->info('Đang xóa debt_orders...');
            DebtOrder::truncate();
            
            // 4. Xóa debts
            $this->info('Đang xóa debts...');
            Debt::truncate();
            
            // 5. Xóa order_items
            $this->info('Đang xóa order_items...');
            OrderItem::truncate();
            
            // 6. Xóa orders
            $this->info('Đang xóa orders...');
            Order::truncate();
            
            // KHÔNG xóa products và categories - giữ lại theo yêu cầu

            // Bật lại foreign key checks
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            
            $this->info('✅ Đã xóa thành công dữ liệu đơn hàng, công nợ và thanh toán!');
            $this->info('');
            $this->info('Các bảng đã được xóa:');
            $this->line('- Order Audit Logs');
            $this->line('- Payments');
            $this->line('- Debt Orders');
            $this->line('- Debts');
            $this->line('- Order Items');
            $this->line('- Orders');
            $this->info('');
            $this->info('Các bảng được GIỮ LẠI:');
            $this->line('✓ Products (Sản phẩm)');
            $this->line('✓ Categories (Danh mục)');
            
            return 0;
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('❌ Lỗi khi xóa dữ liệu: ' . $e->getMessage());
            return 1;
        }
    }
}

