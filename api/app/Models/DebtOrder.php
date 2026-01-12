<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DebtOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'debt_id',
        'order_id',
        'amount',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function debt()
    {
        return $this->belongsTo(Debt::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
