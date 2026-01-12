<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'debt_id',
        'customer_id',
        'agent_id',
        'amount',
        'payment_method',
        'payment_date',
        'notes',
        'status',
        'confirmed_at',
        'confirmed_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
        'confirmed_at' => 'datetime',
    ];

    public function debt()
    {
        return $this->belongsTo(Debt::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function confirmedBy()
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }
}
