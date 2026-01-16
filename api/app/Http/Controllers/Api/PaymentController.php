<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Debt;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    /**
     * Get payments for customer (hoặc agent ở chế độ khách hàng)
     */
    public function indexForCustomer(Request $request)
    {
        $user = $request->user();
        
        // Chỉ chặn admin, cho phép customer và agent
        if ($user->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Admin cannot view customer payments',
            ], 403);
        }

        $query = Payment::with(['debt.order', 'agent', 'confirmedBy'])
            ->where('customer_id', $user->id);

        // Filter by debt_id
        if ($request->has('debt_id') && $request->debt_id) {
            $query->where('debt_id', $request->debt_id);
        }

        // Filter by date range
        if ($request->has('from_date') && $request->from_date) {
            $query->where('payment_date', '>=', $request->from_date);
        }
        if ($request->has('to_date') && $request->to_date) {
            $query->where('payment_date', '<=', $request->to_date);
        }

        $payments = $query->orderBy('payment_date', 'desc')->orderBy('created_at', 'desc')->get();

        // Calculate statistics
        $stats = [
            'total_payments' => $payments->count(),
            'total_amount' => $payments->sum('amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => $payments,
            'stats' => $stats,
        ]);
    }

    /**
     * Get payments for agent
     */
    public function indexForAgent(Request $request)
    {
        if (!$request->user()->isAgent()) {
            return response()->json([
                'success' => false,
                'message' => 'Only agents can view payments',
            ], 403);
        }

        $query = Payment::with(['debt.order', 'customer', 'confirmedBy'])
            ->where('agent_id', $request->user()->id);

        // Filter by debt_id
        if ($request->has('debt_id') && $request->debt_id) {
            $query->where('debt_id', $request->debt_id);
        }

        // Filter by customer
        if ($request->has('customer_id') && $request->customer_id) {
            $query->where('customer_id', $request->customer_id);
        }

        // Filter by date range
        if ($request->has('from_date') && $request->from_date) {
            $query->where('payment_date', '>=', $request->from_date);
        }
        if ($request->has('to_date') && $request->to_date) {
            $query->where('payment_date', '<=', $request->to_date);
        }

        $payments = $query->orderBy('payment_date', 'desc')->orderBy('created_at', 'desc')->get();

        // Calculate statistics
        $stats = [
            'total_payments' => $payments->count(),
            'total_amount' => $payments->sum('amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => $payments,
            'stats' => $stats,
        ]);
    }

    /**
     * Create payment
     */
    public function store(Request $request)
    {
        $request->validate([
            'debt_id' => 'required|exists:debts,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:cash,bank_transfer,other',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            $debt = Debt::findOrFail($request->debt_id);
            $user = $request->user();

            // Check permission
            // QUY TẮC:
            // 1. Customer chỉ có thể thanh toán công nợ của chính mình (debt->customer_id === user->id)
            // 2. Agent có thể thanh toán công nợ mà mình là customer (debt->customer_id === user->id)
            // 3. Agent có thể thanh toán công nợ mà mình là agent (debt->agent_id === user->id) - nhưng thường không cần
            // 4. Admin có thể thanh toán mọi công nợ
            
            // Chuyển đổi ID sang cùng kiểu để so sánh chính xác
            $userId = (int) $user->id;
            $debtCustomerId = (int) $debt->customer_id;
            $debtAgentId = (int) $debt->agent_id;
            
            $isAuthorized = false;
            
            // Log để debug (chỉ trên local hoặc khi debug mode)
            if (config('app.debug')) {
                \Illuminate\Support\Facades\Log::info('Payment authorization check', [
                    'user_id' => $userId,
                    'user_role' => $user->role,
                    'debt_id' => $debt->id,
                    'debt_customer_id' => $debtCustomerId,
                    'debt_agent_id' => $debtAgentId,
                    'customer_match' => ($debtCustomerId === $userId),
                    'agent_match' => ($debtAgentId === $userId),
                ]);
            }
            
            if ($user->role === 'admin') {
                // Admin có thể tạo payment cho mọi công nợ
                $isAuthorized = true;
            } elseif ($user->role === 'customer') {
                // Customer chỉ có thể thanh toán công nợ của chính mình
                // Đây là trường hợp phổ biến nhất: customer nợ đại lý và cần thanh toán
                $isAuthorized = ($debtCustomerId === $userId);
            } elseif ($user->role === 'agent') {
                // Agent có thể thanh toán công nợ mà mình là customer (chế độ khách hàng)
                // Hoặc công nợ mà mình là agent (nhưng thường không cần)
                $isAuthorized = ($debtCustomerId === $userId || $debtAgentId === $userId);
            }
            
            if (!$isAuthorized) {
                // Log chi tiết lỗi để debug
                \Illuminate\Support\Facades\Log::warning('Payment unauthorized', [
                    'user_id' => $userId,
                    'user_role' => $user->role,
                    'debt_id' => $debt->id,
                    'debt_customer_id' => $debtCustomerId,
                    'debt_agent_id' => $debtAgentId,
                    'customer_match' => ($debtCustomerId === $userId),
                    'agent_match' => ($debtAgentId === $userId),
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Bạn không có quyền thanh toán công nợ này. Vui lòng kiểm tra lại công nợ thuộc về bạn.',
                    'debug' => config('app.debug') ? [
                        'user_id' => $userId,
                        'debt_customer_id' => $debtCustomerId,
                        'match' => $debtCustomerId === $userId,
                    ] : null,
                ], 403);
            }

            // Tính số tiền đang chờ xác nhận (pending_confirmation)
            $pendingPaymentsAmount = $debt->payments()
                ->where('status', 'pending_confirmation')
                ->sum('amount');
            
            // Số tiền có thể thanh toán = remaining_amount - pending payments
            // Để đóng băng số tiền đang chờ xác nhận
            $availableAmount = $debt->remaining_amount - $pendingPaymentsAmount;
            
            // Check if payment amount exceeds available amount
            if ($request->amount > $availableAmount) {
                $message = 'Số tiền thanh toán vượt quá số tiền còn lại. ';
                if ($pendingPaymentsAmount > 0) {
                    $message .= 'Có ' . number_format($pendingPaymentsAmount, 0, ',', '.') . ' đ đang chờ xác nhận.';
                }
                return response()->json([
                    'success' => false,
                    'message' => $message,
                ], 400);
            }

            // Kiểm tra duplicate payment trong vòng 10 giây gần đây
            // (cùng debt_id, cùng amount, cùng payment_date)
            $recentPayment = \App\Models\Payment::where('debt_id', $debt->id)
                ->where('amount', $request->amount)
                ->where('payment_date', $request->payment_date)
                ->where('created_at', '>=', now()->subSeconds(10))
                ->first();

            if ($recentPayment) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Thanh toán đã được tạo gần đây. Vui lòng kiểm tra lại.',
                ], 409); // 409 Conflict
            }

            // Create payment với status pending_confirmation
            // Chỉ khi đại lý xác nhận thì mới cập nhật debt
            $payment = Payment::create([
                'debt_id' => $debt->id,
                'customer_id' => $debt->customer_id,
                'agent_id' => $debt->agent_id,
                'amount' => $request->amount,
                'payment_method' => $request->payment_method,
                'payment_date' => $request->payment_date,
                'notes' => $request->notes,
                'status' => 'pending_confirmation', // Chờ đại lý xác nhận
            ]);

            // KHÔNG cập nhật debt status ngay, chờ đại lý xác nhận
            // $debt->updateStatus();

            DB::commit();

            $payment->load(['debt.order', 'customer', 'agent']);

            return response()->json([
                'success' => true,
                'data' => $payment,
                'message' => 'Payment created successfully',
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get single payment details
     */
    public function show(Request $request, $id)
    {
        $payment = Payment::with(['debt.order.items.product', 'customer', 'agent', 'confirmedBy'])
            ->findOrFail($id);

        // Check permission
        $user = $request->user();
        
        // Cho phép customer hoặc agent (khi xem payment của chính mình với tư cách customer)
        if ($user->role === 'customer' || ($user->role === 'agent' && $payment->customer_id === $user->id)) {
            if ($payment->customer_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }
        } elseif ($user->role === 'agent' && $payment->agent_id === $user->id) {
            // Agent xem payment với tư cách đại lý
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
            'data' => $payment,
        ]);
    }

    /**
     * Get pending payments for agent (chờ xác nhận)
     */
    public function getPendingPayments(Request $request)
    {
        if (!$request->user()->isAgent()) {
            return response()->json([
                'success' => false,
                'message' => 'Only agents can view pending payments',
            ], 403);
        }

        $payments = Payment::with(['debt.order', 'customer', 'confirmedBy'])
            ->where('agent_id', $request->user()->id)
            ->where('status', 'pending_confirmation')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $payments,
            'count' => $payments->count(),
        ]);
    }

    /**
     * Agent xác nhận đã nhận thanh toán
     */
    public function confirmPayment(Request $request, $id)
    {
        if (!$request->user()->isAgent()) {
            return response()->json([
                'success' => false,
                'message' => 'Only agents can confirm payments',
            ], 403);
        }

        $payment = Payment::with('debt')->findOrFail($id);
        $agentId = (int) $request->user()->id;
        $paymentAgentId = (int) $payment->agent_id;

        // Kiểm tra payment thuộc về đại lý này
        // Đại lý chỉ có thể xác nhận thanh toán của công nợ mà mình là đại lý
        if ($paymentAgentId !== $agentId) {
            \Illuminate\Support\Facades\Log::warning('Agent tried to confirm payment not belonging to them', [
                'agent_id' => $agentId,
                'payment_agent_id' => $paymentAgentId,
                'payment_id' => $payment->id,
                'debt_id' => $payment->debt_id,
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Bạn chỉ có thể xác nhận thanh toán của công nợ thuộc về bạn.',
            ], 403);
        }
        
        // Kiểm tra thêm: debt phải thuộc về đại lý này
        $debtAgentId = (int) $payment->debt->agent_id;
        if ($debtAgentId !== $agentId) {
            \Illuminate\Support\Facades\Log::warning('Agent tried to confirm payment for debt not belonging to them', [
                'agent_id' => $agentId,
                'debt_agent_id' => $debtAgentId,
                'payment_id' => $payment->id,
                'debt_id' => $payment->debt_id,
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Công nợ này không thuộc về bạn.',
            ], 403);
        }

        // Kiểm tra payment đang ở trạng thái pending_confirmation
        if ($payment->status !== 'pending_confirmation') {
            return response()->json([
                'success' => false,
                'message' => 'Payment is not pending confirmation',
            ], 400);
        }

        DB::beginTransaction();

        try {
            // Cập nhật payment status
            $payment->status = 'confirmed';
            $payment->confirmed_at = now();
            $payment->confirmed_by = $agentId;
            $payment->save();

            // Cập nhật debt status (chỉ tính payments đã confirmed)
            $payment->debt->updateStatus();

            DB::commit();

            $payment->load(['debt.order', 'customer', 'agent']);

            return response()->json([
                'success' => true,
                'data' => $payment,
                'message' => 'Payment confirmed successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm payment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Agent từ chối thanh toán đang chờ xác nhận
     */
    public function rejectPayment(Request $request, $id)
    {
        if (!$request->user()->isAgent()) {
            return response()->json([
                'success' => false,
                'message' => 'Only agents can reject payments',
            ], 403);
        }

        $payment = Payment::with('debt')->findOrFail($id);
        $agentId = (int) $request->user()->id;
        $paymentAgentId = (int) $payment->agent_id;

        // Kiểm tra payment thuộc về đại lý này
        // Đại lý chỉ có thể từ chối thanh toán của công nợ mà mình là đại lý
        if ($paymentAgentId !== $agentId) {
            \Illuminate\Support\Facades\Log::warning('Agent tried to reject payment not belonging to them', [
                'agent_id' => $agentId,
                'payment_agent_id' => $paymentAgentId,
                'payment_id' => $payment->id,
                'debt_id' => $payment->debt_id,
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Bạn chỉ có thể từ chối thanh toán của công nợ thuộc về bạn.',
            ], 403);
        }
        
        // Kiểm tra thêm: debt phải thuộc về đại lý này
        $debtAgentId = (int) $payment->debt->agent_id;
        if ($debtAgentId !== $agentId) {
            \Illuminate\Support\Facades\Log::warning('Agent tried to reject payment for debt not belonging to them', [
                'agent_id' => $agentId,
                'debt_agent_id' => $debtAgentId,
                'payment_id' => $payment->id,
                'debt_id' => $payment->debt_id,
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Công nợ này không thuộc về bạn.',
            ], 403);
        }

        // Kiểm tra payment đang ở trạng thái pending_confirmation
        if ($payment->status !== 'pending_confirmation') {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ có thể từ chối thanh toán đang chờ xác nhận.',
            ], 400);
        }

        DB::beginTransaction();

        try {
            // Cập nhật payment status thành rejected
            $payment->status = 'rejected';
            $payment->confirmed_at = now();
            $payment->confirmed_by = $agentId; // Lưu người từ chối
            $payment->save();

            // KHÔNG cập nhật debt status vì payment bị từ chối
            // Debt vẫn giữ nguyên, customer có thể tạo payment mới

            DB::commit();

            $payment->load(['debt.order', 'customer', 'agent', 'confirmedBy']);

            return response()->json([
                'success' => true,
                'data' => $payment,
                'message' => 'Đã từ chối thanh toán thành công.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            \Illuminate\Support\Facades\Log::error('Failed to reject payment', [
                'payment_id' => $payment->id,
                'agent_id' => $agentId,
                'error' => $e->getMessage(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Không thể từ chối thanh toán. Vui lòng thử lại.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
