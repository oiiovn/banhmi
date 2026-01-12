<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of the categories.
     */
    public function index(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);
        
        $query = Category::with(['products' => function($q) use ($user) {
            // Nếu user đã đăng nhập và là agent, filter ra sản phẩm của chính họ
            if ($user && $user->role === 'agent') {
                $q->where(function($subQ) use ($user) {
                    $subQ->whereNull('agent_id')
                         ->orWhere('agent_id', '!=', $user->id);
                });
            }
        }]);

        // Nếu user đã đăng nhập và là agent, filter ra danh mục của chính họ
        // (để agent không thấy danh mục của mình khi ở chế độ khách hàng)
        if ($user && $user->role === 'agent') {
            $query->where(function($q) use ($user) {
                $q->whereNull('agent_id')
                  ->orWhere('agent_id', '!=', $user->id);
            });
        }

        $categories = $query->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
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
     * Display the specified category.
     */
    public function show($id)
    {
        $category = Category::with('products')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $category,
        ]);
    }
}

