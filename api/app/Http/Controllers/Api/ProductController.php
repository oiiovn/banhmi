<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the products.
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'agent']);

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('is_available')) {
            $query->where('is_available', $request->is_available);
        }

        // Nếu user đã đăng nhập và là agent, filter ra sản phẩm của chính họ
        // (để agent không thấy sản phẩm của mình khi ở chế độ khách hàng)
        $user = $this->getAuthenticatedUser($request);
        if ($user && $user->role === 'agent') {
            $query->where(function($q) use ($user) {
                $q->whereNull('agent_id')
                  ->orWhere('agent_id', '!=', $user->id);
            });
        }

        // Thêm tổng số lượng đã bán (đơn đã giao) và ưu tiên bán chạy lên đầu
        $subquery = '(SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi INNER JOIN orders o ON o.id = oi.order_id WHERE oi.product_id = products.id AND o.status = "delivered")';
        $query->selectRaw("products.*, {$subquery} as total_sold")
            ->orderByRaw("{$subquery} DESC");

        $products = $query->get();

        // Đảm bảo mỗi sản phẩm luôn có total_sold (số) trong response (tránh thiếu trên hosting)
        $products = $products->map(function ($product) {
            $product->total_sold = (int) ($product->total_sold ?? 0);
            return $product;
        });

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Get authenticated user from token if available
     */
    private function getAuthenticatedUser(Request $request)
    {
        // Try to get user from request (if middleware authenticated)
        if ($request->user()) {
            return $request->user();
        }

        // Try to authenticate from token in header
        $token = $request->bearerToken();
        if ($token) {
            $personalAccessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
            if ($personalAccessToken) {
                return $personalAccessToken->tokenable;
            }
        }

        return null;
    }

    /**
     * Display the specified product.
     */
    public function show($id)
    {
        $product = Product::with(['category', 'agent'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }
}

