<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Debt;
use App\Models\DebtTransfer;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DebtController extends Controller
{
    /**
     * Get debts for customer (hoặc agent ở chế độ khách hàng)
     */
    public function indexForCustomer(Request $request)
    {
        $user = $request->user();
        
        // Chỉ chặn admin, cho phép customer và agent
        if ($user->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Admin cannot view customer debts',
            ], 403);
        }

        // Chỉ load relationships cần thiết để tăng tốc độ
        $query = Debt::with(['agent:id,name,phone', 'payments:id,debt_id,amount,payment_date,status'])
            ->where('customer_id', $user->id);

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Tính statistics trực tiếp từ database (nhanh hơn nhiều)
        $statsQuery = Debt::where('customer_id', $user->id);
        if ($request->has('status') && $request->status) {
            $statsQuery->where('status', $request->status);
        }
        
        $stats = [
            'total_debts' => $statsQuery->count(),
            'total_amount' => $statsQuery->sum('total_amount'),
            'total_paid' => $statsQuery->sum('paid_amount'),
            'total_remaining' => $statsQuery->sum('remaining_amount'),
            'pending_count' => (clone $statsQuery)->where('status', 'pending')->count(),
            'partial_count' => (clone $statsQuery)->where('status', 'partial')->count(),
            'paid_count' => (clone $statsQuery)->where('status', 'paid')->count(),
        ];

        // Chỉ load debts với relationships tối thiểu (giới hạn 100 records)
        $debts = $query->orderBy('created_at', 'desc')->limit(100)->get();

        return response()->json([
            'success' => true,
            'data' => $debts,
            'stats' => $stats,
        ]);
    }

    /**
     * Get debts for agent
     */
    public function indexForAgent(Request $request)
    {
        if (!$request->user()->isAgent()) {
            return response()->json([
                'success' => false,
                'message' => 'Only agents can view debts',
            ], 403);
        }

        $agentId = $request->user()->id;

        // Chỉ load relationships cần thiết để tăng tốc độ
        $query = Debt::with(['customer:id,name,phone', 'payments:id,debt_id,amount,payment_date,status'])
            ->where('agent_id', $agentId);

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by customer
        if ($request->has('customer_id') && $request->customer_id) {
            $query->where('customer_id', $request->customer_id);
        }

        // Tính statistics trực tiếp từ database (nhanh hơn nhiều)
        $statsQuery = Debt::where('agent_id', $agentId);
        if ($request->has('status') && $request->status) {
            $statsQuery->where('status', $request->status);
        }
        if ($request->has('customer_id') && $request->customer_id) {
            $statsQuery->where('customer_id', $request->customer_id);
        }
        
        $stats = [
            'total_debts' => $statsQuery->count(),
            'total_amount' => $statsQuery->sum('total_amount'),
            'total_paid' => $statsQuery->sum('paid_amount'),
            'total_remaining' => $statsQuery->sum('remaining_amount'),
            'pending_count' => (clone $statsQuery)->where('status', 'pending')->count(),
            'partial_count' => (clone $statsQuery)->where('status', 'partial')->count(),
            'paid_count' => (clone $statsQuery)->where('status', 'paid')->count(),
        ];

        // Chỉ load debts với relationships tối thiểu (giới hạn 100 records)
        $debts = $query->orderBy('created_at', 'desc')->limit(100)->get();

        // Lấy danh sách customer_ids để tìm công nợ đối ứng
        $customerIds = $debts->pluck('customer_id')->unique()->toArray();
        
        // Tìm tất cả công nợ đối ứng (agent nợ customer) một lần
        $oppositeDebts = Debt::where('customer_id', $agentId)
            ->whereIn('agent_id', $customerIds)
            ->where('remaining_amount', '>', 0)
            ->where('status', '!=', 'paid')
            ->get()
            ->keyBy('agent_id'); // Key by agent_id để dễ lookup

        // Lấy danh sách debt IDs để kiểm tra pending transfers
        $debtIds = $debts->pluck('id')->toArray();
        $oppositeDebtIds = $oppositeDebts->pluck('id')->toArray();
        $allDebtIds = array_merge($debtIds, $oppositeDebtIds);
        
        // Tìm tất cả pending transfers liên quan đến các công nợ này
        $pendingTransfers = DebtTransfer::where('status', 'pending')
            ->where(function($query) use ($allDebtIds) {
                $query->whereIn('from_debt_id', $allDebtIds)
                      ->orWhereIn('to_debt_id', $allDebtIds);
            })
            ->get();
        
        // Tạo set các cặp debt có pending transfer
        $pendingPairs = [];
        foreach ($pendingTransfers as $transfer) {
            $key1 = $transfer->from_debt_id . '-' . $transfer->to_debt_id;
            $key2 = $transfer->to_debt_id . '-' . $transfer->from_debt_id;
            $pendingPairs[$key1] = true;
            $pendingPairs[$key2] = true;
        }

        // Thêm can_offset cho mỗi debt
        $debtsWithOffset = $debts->map(function($debt) use ($oppositeDebts, $agentId, $pendingPairs) {
            $debtArray = $debt->toArray();
            
            // Công nợ đối ứng: agent nợ customer của debt này
            $oppositeDebt = $oppositeDebts->get($debt->customer_id);
            
            if (!$oppositeDebt || $debt->remaining_amount <= 0 || $debt->status === 'paid') {
                $debtArray['can_offset'] = false;
            } else {
                // Kiểm tra đã có pending transfer chưa
                $pairKey = $debt->id . '-' . $oppositeDebt->id;
                $hasPendingTransfer = isset($pendingPairs[$pairKey]);
                
                if ($hasPendingTransfer) {
                    // Đã có yêu cầu bù trừ đang chờ → không cho tạo thêm
                    $debtArray['can_offset'] = false;
                    $debtArray['has_pending_transfer'] = true;
                } else {
                    // Chỉ cho phép bù trừ khi agent nợ ÍT HƠN hoặc BẰNG
                    $partnerOwesMe = (float) $debt->remaining_amount;
                    $iOwePartner = (float) $oppositeDebt->remaining_amount;
                    $debtArray['can_offset'] = $iOwePartner <= $partnerOwesMe;
                }
            }
            
            return $debtArray;
        });

        return response()->json([
            'success' => true,
            'data' => $debtsWithOffset,
            'stats' => $stats,
        ]);
    }

    /**
     * Get single debt details
     */
   public function show(Request $request, $id)
{
    $debt = Debt::with([
        // Đơn hàng gộp công nợ (consolidated debt orders)
        'debtOrders.order.items.product',
        'debtOrders.order.user:id,name,phone',
        'debtOrders.order.agent:id,name,phone',

        // Công nợ 1 đơn (legacy)
        'order.items.product',
        'order.user:id,name,phone',
        'order.agent:id,name,phone',

        // Quan hệ chính
        'customer:id,name,phone',
        'agent:id,name,phone',

        // Thanh toán
        'payments.confirmedBy:id,name',

        // (OPTIONAL – nếu bạn có công nợ chéo)
        // 'outgoingTransfers.toDebt.customer',
        // 'incomingTransfers.fromDebt.agent',
    ])->findOrFail($id);

    $user = $request->user();

    /**
     * ✅ RULE CHUẨN:
     * - Admin: xem tất
     * - Customer: xem nếu là customer_id
     * - Agent: xem nếu là agent_id HOẶC customer_id (công nợ chéo)
     */
    $canView =
        $user->role === 'admin'
        || $debt->customer_id === $user->id
        || $debt->agent_id === $user->id;

    if (!$canView) {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized',
        ], 403);
    }

    return response()->json([
        'success' => true,
        'data' => $debt,
    ]);
}


    /**
     * Create debt manually (usually auto-created when order is confirmed)
     */
    public function store(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $order = Order::with('items')->findOrFail($request->order_id);

        // Check if debt already exists for this order
        $existingDebt = Debt::where('order_id', $order->id)->first();
        if ($existingDebt) {
            return response()->json([
                'success' => false,
                'message' => 'Debt already exists for this order',
            ], 400);
        }

        // Calculate total amount (considering discount)
        $totalAmount = $order->total_amount - ($order->discount ?? 0);

        $debt = Debt::create([
            'order_id' => $order->id,
            'customer_id' => $order->user_id,
            'agent_id' => $order->agent_id,
            'total_amount' => $totalAmount,
            'paid_amount' => 0,
            'remaining_amount' => $totalAmount,
            'status' => 'pending',
            'due_date' => $request->due_date,
            'notes' => $request->notes,
        ]);

        $debt->load(['order', 'customer', 'agent']);

        return response()->json([
            'success' => true,
            'data' => $debt,
            'message' => 'Debt created successfully',
        ], 201);
    }

    /**
     * Update debt (only notes and due_date)
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $debt = Debt::findOrFail($id);

        // Check permission
        if ($request->user()->isAgent() && $debt->agent_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($request->has('due_date')) {
            $debt->due_date = $request->due_date;
        }
        if ($request->has('notes')) {
            $debt->notes = $request->notes;
        }

        $debt->save();

        $debt->load(['order', 'customer', 'agent', 'payments.confirmedBy']);

        return response()->json([
            'success' => true,
            'data' => $debt,
            'message' => 'Debt updated successfully',
        ]);
    }

    /**
     * Tìm công nợ đối ứng cho một công nợ cụ thể
     * Ví dụ: Nếu debt A: customer_id=X nợ agent_id=Y
     * Thì đối ứng là debt B: customer_id=Y nợ agent_id=X
     * 
     * Logic: Chỉ người nợ ÍT HƠN mới được đề xuất bù trừ
     */
    public function findOppositeDebt(Request $request, $id)
    {
        if (!$request->user()->isAgent()) {
            return response()->json([
                'success' => false,
                'message' => 'Only agents can find opposite debts',
            ], 403);
        }

        $agentId = $request->user()->id;
        $currentDebt = Debt::with(['customer', 'agent'])->findOrFail($id);

        // Kiểm tra: công nợ hiện tại phải thuộc về agent này
        // currentDebt: khách hàng X nợ đại lý Y (agent_id = Y)
        if ($currentDebt->agent_id !== $agentId) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền xem công nợ này',
            ], 403);
        }

        // Tìm công nợ đối ứng:
        // - Đại lý hiện tại (agentId) là customer_id
        // - Khách hàng của công nợ hiện tại (customer_id) là agent_id
        // Tức là: agentId nợ customer_id của currentDebt
        $oppositeDebt = Debt::with(['customer', 'agent'])
            ->where('customer_id', $agentId)
            ->where('agent_id', $currentDebt->customer_id)
            ->where('remaining_amount', '>', 0)
            ->where('status', '!=', 'paid')
            ->first();

        // Tính toán ai nợ nhiều hơn
        // currentDebt: đối tác (customer) nợ agent (tôi là chủ nợ)
        // oppositeDebt: agent (tôi) nợ đối tác (tôi là con nợ)
        $partnerOwesMe = (float) $currentDebt->remaining_amount; // Đối tác nợ tôi
        $iOwePartner = $oppositeDebt ? (float) $oppositeDebt->remaining_amount : 0; // Tôi nợ đối tác
        
        // Chỉ cho phép bù trừ khi:
        // 1. Có công nợ đối ứng
        // 2. Tôi nợ ÍT HƠN hoặc BẰNG đối tác nợ tôi (tôi là người có lợi thế)
        $canOffset = $oppositeDebt !== null && $iOwePartner <= $partnerOwesMe;

        return response()->json([
            'success' => true,
            'data' => [
                'current_debt' => $currentDebt,
                'opposite_debt' => $oppositeDebt,
                'can_offset' => $canOffset,
                'partner_owes_me' => $partnerOwesMe,
                'i_owe_partner' => $iOwePartner,
                'i_owe_less' => $iOwePartner <= $partnerOwesMe,
            ],
        ]);
    }

    /**
     * Tạo yêu cầu chuyển công nợ
     * Ví dụ: A nợ B 500k, B nợ A 100k → chuyển 100k → A còn nợ B 400k
     */
    public function createTransfer(Request $request)
    {
        if (!$request->user()->isAgent()) {
            return response()->json([
                'success' => false,
                'message' => 'Only agents can create debt transfers',
            ], 403);
        }

        $request->validate([
            'from_debt_id' => 'required|exists:debts,id', // Công nợ A nợ B
            'to_debt_id' => 'required|exists:debts,id',   // Công nợ B nợ A
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:1000',
        ]);

        $agentId = $request->user()->id;

        // Validate debts
        $fromDebt = Debt::findOrFail($request->from_debt_id);
        $toDebt = Debt::findOrFail($request->to_debt_id);

        // Kiểm tra: from_debt phải là công nợ A nợ B (A là customer, B là agent)
        // from_debt: A (agent hiện tại) nợ B (agent khác)
        // → customer_id = A (agentId), agent_id = B (khác agentId)
        if ($fromDebt->customer_id !== $agentId || $fromDebt->agent_id === $agentId) {
            return response()->json([
                'success' => false,
                'message' => 'from_debt_id phải là công nợ bạn nợ đại lý khác',
            ], 400);
        }

        // Kiểm tra: to_debt phải là công nợ B nợ A (B là customer, A là agent)
        // to_debt: B (agent khác) nợ A (agent hiện tại)
        // → customer_id = B (khác agentId), agent_id = A (agentId)
        if ($toDebt->agent_id !== $agentId || $toDebt->customer_id === $agentId) {
            return response()->json([
                'success' => false,
                'message' => 'to_debt_id phải là công nợ đại lý khác nợ bạn',
            ], 400);
        }

        // Kiểm tra: hai công nợ phải cùng cặp (A-B và B-A)
        if ($fromDebt->agent_id !== $toDebt->customer_id || $fromDebt->customer_id !== $toDebt->agent_id) {
            return response()->json([
                'success' => false,
                'message' => 'Hai công nợ không phải cùng một cặp đại lý',
            ], 400);
        }

        // Kiểm tra: amount không được vượt quá min(remaining_amount của cả hai công nợ)
        $maxAmount = min($fromDebt->remaining_amount, $toDebt->remaining_amount);
        if ($request->amount > $maxAmount) {
            return response()->json([
                'success' => false,
                'message' => "Số tiền chuyển không được vượt quá {$maxAmount} đ",
            ], 400);
        }

        // Kiểm tra: cả hai công nợ phải còn nợ (status không phải 'paid')
        if ($fromDebt->status === 'paid' || $toDebt->status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Không thể chuyển công nợ đã thanh toán hết',
            ], 400);
        }

        // Kiểm tra: đã có yêu cầu bù trừ pending giữa 2 bên chưa
        // Tìm cả 2 chiều: A→B hoặc B→A
        $existingTransfer = DebtTransfer::where('status', 'pending')
            ->where(function($query) use ($fromDebt, $toDebt) {
                // Chiều 1: from_debt và to_debt giống với request
                $query->where(function($q) use ($fromDebt, $toDebt) {
                    $q->where('from_debt_id', $fromDebt->id)
                      ->where('to_debt_id', $toDebt->id);
                })
                // Chiều 2: ngược lại (đối tác đã tạo request trước)
                ->orWhere(function($q) use ($fromDebt, $toDebt) {
                    $q->where('from_debt_id', $toDebt->id)
                      ->where('to_debt_id', $fromDebt->id);
                });
            })
            ->first();

        if ($existingTransfer) {
            return response()->json([
                'success' => false,
                'message' => 'Đã có yêu cầu bù trừ đang chờ xác nhận giữa hai bên. Vui lòng xử lý yêu cầu hiện tại trước.',
            ], 400);
        }

        // Tạo yêu cầu chuyển công nợ
        $debtTransfer = DebtTransfer::create([
            'from_debt_id' => $request->from_debt_id,
            'to_debt_id' => $request->to_debt_id,
            'amount' => $request->amount,
            'status' => 'pending',
            'initiated_by' => $agentId,
            'description' => $request->description,
        ]);

        $debtTransfer->load(['fromDebt.agent', 'toDebt.customer', 'initiator']);

        return response()->json([
            'success' => true,
            'data' => $debtTransfer,
            'message' => 'Yêu cầu chuyển công nợ đã được tạo',
        ], 201);
    }

    /**
     * Lấy danh sách yêu cầu bù trừ công nợ pending
     * Bao gồm cả:
     * 1. Yêu cầu mà mình gửi đi (initiated_by = agentId)
     * 2. Yêu cầu cần mình xác nhận (from_debt.agent_id = agentId)
     */
    public function getPendingTransfers(Request $request)
    {
        if (!$request->user()->isAgent()) {
            return response()->json([
                'success' => false,
                'message' => 'Only agents can view pending transfers',
            ], 403);
        }

        $agentId = $request->user()->id;

        // Lấy các yêu cầu bù trừ pending liên quan đến agent này
        $transfers = DebtTransfer::with([
            'fromDebt.customer',
            'fromDebt.agent',
            'toDebt.customer',
            'toDebt.agent',
            'initiator',
        ])
        ->where('status', 'pending')
        ->where(function($query) use ($agentId) {
            // Yêu cầu mình gửi đi
            $query->where('initiated_by', $agentId)
                // Hoặc yêu cầu cần mình xác nhận (from_debt: người khác nợ mình, mình là agent)
                ->orWhereHas('fromDebt', function($q) use ($agentId) {
                    $q->where('agent_id', $agentId);
                });
        })
        ->orderBy('created_at', 'desc')
        ->get();

        // Transform to standardized data model
        $transformedTransfers = $transfers->map(function($transfer) use ($agentId) {
            $fromDebt = $transfer->fromDebt;
            $toDebt = $transfer->toDebt;
            
            // party_a = initiator (người gửi yêu cầu bù trừ)
            // party_b = đối tác (người nhận yêu cầu)
            // from_debt: party_a nợ party_b
            // to_debt: party_b nợ party_a
            
            $partyA = $fromDebt->customer; // initiator
            $partyB = $fromDebt->agent;    // đối tác
            
            $aOwedBefore = (float) $fromDebt->remaining_amount; // A nợ B
            $bOwedBefore = (float) $toDebt->remaining_amount;   // B nợ A
            $offsetAmount = (float) $transfer->amount;
            
            return [
                'id' => $transfer->id,
                'party_a_id' => $partyA->id,
                'party_b_id' => $partyB->id,
                'party_a_name' => $partyA->name,
                'party_b_name' => $partyB->name,
                'a_owed_before' => $aOwedBefore,
                'b_owed_before' => $bOwedBefore,
                'offset_amount' => $offsetAmount,
                'a_owed_after' => max(0, $aOwedBefore - $offsetAmount),
                'b_owed_after' => max(0, $bOwedBefore - $offsetAmount),
                'status' => $transfer->status,
                'description' => $transfer->description,
                'initiated_by' => $transfer->initiated_by,
                'confirmed_by' => $transfer->confirmed_by,
                'created_at' => $transfer->created_at,
                'updated_at' => $transfer->updated_at,
                // Keep original data for reference
                'from_debt_id' => $transfer->from_debt_id,
                'to_debt_id' => $transfer->to_debt_id,
                // For permission check
                'needs_my_confirmation' => $partyB->id === $agentId,
                'is_initiator' => $transfer->initiated_by === $agentId,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $transformedTransfers,
        ]);
    }

    /**
     * Xác nhận yêu cầu bù trừ công nợ
     * Người xác nhận = agent của from_debt (đối tác nhận request bù trừ)
     */
    public function confirmTransfer(Request $request, $id)
    {
        if (!$request->user()->isAgent()) {
            return response()->json([
                'success' => false,
                'message' => 'Only agents can confirm transfers',
            ], 403);
        }

        $agentId = $request->user()->id;
        $debtTransfer = DebtTransfer::with(['fromDebt', 'toDebt'])->findOrFail($id);

        // Kiểm tra: chỉ người cần xác nhận mới có quyền xác nhận
        // Người xác nhận = agent của from_debt (người được bù trừ nợ)
        // from_debt: initiator nợ đối tác → agent_id = đối tác
        if ($debtTransfer->fromDebt->agent_id !== $agentId) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền xác nhận yêu cầu này',
            ], 403);
        }

        // Kiểm tra: yêu cầu phải ở trạng thái pending
        if ($debtTransfer->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Yêu cầu này không thể xác nhận',
            ], 400);
        }

        DB::beginTransaction();
        try {
            $fromDebt = $debtTransfer->fromDebt;
            $toDebt = $debtTransfer->toDebt;
            $amount = $debtTransfer->amount;
            $initiatorId = $debtTransfer->initiated_by;

            // Tạo 1 payment record duy nhất cho việc bù trừ (gắn vào from_debt)
            // Payment này đại diện cho giao dịch bù trừ giữa 2 bên
            $payment = \App\Models\Payment::create([
                'debt_id' => $fromDebt->id,
                'customer_id' => $fromDebt->customer_id, // Người nợ (initiator)
                'agent_id' => $fromDebt->agent_id, // Chủ nợ (confirmer)
                'amount' => $amount,
                'payment_method' => 'debt_offset',
                'payment_date' => now()->toDateString(),
                'notes' => "Bù trừ công nợ với đại lý #{$toDebt->customer_id}. Công nợ đối ứng: #{$toDebt->id}",
                'status' => 'confirmed',
                'confirmed_at' => now(),
                'confirmed_by' => $agentId,
            ]);

            // Cập nhật from_debt: A nợ B → updateStatus sẽ tính paid_amount từ payments
            $fromDebt->updateStatus();

            // Cập nhật to_debt: B nợ A → cần tạo payment riêng hoặc cập nhật trực tiếp
            // Tạo payment cho to_debt để tracking
            \App\Models\Payment::create([
                'debt_id' => $toDebt->id,
                'customer_id' => $toDebt->customer_id, // Người nợ (confirmer)
                'agent_id' => $toDebt->agent_id, // Chủ nợ (initiator)
                'amount' => $amount,
                'payment_method' => 'debt_offset',
                'payment_date' => now()->toDateString(),
                'notes' => "Bù trừ công nợ với đại lý #{$fromDebt->customer_id}. Công nợ đối ứng: #{$fromDebt->id}",
                'status' => 'confirmed',
                'confirmed_at' => now(),
                'confirmed_by' => $agentId,
            ]);

            $toDebt->updateStatus();

            // Cập nhật trạng thái debt_transfer
            $debtTransfer->status = 'confirmed';
            $debtTransfer->confirmed_by = $agentId;
            $debtTransfer->confirmed_at = now();
            $debtTransfer->save();

            DB::commit();

            $debtTransfer->load(['fromDebt.customer', 'fromDebt.agent', 'toDebt.customer', 'toDebt.agent', 'initiator', 'confirmer']);

            return response()->json([
                'success' => true,
                'data' => $debtTransfer,
                'message' => 'Đã xác nhận chuyển công nợ thành công',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Không thể xác nhận chuyển công nợ: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Từ chối yêu cầu chuyển công nợ
     */
    public function rejectTransfer(Request $request, $id)
    {
        if (!$request->user()->isAgent()) {
            return response()->json([
                'success' => false,
                'message' => 'Only agents can reject transfers',
            ], 403);
        }

        $agentId = $request->user()->id;
        $debtTransfer = DebtTransfer::findOrFail($id);

        // Kiểm tra: chỉ người cần xác nhận mới có quyền từ chối
        if ($debtTransfer->toDebt->agent_id !== $agentId) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền từ chối yêu cầu này',
            ], 403);
        }

        // Kiểm tra: yêu cầu phải ở trạng thái pending
        if ($debtTransfer->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Yêu cầu này không thể từ chối',
            ], 400);
        }

        $debtTransfer->status = 'rejected';
        $debtTransfer->rejected_at = now();
        $debtTransfer->save();

        $debtTransfer->load(['fromDebt.customer', 'fromDebt.agent', 'toDebt.customer', 'toDebt.agent', 'initiator']);

        return response()->json([
            'success' => true,
            'data' => $debtTransfer,
            'message' => 'Đã từ chối yêu cầu chuyển công nợ',
        ]);
    }
}
