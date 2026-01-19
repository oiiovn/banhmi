# Debug: Lỗi xác nhận đơn hàng trên hosting

## 🔍 Nguyên nhân có thể:

### 1. ⚠️ Bảng `debt_orders` chưa được tạo (QUAN TRỌNG NHẤT!)

**Lỗi:** `Table 'database.debt_orders' doesn't exist`

**Kiểm tra:**
```bash
# Qua SSH
cd /path/to/api
php artisan migrate:status | grep debt_orders

# Hoặc qua SQL
SHOW TABLES LIKE 'debt_orders';
```

**Sửa:**
```bash
php artisan migrate --path=database/migrations/2025_12_30_143031_create_debt_orders_table.php
```

---

### 2. ⚠️ Bảng `debts` chưa được cập nhật (order_id nullable)

**Lỗi:** `Column 'order_id' cannot be null`

**Kiểm tra:**
```sql
SHOW COLUMNS FROM debts LIKE 'order_id';
-- Phải thấy: NULL = YES
```

**Sửa:**
```bash
php artisan migrate --path=database/migrations/2025_12_30_143030_update_debts_table_for_consolidated_debt.php
```

---

### 3. ⚠️ Database connection issues

**Lỗi:** `SQLSTATE[HY000] [2002] Connection refused` hoặc timeout

**Kiểm tra:**
```bash
# Kiểm tra .env
cat .env | grep DB_

# Test connection
php artisan tinker
>>> DB::connection()->getPdo();
```

**Sửa:**
- Kiểm tra database credentials trong `.env`
- Kiểm tra database server đang chạy
- Kiểm tra firewall/security settings

---

### 4. ⚠️ Permission issues

**Lỗi:** `Permission denied` hoặc `Access denied`

**Kiểm tra:**
```bash
ls -la storage/logs/
ls -la bootstrap/cache/
```

**Sửa:**
```bash
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
chown -R www-data:www-data storage/ bootstrap/cache/
```

---

### 5. ⚠️ Foreign key constraints

**Lỗi:** `Cannot add or update a child row: a foreign key constraint fails`

**Kiểm tra:**
```sql
-- Kiểm tra order có agent_id không
SELECT id, user_id, agent_id, status FROM orders WHERE id = ?;

-- Kiểm tra user và agent có tồn tại không
SELECT id FROM users WHERE id IN (?, ?);
```

**Sửa:**
- Đảm bảo order có `agent_id`
- Đảm bảo user và agent tồn tại trong bảng `users`

---

### 6. ⚠️ Transaction rollback issues

**Lỗi:** `Transaction already closed` hoặc silent failure

**Kiểm tra log:**
```bash
tail -f storage/logs/laravel.log
```

**Sửa:**
- Xem log chi tiết để biết lỗi cụ thể
- Kiểm tra database transaction settings

---

### 7. ⚠️ CORS hoặc API routing issues

**Lỗi:** `404 Not Found` hoặc `CORS policy`

**Kiểm tra:**
- API endpoint có đúng không: `POST /api/orders/{id}/confirm-received`
- CORS config trong `config/cors.php`
- `.htaccess` routing đúng chưa

---

## 🛠️ Script kiểm tra nhanh:

Tạo file `check-debt-tables.php` trong thư mục API:

```php
<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

echo "🔍 Kiểm tra bảng debt...\n\n";

try {
    // Kiểm tra bảng debts
    if (DB::getSchemaBuilder()->hasTable('debts')) {
        echo "✅ Bảng 'debts' đã tồn tại\n";
        
        // Kiểm tra order_id nullable
        $columns = DB::select("SHOW COLUMNS FROM debts WHERE Field = 'order_id'");
        if (!empty($columns) && $columns[0]->Null === 'YES') {
            echo "✅ Cột 'order_id' trong 'debts' đã nullable\n";
        } else {
            echo "❌ Cột 'order_id' trong 'debts' CHƯA nullable!\n";
        }
    } else {
        echo "❌ Bảng 'debts' CHƯA tồn tại!\n";
    }
    
    // Kiểm tra bảng debt_orders
    if (DB::getSchemaBuilder()->hasTable('debt_orders')) {
        echo "✅ Bảng 'debt_orders' đã tồn tại\n";
    } else {
        echo "❌ Bảng 'debt_orders' CHƯA tồn tại! (QUAN TRỌNG!)\n";
    }
    
    // Kiểm tra bảng payments
    if (DB::getSchemaBuilder()->hasTable('payments')) {
        echo "✅ Bảng 'payments' đã tồn tại\n";
    } else {
        echo "⚠️  Bảng 'payments' chưa tồn tại (không bắt buộc)\n";
    }
    
    echo "\n✅ Kiểm tra hoàn tất!\n";
    
} catch (\Exception $e) {
    echo "❌ Lỗi: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
```

Chạy:
```bash
php check-debt-tables.php
```

**XÓA FILE SAU KHI CHẠY XONG!**

---

## 📋 Checklist debug:

- [ ] Bảng `debt_orders` đã tồn tại?
- [ ] Bảng `debts` có cột `order_id` nullable?
- [ ] Database connection hoạt động?
- [ ] File permissions đúng?
- [ ] Log file có ghi lỗi gì không?
- [ ] Order có `agent_id` không?
- [ ] User và Agent tồn tại trong database?
- [ ] API endpoint đúng?
- [ ] CORS config đúng?

---

## 🔍 Kiểm tra log chi tiết:

```bash
# Xem log mới nhất
tail -n 100 storage/logs/laravel.log | grep -A 20 "confirmReceived\|Failed to confirm\|debt_orders"

# Xem tất cả lỗi
tail -n 200 storage/logs/laravel.log | grep -i error
```

---

## 🚀 Cách sửa nhanh nhất:

1. **Chạy tất cả migrations:**
```bash
cd /path/to/api
git pull origin main
php artisan migrate --force
```

2. **Clear cache:**
```bash
php artisan config:clear
php artisan route:clear
php artisan cache:clear
```

3. **Kiểm tra lại:**
```bash
php artisan migrate:status | grep -E "(debt|payment)"
```

4. **Test lại chức năng xác nhận đơn hàng**

---

## 📞 Nếu vẫn lỗi:

1. Copy toàn bộ error message từ browser console
2. Copy log từ `storage/logs/laravel.log`
3. Kiểm tra database structure
4. So sánh với local environment
