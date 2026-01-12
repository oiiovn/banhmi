<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'price',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        // Sử dụng withTrashed() để load cả sản phẩm đã bị xóa mềm
        // Điều này đảm bảo các đơn hàng cũ vẫn hiển thị sản phẩm bình thường
        return $this->belongsTo(Product::class)->withTrashed()->withDefault([
            'name' => 'Sản phẩm đã bị xóa',
            'description' => null,
            'price' => $this->price, // Giữ giá gốc từ order_item
            'image' => null,
        ]);
    }
}

