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

        // Chỉ load relationships cần thiết để tăng tốc độ
        $query = Debt::with(['customer:id,name,phone', 'payments:id,debt_id,amount,payment_date,status'])
            ->where('agent_id', $request->user()->id);

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by customer
        if ($request->has('customer_id') && $request->customer_id) {
            $query->where('customer_id', $request->customer_id);
        }

        // Tính statistics trực tiếp từ database (nhanh hơn nhiều)
        $statsQuery = Debt::where('agent_id', $request->user()->id);
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

        return response()->json([
            'success' => true,
            'data' => $debts,
            'stats' => $stats,
        ]);
    }

    /**
     * Get single debt details
     */
    public function show(Request $request, $id)
    {
        $debt = Debt::with(['orders.items.product', 'debtOrders.order.items.product', 'debtOrders.order', 'order.items.product', 'customer', 'agent', 'payments.confirmedBy'])
            ->findOrFail($id);

        $user = $request->user();
        
        // Check permission
        // Cho phép customer hoặc agent (khi xem công nợ của chính mình với tư cách customer)
        if ($user->role === 'customer' || ($user->role === 'agent' && $debt->customer_id === $user->id)) {
            if ($debt->customer_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }
        } elseif ($user->role === 'agent' && $debt->agent_id === $user->id) {
            // Agent xem công nợ với tư cách đại lý
            // Cho phép
        } elseif ($user->role === 'admin') {
            // Admin có thể xem tất cả
            // Cho phép
        } else {
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
        if ($fromDebt->customer_id !== $agentId || $fromDebt->agent_id === $agentId) {
            return response()->json([
                'success' => false,
                'message' => 'from_debt_id phải là công nợ bạn nợ đại lý khác',
            ], 400);
        }

        // Kiểm tra: to_debt phải là công nợ B nợ A (B là customer, A là agent)
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
     * Lấy danh sách yêu cầu chuyển công nợ pending (người cần xác nhận)
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

        // Lấy các yêu cầu chuyển công nợ mà người này cần xác nhận
        // (to_debt là công nợ đại lý khác nợ mình → mình là agent của to_debt)
        $transfers = DebtTransfer::with([
            'fromDebt.customer',
            'fromDebt.agent',
            'toDebt.customer',
            'toDebt.agent',
            'initiator',
        ])
        ->where('status', 'pending')
        ->whereHas('toDebt', function($query) use ($agentId) {
            $query->where('agent_id', $agentId); // to_debt: đại lý khác nợ mình (mình là agent)
        })
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json([
            'success' => true,
            'data' => $transfers,
        ]);
    }

    /**
     * Xác nhận yêu cầu chuyển công nợ
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
        if ($debtTransfer->toDebt->agent_id !== $agentId) {
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
            // Cập nhật công nợ
            // from_debt: A nợ B → trừ amount
            $fromDebt = $debtTransfer->fromDebt;
            $fromDebt->remaining_amount -= $debtTransfer->amount;
            $fromDebt->updateStatus();
            $fromDebt->save();

            // to_debt: B nợ A → trừ amount
            $toDebt = $debtTransfer->toDebt;
            $toDebt->remaining_amount -= $debtTransfer->amount;
            $toDebt->updateStatus();
            $toDebt->save();

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
