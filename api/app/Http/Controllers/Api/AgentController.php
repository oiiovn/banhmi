<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Debt;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderAuditLog;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AgentController extends Controller
{
    /**
     * Get Vietnamese label for order status
     */
    private function getStatusLabel($status)
    {
        $labels = [
            'pending' => 'Chờ xử lý',
            'confirmed' => 'Đã xác nhận',
            'preparing' => 'Đang giao',
            'ready' => 'Đang giao',
            'delivered_by_agent' => 'Chờ khách xác nhận',
            'delivered' => 'Đã giao',
            'cancelled' => 'Đã hủy',
        ];
        return $labels[$status] ?? $status;
    }
    /**
     * Get agent dashboard statistics
     */
    public function dashboard(Request $request)
    {
        $agentId = $request->user()->id;

        // Tối ưu: Chỉ tính profit cho delivered orders (giới hạn 1000 orders để tránh quá chậm)
        $deliveredOrders = Order::where('agent_id', $agentId)
            ->where('status', 'delivered')
            ->with(['items:id,order_id,product_id,price,quantity', 'items.product:id,name,price,wholesale_price'])
            ->limit(1000)
            ->get();

        // Calculate total profit from delivered orders
        $totalProfit = 0;
        foreach ($deliveredOrders as $order) {
            $totalProfit += $order->calculateProfit();
        }

        // Tối ưu: Tính statistics trực tiếp từ database (nhanh hơn nhiều)
        $baseQuery = Order::where('agent_id', $agentId);
        
        $stats = [
            'total_orders' => $baseQuery->count(),
            'pending_orders' => (clone $baseQuery)->where('status', 'pending')->count(),
            'confirmed_orders' => (clone $baseQuery)->where('status', 'confirmed')->count(),
            'preparing_orders' => (clone $baseQuery)->whereIn('status', ['preparing', 'ready'])->count(),
            'ready_orders' => 0, // Giữ để tương thích với frontend
            'delivered_by_agent_orders' => (clone $baseQuery)->where('status', 'delivered_by_agent')->count(),
            'delivered_orders' => (clone $baseQuery)->where('status', 'delivered')->count(),
            'total_revenue' => (clone $baseQuery)->where('status', 'delivered')->sum('total_amount'),
            'total_profit' => round($totalProfit, 2),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get all orders assigned to this agent
     */
    public function getOrders(Request $request)
    {
        $agentId = $request->user()->id;

        $query = Order::with(['user', 'items.product', 'agent', 'acceptedBy'])
            ->where('agent_id', $agentId);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Giới hạn số lượng orders để tăng tốc độ (có thể thêm pagination sau)
        $orders = $query->orderBy('created_at', 'desc')->limit(200)->get();

        // Calculate profit for each order (chỉ tính cho orders hiển thị)
        $ordersWithProfit = $orders->map(function ($order) {
            $order->profit = $order->calculateProfit();
            return $order;
        });

        return response()->json([
            'success' => true,
            'data' => $ordersWithProfit,
        ]);
    }

    /**
     * Get order details
     */
    public function getOrder(Request $request, $id)
    {
        $agentId = $request->user()->id;

        $order = Order::with(['user', 'items.product', 'auditLogs.user', 'agent', 'acceptedBy'])
            ->where('agent_id', $agentId)
            ->findOrFail($id);

        // Calculate profit for this order
        $profit = $order->calculateProfit();

        return response()->json([
            'success' => true,
            'data' => $order,
            'profit' => round($profit, 2),
        ]);
    }

    /**
     * Get pending order details (for editing before accept)
     * Cho phép lấy đơn hàng chưa nhận (agent_id = null) hoặc đã nhận nhưng vẫn pending
     */
    public function getPendingOrder(Request $request, $id)
    {
        $agentId = $request->user()->id;
        
        // Cho phép lấy đơn hàng:
        // 1. Chưa được nhận (agent_id = null)
        // 2. Đã được nhận bởi đại lý này và vẫn pending
        $order = Order::with(['user', 'items.product', 'auditLogs.user'])
            ->where('status', 'pending')
            ->where(function($query) use ($agentId) {
                $query->whereNull('agent_id')
                      ->orWhere('agent_id', $agentId);
            })
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    /**
     * Update order status (agent can update from confirmed to delivered)
     */
    public function updateOrderStatus(Request $request, $id)
    {
        // Mở rộng validation để cho phép chuyển từ pending → confirmed
        $allowedStatuses = ['confirmed', 'preparing', 'delivered_by_agent', 'cancelled'];
        $request->validate([
            'status' => 'required|in:' . implode(',', $allowedStatuses),
        ]);

        $agentId = $request->user()->id;

        $order = Order::where('agent_id', $agentId)->findOrFail($id);

        // Agent có thể update status: pending -> confirmed -> preparing -> delivered_by_agent
        // Logic: pending -> confirmed (xác nhận đơn) -> preparing (đang giao) -> delivered_by_agent (chờ khách xác nhận)
        // Agent cũng có thể hủy đơn hàng (cancelled)
        
        // Kiểm tra trạng thái hợp lệ để chuyển đổi
        $validTransitions = [
            'pending' => ['confirmed', 'cancelled'],
            'confirmed' => ['preparing', 'cancelled'],
            'preparing' => ['delivered_by_agent', 'cancelled'],
            'delivered_by_agent' => [], // Không thể chuyển từ delivered_by_agent sang status khác (chờ khách xác nhận)
        ];
        
        // Kiểm tra transition hợp lệ
        if (isset($validTransitions[$order->status]) && !in_array($request->status, $validTransitions[$order->status])) {
            return response()->json([
                'success' => false,
                'message' => "Không thể chuyển từ trạng thái '{$this->getStatusLabel($order->status)}' sang '{$this->getStatusLabel($request->status)}'",
            ], 400);
        }

        // Không cho phép hủy đơn hàng đã giao
        if ($request->status === 'cancelled' && $order->status === 'delivered') {
            return response()->json([
                'success' => false,
                'message' => 'Không thể hủy đơn hàng đã giao',
            ], 400);
        }

        // Lưu trạng thái cũ trước khi thay đổi
        $oldStatus = $order->status;

        // Cập nhật status
        $order->status = $request->status;
        $order->save();

        // Create audit log
        $oldStatusLabel = $this->getStatusLabel($oldStatus);
        $newStatusLabel = $this->getStatusLabel($order->status);
        OrderAuditLog::create([
            'order_id' => $order->id,
            'user_id' => $agentId,
            'action' => 'update_status',
            'entity_type' => 'order',
            'entity_id' => $order->id,
            'old_value' => ['status' => $oldStatus],
            'new_value' => ['status' => $order->status],
            'description' => "Đại lý cập nhật trạng thái: {$oldStatusLabel} → {$newStatusLabel}",
        ]);

        $order->load(['user', 'items.product']);

        return response()->json([
            'success' => true,
            'data' => $order,
            'message' => 'Order status updated successfully',
        ]);
    }

    /**
     * Get pending orders (orders chưa được assign agent)
     */
    public function getPendingOrders(Request $request)
    {
        $query = Order::with(['user', 'items.product'])
            ->whereNull('agent_id')
            ->where('status', 'pending');

        $orders = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Update order before accept (add/remove/update items, discount)
     */
    public function updateOrderBeforeAccept(Request $request, $id)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.1', // Cho phép số lượng thập phân (ví dụ: 1.5, 2.3)
            'items.*.price' => 'nullable|numeric|min:0', // Cho phép sửa giá
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000', // Cho phép thêm ghi chú
        ]);

        $agentId = $request->user()->id;
        
        // Cho phép sửa đơn hàng:
        // 1. Chưa được nhận (agent_id = null)
        // 2. Đã được nhận bởi đại lý này và vẫn pending
        $order = Order::where('status', 'pending')
            ->where(function($query) use ($agentId) {
                $query->whereNull('agent_id')
                      ->orWhere('agent_id', $agentId);
            })
            ->findOrFail($id);

        $userId = $agentId;

        DB::beginTransaction();
        try {
            $oldItems = $order->items->keyBy('id');
            $newItemsData = collect($request->items)->keyBy(function ($item) {
                return $item['item_id'] ?? null;
            });

            // Calculate new total
            $totalAmount = 0;
            foreach ($request->items as $itemData) {
                $product = Product::findOrFail($itemData['product_id']);
                // Cho phép sửa giá từ request, nếu không có thì dùng giá mặc định từ product
                $price = isset($itemData['price']) && $itemData['price'] > 0 
                    ? (float)$itemData['price'] 
                    : ($product->wholesale_price ?? $product->price);
                
                // Giá là giá cho 1 quantity_per_unit (nếu có) hoặc 1 đơn vị (nếu không có)
                // Ví dụ: 35.000 đ/100 Cái, quantity = 2 → 35.000 × 2 = 70.000 đ
                $totalAmount += $price * $itemData['quantity'];
            }

            $discount = $request->discount ?? 0;
            $finalAmount = max(0, $totalAmount - $discount);

            // Track changes for audit log
            $changes = [];

            // Update or create items
            foreach ($request->items as $itemData) {
                $product = Product::findOrFail($itemData['product_id']);
                // Cho phép sửa giá từ request, nếu không có thì dùng giá mặc định từ product
                $price = isset($itemData['price']) && $itemData['price'] > 0 
                    ? (float)$itemData['price'] 
                    : ($product->wholesale_price ?? $product->price);
                
                if (isset($itemData['item_id']) && $oldItems->has($itemData['item_id'])) {
                    // Update existing item
                    $item = $oldItems->get($itemData['item_id']);
                    $oldQuantity = $item->quantity;
                    $oldPrice = (float)$item->price;
                    $oldProduct = $item->product;
                    $newQuantity = (int)$itemData['quantity'];
                    $newPrice = $price;

                    // Track changes separately for quantity and price
                    $quantityChanged = $oldQuantity != $newQuantity;
                    $priceChanged = abs($oldPrice - $newPrice) > 0.01; // Compare with tolerance for float

                    if ($quantityChanged || $priceChanged) {
                        // Log quantity change if changed
                        if ($quantityChanged) {
                            $changes[] = [
                                'action' => 'update_quantity',
                                'entity_type' => 'order_item',
                                'entity_id' => $item->id,
                                'old_value' => [
                                    'product_id' => $item->product_id,
                                    'product_name' => $oldProduct->name ?? $product->name,
                                    'quantity' => $oldQuantity,
                                ],
                                'new_value' => [
                                    'product_id' => $item->product_id,
                                    'product_name' => $product->name,
                                    'quantity' => $newQuantity,
                                ],
                                'description' => "Cập nhật số lượng sản phẩm {$product->name}: từ {$oldQuantity} thành {$newQuantity}",
                            ];
                        }

                        // Log price change separately if changed
                        if ($priceChanged) {
                            $changes[] = [
                                'action' => 'update_price',
                                'entity_type' => 'order_item',
                                'entity_id' => $item->id,
                                'old_value' => [
                                    'product_id' => $item->product_id,
                                    'product_name' => $oldProduct->name ?? $product->name,
                                    'price' => $oldPrice,
                                ],
                                'new_value' => [
                                    'product_id' => $item->product_id,
                                    'product_name' => $product->name,
                                    'price' => $newPrice,
                                ],
                                'description' => "Cập nhật giá sản phẩm {$product->name}: từ " . number_format($oldPrice, 0, ',', '.') . " đ thành " . number_format($newPrice, 0, ',', '.') . " đ",
                            ];
                        }

                        $item->quantity = $newQuantity;
                        $item->price = $newPrice;
                        $item->save();
                    }
                    $oldItems->forget($itemData['item_id']);
                } else {
                    // Add new item
                    $newItem = OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $itemData['product_id'],
                        'quantity' => $itemData['quantity'],
                        'price' => $price,
                    ]);

                    $changes[] = [
                        'action' => 'add_item',
                        'entity_type' => 'order_item',
                        'entity_id' => $newItem->id,
                        'old_value' => null,
                        'new_value' => [
                            'product_id' => $newItem->product_id,
                            'product_name' => $product->name,
                            'quantity' => $newItem->quantity,
                            'price' => $newItem->price,
                        ],
                        'description' => "Thêm sản phẩm: {$product->name} x {$newItem->quantity} với giá " . number_format($newItem->price, 0, ',', '.') . " đ",
                    ];
                }
            }

            // Remove deleted items
            foreach ($oldItems as $item) {
                $product = $item->product;
                $changes[] = [
                    'action' => 'remove_item',
                    'entity_type' => 'order_item',
                    'entity_id' => $item->id,
                    'old_value' => [
                        'product_id' => $item->product_id,
                        'product_name' => $product->name,
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                    ],
                    'new_value' => null,
                    'description' => "Xóa sản phẩm: {$product->name} x {$item->quantity}",
                ];
                $item->delete();
            }

            // Update discount if changed
            $oldDiscount = $order->discount ?? 0;
            if ($oldDiscount != $discount) {
                $changes[] = [
                    'action' => 'update_discount',
                    'entity_type' => 'order',
                    'entity_id' => $order->id,
                    'old_value' => ['discount' => $oldDiscount],
                    'new_value' => ['discount' => $discount],
                    'description' => "Cập nhật chiết khấu từ " . number_format($oldDiscount) . " đ thành " . number_format($discount) . " đ",
                ];
                $order->discount = $discount;
            }

            // Update notes if provided
            if ($request->has('notes')) {
                $oldNotes = $order->notes ?? '';
                $newNotes = $request->notes ?? '';
                if ($oldNotes !== $newNotes) {
                    $changes[] = [
                        'action' => 'update_notes',
                        'entity_type' => 'order',
                        'entity_id' => $order->id,
                        'old_value' => ['notes' => $oldNotes],
                        'new_value' => ['notes' => $newNotes],
                        'description' => "Cập nhật ghi chú đơn hàng",
                    ];
                    $order->notes = $newNotes;
                }
            }

            // Update total amount
            $order->total_amount = $finalAmount;
            $order->save();

            // Create audit logs
            foreach ($changes as $change) {
                OrderAuditLog::create([
                    'order_id' => $order->id,
                    'user_id' => $userId,
                    'action' => $change['action'],
                    'entity_type' => $change['entity_type'],
                    'entity_id' => $change['entity_id'],
                    'old_value' => $change['old_value'],
                    'new_value' => $change['new_value'],
                    'description' => $change['description'],
                ]);
            }

            DB::commit();

            $order->load(['user', 'items.product', 'auditLogs.user']);

            return response()->json([
                'success' => true,
                'data' => $order,
                'message' => 'Order updated successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Agent tự nhận đơn hàng (sau khi đã chỉnh sửa)
     */
    public function acceptOrder(Request $request, $id)
    {
        $agentId = $request->user()->id;

        // Cho phép nhận đơn hàng:
        // 1. Chưa được nhận (agent_id = null)
        // 2. Đã được nhận bởi đại lý này và vẫn pending
        $order = Order::where('status', 'pending')
            ->where(function($query) use ($agentId) {
                $query->whereNull('agent_id')
                      ->orWhere('agent_id', $agentId);
            })
            ->findOrFail($id);

        // Validate notes if provided
        if ($request->has('notes')) {
            $request->validate([
                'notes' => 'nullable|string|max:1000',
            ]);
        }

        DB::beginTransaction();
        try {
            // Nếu chưa có agent_id, set nó
            if (!$order->agent_id) {
                $order->agent_id = $agentId;
            }
            
            // Cập nhật notes nếu có
            if ($request->has('notes')) {
                $order->notes = $request->notes;
            }
            
            $order->status = 'confirmed';
            $order->accepted_at = now();
            $order->accepted_by = $agentId;
            $order->save();

            // Create audit log for order acceptance
            OrderAuditLog::create([
                'order_id' => $order->id,
                'user_id' => $agentId,
                'action' => 'accept_order',
                'entity_type' => 'order',
                'entity_id' => $order->id,
                'old_value' => ['status' => 'pending', 'agent_id' => null],
                'new_value' => ['status' => 'confirmed', 'agent_id' => $agentId],
                'description' => "Đại lý xác nhận nhận đơn hàng",
            ]);

            // Note: Debt will be created when customer confirms receipt (order status = delivered)

            DB::commit();

            $order->load(['user', 'items.product', 'auditLogs.user', 'acceptedBy']);

            return response()->json([
                'success' => true,
                'data' => $order,
                'message' => 'Order accepted successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to accept order: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all products (agent can view and manage - chỉ sản phẩm của chính agent đó)
     */
    public function getProducts(Request $request)
    {
        $agentId = $request->user()->id;
        $query = Product::with('category')->where('agent_id', $agentId);

        if ($request->has('category_id')) {
            // Đảm bảo category_id cũng là của agent đó
            $query->where('category_id', $request->category_id)
                  ->whereHas('category', function($q) use ($agentId) {
                      $q->where('agent_id', $agentId);
                  });
        }

        if ($request->has('is_available')) {
            $query->where('is_available', $request->is_available);
        }

        $products = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Get product details (chỉ sản phẩm của chính agent đó)
     */
    public function getProduct(Request $request, $id)
    {
        $agentId = $request->user()->id;
        $product = Product::with('category')
            ->where('agent_id', $agentId)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    /**
     * Create product (agent can create)
     */
    public function createProduct(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'nullable|numeric|min:0|max:999999.99',
            'wholesale_price' => 'required|numeric|min:0|max:999999.99',
            'original_price' => 'required|numeric|min:0|max:999999.99',
            'unit' => 'required|string|max:50',
            'quantity_per_unit' => 'nullable|numeric|min:0',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp',
            'category_id' => 'required|exists:categories,id',
            'is_available' => 'nullable|boolean',
        ]);

        // Kiểm tra giá gốc phải bé hơn giá sỉ ít nhất 100 đ
        if ($request->has('wholesale_price') && $request->has('original_price')) {
            $wholesalePrice = (float)$request->wholesale_price;
            $originalPrice = (float)$request->original_price;
            if ($originalPrice >= $wholesalePrice - 100) {
                return response()->json([
                    'success' => false,
                    'message' => 'Giá gốc phải bé hơn giá sỉ ít nhất 100 đ',
                ], 422);
            }
        }

        $data = $request->except(['image', 'sku']); // Loại bỏ SKU khỏi request data
        $agentId = $request->user()->id;
        $data['agent_id'] = $agentId;
        
        // Tự động generate SKU tăng dần (SP0001, SP0002, ...)
        $data['sku'] = $this->generateNextSKU();
        
        // Đảm bảo category_id là của chính agent đó
        if (isset($data['category_id'])) {
            $category = Category::where('id', $data['category_id'])
                ->where('agent_id', $agentId)
                ->firstOrFail();
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('products', $imageName, 'public');
            $data['image'] = url(Storage::url($imagePath));
        }

        // Handle boolean conversion for FormData
        if ($request->has('is_available')) {
            $data['is_available'] = filter_var($request->input('is_available'), FILTER_VALIDATE_BOOLEAN);
        }

        // Tự động viết hoa chữ cái đầu tiên của tất cả các từ trong tên sản phẩm
        if (isset($data['name'])) {
            $data['name'] = mb_convert_case(trim($data['name']), MB_CASE_TITLE, 'UTF-8');
        }

        // Tự động tạo mô tả: "Số lượng xxx + đơn vị + là giá + đ"
        if (isset($data['quantity_per_unit']) && isset($data['unit']) && isset($data['wholesale_price'])) {
            $quantity = $data['quantity_per_unit'];
            $unit = $data['unit'];
            $price = number_format($data['wholesale_price'], 0, ',', '.');
            $data['description'] = "Số lượng {$quantity} {$unit} là giá {$price} đ";
        }

        $product = Product::create($data);

        return response()->json([
            'success' => true,
            'data' => $product->load('category'),
            'message' => 'Product created successfully',
        ], 201);
    }

    /**
     * Update product (agent can update)
     */
    public function updateProduct(Request $request, $id)
    {
        \Log::info('=== UPDATE PRODUCT START ===', [
            'id' => $id,
            'method' => $request->method(),
            'has_file' => $request->hasFile('image'),
            'all_keys' => array_keys($request->all()),
        ]);

        $agentId = $request->user()->id;
        
        // Đảm bảo chỉ lấy sản phẩm của chính agent đó hoặc sản phẩm chưa có agent_id (null)
        // Giống getProducts() nhưng cho phép cả agent_id = null (sản phẩm cũ)
        $product = Product::where(function($q) use ($agentId) {
            $q->where('agent_id', $agentId)
              ->orWhereNull('agent_id');
        })->findOrFail($id);
        
        // Log để debug
        \Log::info('Product found for update', [
            'product_id' => $product->id,
            'product_agent_id' => $product->agent_id,
            'current_agent_id' => $agentId,
        ]);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'nullable|numeric|min:0|max:999999.99',
            'wholesale_price' => 'required|numeric|min:0|max:999999.99',
            'original_price' => 'required|numeric|min:0|max:999999.99',
            'unit' => 'required|string|max:50',
            'quantity_per_unit' => 'nullable|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp',
            'category_id' => 'required|exists:categories,id',
            'is_available' => 'nullable|boolean',
        ]);

        // Kiểm tra giá gốc phải bé hơn giá sỉ ít nhất 100 đ
        $wholesalePrice = $request->has('wholesale_price') ? (float)$request->wholesale_price : (float)$product->wholesale_price;
        $originalPrice = $request->has('original_price') ? (float)$request->original_price : (float)$product->original_price;
        if ($originalPrice >= $wholesalePrice - 100) {
            return response()->json([
                'success' => false,
                'message' => 'Giá gốc phải bé hơn giá sỉ ít nhất 100 đ',
            ], 422);
        }

        \Log::info('Validation passed', [
            'product_id' => $product->id,
            'product_agent_id' => $product->agent_id,
            'current_agent_id' => $agentId,
        ]);

        $data = $request->except(['image', '_method', 'agent_id', 'sku']); // Không cho phép sửa SKU
        
        // Đảm bảo agent_id không bị thay đổi khi update
        // Nếu sản phẩm chưa có agent_id (sản phẩm cũ), gán agent_id cho agent hiện tại
        if (!$product->agent_id) {
            $data['agent_id'] = $agentId;
            \Log::info('Product has no agent_id - assigning to current agent', [
                'product_id' => $product->id,
                'agent_id' => $agentId,
            ]);
        } else {
            // Đảm bảo agent_id không bị thay đổi (đã kiểm tra ở trên rồi)
            $data['agent_id'] = $product->agent_id;
        }
        
        // Đảm bảo category_id là của chính agent đó
        if (isset($data['category_id'])) {
            $category = Category::where('id', $data['category_id'])
                ->where('agent_id', $agentId)
                ->firstOrFail();
        }

        \Log::info('Data after except', ['keys' => array_keys($data)]);

        // Handle image upload - same logic as createProduct
        if ($request->hasFile('image')) {
            \Log::info('Processing image upload', []);
            
            try {
                // Delete old image if exists
                if ($product->image) {
                    $imageUrl = parse_url($product->image, PHP_URL_PATH);
                    if ($imageUrl) {
                        $oldImagePath = str_replace('/storage/', '', $imageUrl);
                        if ($oldImagePath && Storage::disk('public')->exists($oldImagePath)) {
                            Storage::disk('public')->delete($oldImagePath);
                            \Log::info('Deleted old image', ['path' => $oldImagePath]);
                        }
                    }
                }

                $image = $request->file('image');
                \Log::info('Image file received', [
                    'name' => $image->getClientOriginalName(),
                    'size' => $image->getSize(),
                    'mime' => $image->getMimeType(),
                ]);

                $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $imagePath = $image->storeAs('products', $imageName, 'public');
                
                \Log::info('Image stored', ['path' => $imagePath]);
                
                if ($imagePath) {
                    $data['image'] = url(Storage::url($imagePath));
                    \Log::info('Image URL set', ['url' => $data['image']]);
                } else {
                    \Log::error('Failed to store image', ['product_id' => $id]);
                }
            } catch (\Exception $e) {
                \Log::error('Error uploading image', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Error uploading image: ' . $e->getMessage(),
                ], 500);
            }
        } else {
            \Log::info('No image file provided - keeping existing image', [
                'current_image' => $product->image,
            ]);
            // Don't update image field - keep existing image
            // $data already excludes 'image' field, so it won't be updated
        }

        // Handle boolean conversion for FormData
        if ($request->has('is_available')) {
            $data['is_available'] = filter_var($request->input('is_available'), FILTER_VALIDATE_BOOLEAN);
        }

        // Tự động viết hoa chữ cái đầu tiên của tất cả các từ trong tên sản phẩm
        if (isset($data['name'])) {
            $data['name'] = mb_convert_case(trim($data['name']), MB_CASE_TITLE, 'UTF-8');
        }

        // Tự động tạo mô tả: "Số lượng xxx + đơn vị + là giá (giá sỉ)"
        $quantity = $request->has('quantity_per_unit') ? ($data['quantity_per_unit'] ?? $product->quantity_per_unit) : $product->quantity_per_unit;
        $unit = $request->has('unit') ? ($data['unit'] ?? $product->unit) : $product->unit;
        $wholesalePrice = $request->has('wholesale_price') ? ($data['wholesale_price'] ?? $product->wholesale_price) : $product->wholesale_price;
        
        if ($quantity && $unit && $wholesalePrice) {
            $price = number_format($wholesalePrice, 0, ',', '.');
            $data['description'] = "Số lượng {$quantity} {$unit} là giá {$price} ({$price})";
        }

        \Log::info('Updating product with data', ['data_keys' => array_keys($data)]);
        \Log::info('Image status', [
            'will_update' => $request->hasFile('image'),
            'current_image' => $product->image,
        ]);
        
        $product->update($data);
        $product->refresh();

        \Log::info('=== UPDATE PRODUCT SUCCESS ===', [
            'product_id' => $product->id,
            'image' => $product->image,
        ]);

        return response()->json([
            'success' => true,
            'data' => $product->load('category'),
            'message' => 'Product updated successfully',
        ]);
    }

    /**
     * Delete product (agent can delete)
     */
    public function deleteProduct(Request $request, $id)
    {
        $agentId = $request->user()->id;
        $product = Product::where('agent_id', $agentId)->findOrFail($id);
        
        // Sử dụng soft delete - sản phẩm sẽ bị ẩn nhưng không bị xóa hoàn toàn
        // Dữ liệu đơn hàng vẫn được bảo toàn
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sản phẩm đã được xóa (ẩn). Dữ liệu đơn hàng được bảo toàn.',
        ]);
    }

    /**
     * Get all categories (chỉ categories của chính agent đó)
     */
    public function getCategories(Request $request)
    {
        $agentId = $request->user()->id;
        $categories = Category::where('agent_id', $agentId)->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Create category (agent can create - tự động gán agent_id)
     */
    public function createCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
        ]);

        $agentId = $request->user()->id;
        $data = $request->all();
        $data['agent_id'] = $agentId;
        
        // Tự động viết hoa chữ cái đầu tiên của tất cả các từ trong tên danh mục
        if (isset($data['name'])) {
            $data['name'] = mb_convert_case(trim($data['name']), MB_CASE_TITLE, 'UTF-8');
        }
        
        $category = Category::create($data);

        return response()->json([
            'success' => true,
            'data' => $category,
            'message' => 'Category created successfully',
        ], 201);
    }

    /**
     * Update category (chỉ category của chính agent đó)
     */
    public function updateCategory(Request $request, $id)
    {
        $agentId = $request->user()->id;
        $category = Category::where('agent_id', $agentId)->findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
        ]);

        $data = $request->except(['agent_id']); // Không cho phép thay đổi agent_id
        
        // Tự động viết hoa chữ cái đầu tiên của tất cả các từ trong tên danh mục
        if (isset($data['name'])) {
            $data['name'] = mb_convert_case(trim($data['name']), MB_CASE_TITLE, 'UTF-8');
        }
        
        $category->update($data);

        return response()->json([
            'success' => true,
            'data' => $category,
            'message' => 'Category updated successfully',
        ]);
    }

    /**
     * Delete category (chỉ category của chính agent đó)
     */
    public function deleteCategory(Request $request, $id)
    {
        $agentId = $request->user()->id;
        $category = Category::where('agent_id', $agentId)->findOrFail($id);
        
        // Check if category has products (chỉ đếm sản phẩm của agent đó)
        if ($category->products()->where('agent_id', $agentId)->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa danh mục có sản phẩm',
            ], 400);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully',
        ]);
    }

    /**
     * Generate next SKU automatically (SP0001, SP0002, ...)
     */
    private function generateNextSKU()
    {
        // Tìm SKU cao nhất có format SP####
        $lastProduct = Product::where('sku', 'like', 'SP%')
            ->orderByRaw('CAST(SUBSTRING(sku, 3) AS UNSIGNED) DESC')
            ->first();

        if ($lastProduct && preg_match('/^SP(\d+)$/', $lastProduct->sku, $matches)) {
            // Extract số từ SKU cuối cùng và tăng lên 1
            $nextNumber = (int)$matches[1] + 1;
        } else {
            // Nếu không có SKU nào, bắt đầu từ 1
            $nextNumber = 1;
        }

        // Format với 4 chữ số (SP0001, SP0002, ..., SP9999)
        return 'SP' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }
}

