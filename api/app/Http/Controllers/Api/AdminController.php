<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function dashboard()
    {
        $stats = [
            'total_customers' => User::where('role', 'customer')->count(),
            'total_agents' => User::where('role', 'agent')->count(),
            'total_products' => Product::count(),
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'total_revenue' => Order::where('status', 'delivered')->sum('total_amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get all agents
     */
    public function getAgents()
    {
        $agents = User::where('role', 'agent')
            ->withCount(['agentOrders'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $agents,
        ]);
    }

    /**
     * Create a new agent
     */
    public function createAgent(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
        ]);

        $agent = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'address' => $request->address,
            'role' => 'agent',
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'data' => $agent,
            'message' => 'Agent created successfully',
        ], 201);
    }

    /**
     * Update agent
     */
    public function updateAgent(Request $request, $id)
    {
        $agent = User::where('role', 'agent')->findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($agent->id)],
            'password' => 'sometimes|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($request->has('password')) {
            $request->merge(['password' => Hash::make($request->password)]);
        }

        $agent->update($request->only(['name', 'email', 'password', 'phone', 'address', 'is_active']));

        return response()->json([
            'success' => true,
            'data' => $agent,
            'message' => 'Agent updated successfully',
        ]);
    }

    /**
     * Delete agent
     */
    public function deleteAgent($id)
    {
        $agent = User::where('role', 'agent')->findOrFail($id);
        $agent->delete();

        return response()->json([
            'success' => true,
            'message' => 'Agent deleted successfully',
        ]);
    }

    /**
     * Get all customers
     */
    public function getCustomers()
    {
        $customers = User::where('role', 'customer')
            ->withCount(['customerOrders'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $customers,
        ]);
    }

    /**
     * Upgrade customer to agent
     */
    public function upgradeToAgent(Request $request, $id)
    {
        $customer = User::where('role', 'customer')->findOrFail($id);

        $customer->role = 'agent';
        $customer->save();

        return response()->json([
            'success' => true,
            'data' => $customer,
            'message' => 'Customer upgraded to agent successfully',
        ]);
    }

    /**
     * Get all orders (admin view)
     */
    public function getAllOrders(Request $request)
    {
        $query = Order::with(['user', 'agent', 'items.product']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('agent_id')) {
            $query->where('agent_id', $request->agent_id);
        }

        if ($request->has('customer_id')) {
            $query->where('user_id', $request->customer_id);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Update order status (admin)
     */
    public function updateOrderStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,preparing,ready,delivered,cancelled',
            'agent_id' => 'nullable|exists:users,id',
        ]);

        $order = Order::findOrFail($id);

        // Nếu assign agent, chỉ assign cho agent
        if ($request->has('agent_id')) {
            $agent = User::where('id', $request->agent_id)
                ->where('role', 'agent')
                ->firstOrFail();
            $order->agent_id = $agent->id;
        }

        $order->status = $request->status;
        $order->save();

        $order->load(['user', 'agent', 'items.product']);

        return response()->json([
            'success' => true,
            'data' => $order,
            'message' => 'Order status updated successfully',
        ]);
    }

    /**
     * Get all products (admin can manage)
     */
    public function getAllProducts(Request $request)
    {
        $query = Product::with('category');

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $products = $query->get();

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Create product
     */
    public function createProduct(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0|max:999999.99',
            'wholesale_price' => 'nullable|numeric|min:0|max:999999.99',
            'original_price' => 'nullable|numeric|min:0|max:999999.99',
            'unit' => 'nullable|string|max:50',
            'image' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'is_available' => 'boolean',
        ]);

        // Kiểm tra giá gốc phải bé hơn giá sỉ ít nhất 100 đ (nếu cả 2 đều có)
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

        $data = $request->except(['sku']); // Loại bỏ SKU khỏi request data
        
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

        // Tự động generate SKU tăng dần (SP0001, SP0002, ...)
        $data['sku'] = $this->generateNextSKU();

        $product = Product::create($data);

        return response()->json([
            'success' => true,
            'data' => $product->load('category'),
            'message' => 'Product created successfully',
        ], 201);
    }

    /**
     * Update product
     */
    public function updateProduct(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0|max:999999999.99',
            'wholesale_price' => 'nullable|numeric|min:0|max:999999999.99',
            'original_price' => 'nullable|numeric|min:0|max:999999999.99',
            'unit' => 'nullable|string|max:50',
            'image' => 'nullable|string',
            'category_id' => 'sometimes|exists:categories,id',
            'is_available' => 'sometimes|boolean',
        ]);

        // Kiểm tra giá gốc phải bé hơn giá sỉ ít nhất 100 đ
        $wholesalePrice = $request->has('wholesale_price') ? (float)$request->wholesale_price : (float)$product->wholesale_price;
        $originalPrice = $request->has('original_price') ? (float)$request->original_price : (float)$product->original_price;
        if ($wholesalePrice && $originalPrice && $originalPrice >= $wholesalePrice - 100) {
            return response()->json([
                'success' => false,
                'message' => 'Giá gốc phải bé hơn giá sỉ ít nhất 100 đ',
            ], 422);
        }

        $data = $request->except(['sku']); // Không cho phép sửa SKU
        
        // Tự động viết hoa chữ cái đầu tiên của tất cả các từ trong tên sản phẩm
        if (isset($data['name'])) {
            $data['name'] = mb_convert_case(trim($data['name']), MB_CASE_TITLE, 'UTF-8');
        }

        // Tự động tạo mô tả: "Số lượng xxx + đơn vị + là giá (giá sỉ)"
        $quantity = $request->has('quantity_per_unit') ? $data['quantity_per_unit'] : $product->quantity_per_unit;
        $unit = $request->has('unit') ? $data['unit'] : $product->unit;
        $wholesalePrice = $request->has('wholesale_price') ? $data['wholesale_price'] : $product->wholesale_price;
        
        if ($quantity && $unit && $wholesalePrice) {
            $price = number_format($wholesalePrice, 0, ',', '.');
            $data['description'] = "Số lượng {$quantity} {$unit} là giá {$price} ({$price})";
        }

        $product->update($data);

        return response()->json([
            'success' => true,
            'data' => $product->load('category'),
            'message' => 'Product updated successfully',
        ]);
    }

    /**
     * Delete product
     */
    public function deleteProduct($id)
    {
        $product = Product::findOrFail($id);
        
        // Sử dụng soft delete - sản phẩm sẽ bị ẩn nhưng không bị xóa hoàn toàn
        // Dữ liệu đơn hàng vẫn được bảo toàn
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sản phẩm đã được xóa (ẩn). Dữ liệu đơn hàng được bảo toàn.',
        ]);
    }

    /**
     * Create category
     */
    public function createCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
        ]);

        $data = $request->all();
        
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
     * Update category
     */
    public function updateCategory(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
        ]);

        $data = $request->all();
        
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
     * Delete category
     */
    public function deleteCategory($id)
    {
        $category = Category::findOrFail($id);
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

