<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AgentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DebtController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes - no throttle for auth to prevent "Too Many Attempts" error
Route::post('/register', [AuthController::class, 'register'])->withoutMiddleware(['throttle']);
Route::post('/login', [AuthController::class, 'login'])->withoutMiddleware(['throttle']);

// Test route để kiểm tra auto-deploy
Route::get('/test', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'API đang hoạt động! Auto-deploy thành công!',
        'timestamp' => now()->toDateTimeString(),
        'version' => '1.0.0'
    ]);
});

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Protected routes - Customer
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']); // Get current user info

    // Customer routes
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders/{id}/confirm-received', [OrderController::class, 'confirmReceived']);
    
    // Customer debt and payment routes
    Route::get('/debts', [DebtController::class, 'indexForCustomer']);
    Route::get('/debts/{id}', [DebtController::class, 'show']);
    Route::get('/payments', [PaymentController::class, 'indexForCustomer']);
    Route::post('/payments', [PaymentController::class, 'store']);
    Route::get('/payments/{id}', [PaymentController::class, 'show']);
});

// Admin routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    
    // Quản lý đại lý
    Route::get('/agents', [AdminController::class, 'getAgents']);
    Route::post('/agents', [AdminController::class, 'createAgent']);
    Route::put('/agents/{id}', [AdminController::class, 'updateAgent']);
    Route::delete('/agents/{id}', [AdminController::class, 'deleteAgent']);
    
    // Quản lý khách hàng
    Route::get('/customers', [AdminController::class, 'getCustomers']);
    Route::post('/customers/{id}/upgrade-to-agent', [AdminController::class, 'upgradeToAgent']);
    
    // Quản lý đơn hàng
    Route::get('/orders', [AdminController::class, 'getAllOrders']);
    Route::put('/orders/{id}/status', [AdminController::class, 'updateOrderStatus']);
    
    // Quản lý sản phẩm
    Route::get('/products', [AdminController::class, 'getAllProducts']);
    Route::post('/products', [AdminController::class, 'createProduct']);
    Route::put('/products/{id}', [AdminController::class, 'updateProduct']);
    Route::delete('/products/{id}', [AdminController::class, 'deleteProduct']);
    
    // Quản lý danh mục
    Route::post('/categories', [AdminController::class, 'createCategory']);
    Route::put('/categories/{id}', [AdminController::class, 'updateCategory']);
    Route::delete('/categories/{id}', [AdminController::class, 'deleteCategory']);
});

// Agent routes
Route::middleware(['auth:sanctum', 'agent'])->prefix('agent')->group(function () {
    Route::get('/dashboard', [AgentController::class, 'dashboard']);
    
    // Orders
    Route::get('/orders', [AgentController::class, 'getOrders']);
    Route::get('/orders/pending', [AgentController::class, 'getPendingOrders']);
    Route::get('/orders/pending/{id}', [AgentController::class, 'getPendingOrder']);
    Route::get('/orders/{id}', [AgentController::class, 'getOrder']);
    Route::put('/orders/{id}/edit', [AgentController::class, 'updateOrderBeforeAccept']);
    Route::post('/orders/{id}/accept', [AgentController::class, 'acceptOrder']);
    Route::put('/orders/{id}/status', [AgentController::class, 'updateOrderStatus']);
    
    // Products
    Route::get('/products', [AgentController::class, 'getProducts']);
    Route::get('/products/{id}', [AgentController::class, 'getProduct']);
    Route::post('/products', [AgentController::class, 'createProduct']);
    Route::post('/products/{id}', [AgentController::class, 'updateProduct']); // Allow POST for FormData with _method=PUT
    Route::put('/products/{id}', [AgentController::class, 'updateProduct']);
    Route::delete('/products/{id}', [AgentController::class, 'deleteProduct']);
    
    // Categories
    Route::get('/categories', [AgentController::class, 'getCategories']);
    Route::post('/categories', [AgentController::class, 'createCategory']);
    Route::put('/categories/{id}', [AgentController::class, 'updateCategory']);
    Route::delete('/categories/{id}', [AgentController::class, 'deleteCategory']);
    
    // Agent debt and payment routes
    Route::get('/debts', [DebtController::class, 'indexForAgent']);
    Route::get('/debts/{id}', [DebtController::class, 'show']);
    Route::get('/debts/{id}/opposite', [DebtController::class, 'findOppositeDebt']); // Tìm công nợ đối ứng
    Route::put('/debts/{id}', [DebtController::class, 'update']);
    
    // Debt transfer routes
    Route::post('/debts/transfer', [DebtController::class, 'createTransfer']);
    Route::get('/debts/transfers/pending', [DebtController::class, 'getPendingTransfers']);
    Route::post('/debts/transfers/{id}/confirm', [DebtController::class, 'confirmTransfer']);
    Route::post('/debts/transfers/{id}/reject', [DebtController::class, 'rejectTransfer']);
    
    Route::get('/payments', [PaymentController::class, 'indexForAgent']);
    Route::get('/payments/pending', [PaymentController::class, 'getPendingPayments']);
    Route::post('/payments', [PaymentController::class, 'store']);
    Route::get('/payments/{id}', [PaymentController::class, 'show']);
    Route::post('/payments/{id}/confirm', [PaymentController::class, 'confirmPayment']);
    Route::post('/payments/{id}/reject', [PaymentController::class, 'rejectPayment']);
});

