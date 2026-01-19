<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Debt;
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
}
