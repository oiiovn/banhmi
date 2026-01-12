<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderAuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'user_id',
        'action',
        'entity_type',
        'entity_id',
        'old_value',
        'new_value',
        'description',
    ];

    protected $casts = [
        'old_value' => 'array',
        'new_value' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
