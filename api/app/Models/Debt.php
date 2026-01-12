<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Debt extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'customer_id',
        'agent_id',
        'total_amount',
        'paid_amount',
        'remaining_amount',
        'status',
        'due_date',
        'notes',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'due_date' => 'date',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class)->orderBy('created_at', 'desc');
    }

    /**
     * Get all orders associated with this debt (for consolidated debt)
     */
    public function orders()
    {
        return $this->belongsToMany(Order::class, 'debt_orders')
            ->withPivot('amount')
            ->withTimestamps();
    }

    /**
     * Get debt_orders pivot table records (sắp xếp theo thời gian gộp vào công nợ - mới nhất lên đầu)
     */
    public function debtOrders()
    {
        return $this->hasMany(DebtOrder::class)->orderBy('created_at', 'desc');
    }

    /**
     * Update remaining amount and status based on payments
     * Chỉ tính các payments đã được confirmed
     */
    public function updateStatus()
    {
        // Chỉ tính các payments đã được đại lý xác nhận
        $this->paid_amount = $this->payments()->where('status', 'confirmed')->sum('amount');
        $this->remaining_amount = $this->total_amount - $this->paid_amount;

        if ($this->remaining_amount <= 0) {
            $this->status = 'paid';
        } elseif ($this->paid_amount > 0) {
            $this->status = 'partial';
        } else {
            $this->status = 'pending';
        }

        $this->save();
    }
}
