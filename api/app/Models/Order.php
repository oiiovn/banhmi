<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'agent_id',
        'total_amount',
        'discount',
        'status',
        'delivery_address',
        'phone',
        'notes',
        'accepted_at',
        'accepted_by',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'discount' => 'decimal:2',
        'accepted_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function auditLogs()
    {
        return $this->hasMany(OrderAuditLog::class)->orderBy('created_at', 'desc');
    }

    public function acceptedBy()
    {
        return $this->belongsTo(User::class, 'accepted_by');
    }

    /**
     * Calculate profit for this order
     * Profit = Sum of [(wholesale_price - original_price) × quantity] for all items - discount
     */
    public function calculateProfit()
    {
        $profit = 0;
        
        // Load items with product information (bao gồm cả sản phẩm đã bị xóa mềm)
        $items = $this->items()->with(['product' => function($query) {
            $query->withTrashed();
        }])->get();
        
        foreach ($items as $item) {
            $product = $item->product;
            if (!$product) {
                continue;
            }
            
            // Get wholesale_price (price sold to customer) and original_price (cost price)
            $wholesalePrice = $product->wholesale_price ?? $product->price ?? 0;
            $originalPrice = $product->original_price ?? 0;
            
            // Profit per item = (wholesale_price - original_price) × quantity
            $itemProfit = ($wholesalePrice - $originalPrice) * $item->quantity;
            $profit += $itemProfit;
        }
        
        // Subtract discount if any
        $discount = $this->discount ?? 0;
        $profit -= $discount;
        
        return max(0, $profit); // Ensure profit is not negative
    }
}

