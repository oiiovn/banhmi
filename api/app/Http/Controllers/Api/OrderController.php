<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Debt;
use App\Models\DebtOrder;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Display a listing of the orders for authenticated customer.
     */
    public function index(Request $request)
    {
        // Cho phép customer và agent xem đơn hàng của mình (agent có thể ở chế độ khách hàng)
        $user = $request->user();
        if ($user->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Admin cannot view customer orders',
            ], 403);
        }

        $query = Order::with(['items.product', 'user', 'agent', 'auditLogs.user'])
            ->where('user_id', $request->user()->id);

        // Filter by status if provided
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $orders = $query->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Store a newly created order (customer và agent ở chế độ khách hàng có thể tạo đơn hàng)
     */
    public function store(Request $request)
    {
        // Cho phép customer và agent tạo đơn hàng (agent có thể ở chế độ khách hàng)
        $user = $request->user();
        if ($user->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Admin cannot create orders',
            ], 403);
        }

        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'delivery_address' => 'required|string',
            'phone' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            $totalAmount = 0;
            $orderItems = [];
            $agentId = null; // Sẽ được xác định từ sản phẩm

            foreach ($request->items as $item) {
                $product = \App\Models\Product::findOrFail($item['product_id']);
                $quantity = $item['quantity'];
                // Ưu tiên sử dụng wholesale_price, nếu không có thì dùng price
                $price = $product->wholesale_price ?? $product->price;
                
                if (!$price || $price <= 0) {
                    throw new \Exception("Sản phẩm {$product->name} chưa có giá. Vui lòng kiểm tra lại.");
                }
                
                // Xác định agent_id từ sản phẩm (tất cả sản phẩm trong đơn hàng phải cùng đại lý)
                // Nếu sản phẩm có agent_id, set agent_id cho đơn hàng
                if ($product->agent_id) {
                    // Nếu đã có agent_id và khác với agent_id hiện tại, throw error
                    if ($agentId !== null && $product->agent_id !== $agentId) {
                        throw new \Exception("Không thể tạo đơn hàng với sản phẩm từ nhiều đại lý khác nhau. Vui lòng tách thành các đơn hàng riêng.");
                    }
                    // Set agent_id nếu chưa có
                    if ($agentId === null) {
                        $agentId = $product->agent_id;
                    }
                }
                // Nếu sản phẩm không có agent_id (null), để agentId = null (đại lý sẽ phải accept order sau)
                
                // Giá là giá cho 1 quantity_per_unit (nếu có) hoặc 1 đơn vị (nếu không có)
                // Ví dụ: 35.000 đ/100 Cái, quantity = 2 → 35.000 × 2 = 70.000 đ
                $subtotal = $price * $quantity;

                $totalAmount += $subtotal;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'price' => $price,
                ];
            }

            // Nếu đơn hàng có agent_id (từ sản phẩm), tự động set accepted_at và accepted_by
            // để đảm bảo tính nhất quán, nhưng status vẫn là 'pending' để đại lý có thể xác nhận
            $order = Order::create([
                'user_id' => $request->user()->id,
                'agent_id' => $agentId, // Tự động gán agent_id từ sản phẩm
                'total_amount' => $totalAmount,
                'status' => 'pending', // Đại lý vẫn cần xác nhận đơn hàng
                'delivery_address' => $request->delivery_address,
                'phone' => $request->phone,
                'notes' => $request->notes,
                // Nếu có agent_id, tự động set accepted_at và accepted_by
                'accepted_at' => $agentId ? now() : null,
                'accepted_by' => $agentId ? $agentId : null,
            ]);
            
            // Tạo audit log nếu đơn hàng được tự động assign cho đại lý
            if ($agentId) {
                \App\Models\OrderAuditLog::create([
                    'order_id' => $order->id,
                    'user_id' => $agentId,
                    'action' => 'auto_assign',
                    'entity_type' => 'order',
                    'entity_id' => $order->id,
                    'old_value' => ['agent_id' => null],
                    'new_value' => ['agent_id' => $agentId],
                    'description' => "Đơn hàng được tự động gán cho đại lý (từ sản phẩm)",
                ]);
            }

            foreach ($orderItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);
            }

            DB::commit();

            $order->load(['items.product', 'user']);

            return response()->json([
                'success' => true,
                'data' => $order,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified order (only customer can view their own order)
     */
    public function show(Request $request, $id)
    {
        // Cho phép customer và agent xem đơn hàng của mình (agent có thể ở chế độ khách hàng)
        $user = $request->user();
        if ($user->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Admin cannot view customer orders',
            ], 403);
        }

        $order = Order::with(['items.product', 'user', 'agent', 'auditLogs.user'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    /**
     * Customer confirms receiving the order
     */
    public function confirmReceived(Request $request, $id)
    {
        // Cho phép customer và agent xác nhận đã nhận hàng (agent có thể ở chế độ khách hàng)
        $user = $request->user();
        if ($user->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Admin cannot confirm receiving orders',
            ], 403);
        }

        $order = Order::where('user_id', $request->user()->id)
            ->where('status', 'delivered_by_agent')
            ->findOrFail($id);

        DB::beginTransaction();
        try {
            $oldStatus = $order->status;
            $order->status = 'delivered';
            $order->save();

            // Create audit log
            \App\Models\OrderAuditLog::create([
                'order_id' => $order->id,
                'user_id' => $request->user()->id,
                'action' => 'confirm_received',
                'entity_type' => 'order',
                'entity_id' => $order->id,
                'old_value' => ['status' => $oldStatus],
                'new_value' => ['status' => 'delivered'],
                'description' => 'Khách hàng xác nhận đã nhận hàng',
            ]);

            // Auto-create or update consolidated debt when order is delivered
            // Gộp công nợ: Mỗi cặp (customer_id, agent_id) chỉ có một công nợ tổng
            if ($order->agent_id) {
                $orderAmount = $order->total_amount - ($order->discount ?? 0);
                
                // Tìm công nợ tổng (order_id = null) của cặp (customer, agent)
                // Không phụ thuộc vào status, vì có thể đã thanh toán một phần nhưng vẫn cần gộp đơn hàng mới
                $consolidatedDebt = Debt::where('customer_id', $order->user_id)
                    ->where('agent_id', $order->agent_id)
                    ->whereNull('order_id') // Chỉ tìm công nợ tổng (không phải công nợ đơn lẻ)
                    ->first();
                
                if ($consolidatedDebt) {
                    // Cộng vào công nợ tổng hiện có
                    $consolidatedDebt->total_amount += $orderAmount;
                    // Cập nhật remaining_amount dựa trên paid_amount hiện tại
                    $consolidatedDebt->remaining_amount = $consolidatedDebt->total_amount - $consolidatedDebt->paid_amount;
                    $consolidatedDebt->updateStatus(); // Cập nhật lại status
                    $consolidatedDebt->save();
                    
                    // Kiểm tra xem đơn hàng đã được liên kết chưa (tránh trùng lặp)
                    $existingDebtOrder = \App\Models\DebtOrder::where('debt_id', $consolidatedDebt->id)
                        ->where('order_id', $order->id)
                        ->first();
                    
                    if (!$existingDebtOrder) {
                        // Liên kết đơn hàng với công nợ tổng
                        \App\Models\DebtOrder::create([
                            'debt_id' => $consolidatedDebt->id,
                            'order_id' => $order->id,
                            'amount' => $orderAmount,
                        ]);
                    }
                } else {
                    // Tạo công nợ tổng mới
                    $newDebt = Debt::create([
                        'order_id' => null, // Không liên kết trực tiếp với một đơn hàng cụ thể
                        'customer_id' => $order->user_id,
                        'agent_id' => $order->agent_id,
                        'total_amount' => $orderAmount,
                        'paid_amount' => 0,
                        'remaining_amount' => $orderAmount,
                        'status' => 'pending',
                        'notes' => "Công nợ tổng - Đơn hàng #{$order->id}",
                    ]);
                    
                    // Liên kết đơn hàng với công nợ tổng
                    \App\Models\DebtOrder::create([
                        'debt_id' => $newDebt->id,
                        'order_id' => $order->id,
                        'amount' => $orderAmount,
                    ]);
                }
            }

            DB::commit();

            $order->load(['items.product', 'user', 'agent', 'auditLogs.user']);

            return response()->json([
                'success' => true,
                'data' => $order,
                'message' => 'Order confirmed as received',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

