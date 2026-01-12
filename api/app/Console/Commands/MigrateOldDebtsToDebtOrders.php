<?php

namespace App\Console\Commands;

use App\Models\Debt;
use App\Models\DebtOrder;
use Illuminate\Console\Command;

class MigrateOldDebtsToDebtOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'debts:migrate-old';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate old debts (with order_id) to debt_orders table';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Bắt đầu migrate công nợ cũ...');

        // Tìm tất cả công nợ có order_id nhưng chưa có debtOrders
        $debts = Debt::whereNotNull('order_id')
            ->whereDoesntHave('debtOrders')
            ->get();

        $this->info("Tìm thấy {$debts->count()} công nợ cần migrate.");

        $migrated = 0;
        $skipped = 0;

        foreach ($debts as $debt) {
            // Kiểm tra xem đã có debtOrder cho order_id này chưa
            $existingDebtOrder = DebtOrder::where('order_id', $debt->order_id)->first();
            
            if ($existingDebtOrder) {
                $this->warn("Đơn hàng #{$debt->order_id} đã có trong debt_orders (debt_id: {$existingDebtOrder->debt_id}). Bỏ qua.");
                $skipped++;
                continue;
            }

            // Tạo debtOrder cho công nợ cũ
            DebtOrder::create([
                'debt_id' => $debt->id,
                'order_id' => $debt->order_id,
                'amount' => $debt->total_amount,
            ]);

            $migrated++;
            $this->info("Đã migrate công nợ #{$debt->id} (đơn hàng #{$debt->order_id})");
        }

        $this->info("Hoàn thành! Đã migrate {$migrated} công nợ, bỏ qua {$skipped} công nợ.");
        
        return Command::SUCCESS;
    }
}
