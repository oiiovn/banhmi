<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DebtTransfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'from_debt_id',
        'to_debt_id',
        'amount',
        'status',
        'initiated_by',
        'confirmed_by',
        'description',
        'confirmed_at',
        'rejected_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'confirmed_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    /**
     * Công nợ A nợ B (công nợ sẽ bị trừ)
     */
    public function fromDebt()
    {
        return $this->belongsTo(Debt::class, 'from_debt_id');
    }

    /**
     * Công nợ B nợ A (công nợ sẽ được trừ)
     */
    public function toDebt()
    {
        return $this->belongsTo(Debt::class, 'to_debt_id');
    }

    /**
     * Người tạo yêu cầu chuyển công nợ (A)
     */
    public function initiator()
    {
        return $this->belongsTo(User::class, 'initiated_by');
    }

    /**
     * Người xác nhận yêu cầu (B)
     */
    public function confirmer()
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }
}
