# Hướng dẫn chạy migration trên hosting

## ⚠️ QUAN TRỌNG: Migration cho bảng `payments` và `debt_orders`

Trên hosting có thể chưa chạy các migration mới. Cần chạy migration để đảm bảo database đầy đủ.

---

## 📋 Các migration cần chạy:

1. ✅ `2025_12_30_115251_create_debts_table` - Tạo bảng debts
2. ⚠️ `2025_12_30_115252_create_payments_table` - Tạo bảng payments (đã sửa để tránh lỗi)
3. ✅ `2025_12_30_143030_update_debts_table_for_consolidated_debt` - Cập nhật bảng debts
4. ⚠️ `2025_12_30_143031_create_debt_orders_table` - Tạo bảng debt_orders (QUAN TRỌNG cho xác nhận đơn hàng)

---

## 🚀 Cách chạy migration trên hosting:

### Cách 1: Qua SSH (Khuyến nghị)

```bash
# 1. SSH vào hosting
ssh user@hosting

# 2. Di chuyển vào thư mục API
cd /path/to/api
# Hoặc: cd ~/public_html/api
# Hoặc: cd domains/websi.vn/api

# 3. Pull code mới từ Git
git pull origin main

# 4. Kiểm tra migration status
php artisan migrate:status

# 5. Chạy migration
php artisan migrate

# 6. Nếu bảng payments đã tồn tại và bị lỗi:
# Migration đã được sửa để tự động bỏ qua nếu bảng đã tồn tại
# Nếu vẫn lỗi, chạy:
php artisan migrate --force
```

### Cách 2: Qua cPanel Terminal

1. Đăng nhập cPanel
2. Mở **Terminal** hoặc **SSH Access**
3. Chạy các lệnh tương tự như trên

### Cách 3: Qua File Manager + Cron Job

1. Tạo file `run-migrate.php` trong thư mục API:
```php
<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$kernel->call('migrate', ['--force' => true]);
```

2. Chạy qua browser: `https://api.websi.vn/run-migrate.php`
3. **XÓA FILE SAU KHI CHẠY XONG** (bảo mật)

---

## 🔍 Kiểm tra migration đã chạy chưa:

### Qua SSH:
```bash
cd /path/to/api
php artisan migrate:status | grep -E "(payments|debt_orders|debts)"
```

### Qua Database (phpMyAdmin):

1. Mở phpMyAdmin
2. Chọn database
3. Kiểm tra các bảng:
   - ✅ `debts` - Công nợ
   - ✅ `payments` - Thanh toán
   - ✅ `debt_orders` - Liên kết đơn hàng với công nợ (QUAN TRỌNG!)

### Kiểm tra bảng `debt_orders`:

```sql
SHOW TABLES LIKE 'debt_orders';
```

Nếu không có kết quả → Migration chưa chạy!

---

## ⚠️ Lưu ý quan trọng:

### 1. Migration `create_payments_table` đã được sửa:

Migration này đã được sửa để **tự động bỏ qua** nếu bảng `payments` đã tồn tại:

```php
if (Schema::hasTable('payments')) {
    return; // Bỏ qua nếu bảng đã tồn tại
}
```

### 2. Migration `create_debt_orders_table` QUAN TRỌNG:

Bảng `debt_orders` **BẮT BUỘC** phải có để chức năng xác nhận đơn hàng hoạt động!

Nếu thiếu bảng này → Lỗi: `Table 'debt_orders' doesn't exist`

### 3. Backup database trước khi chạy:

```bash
# Backup database
mysqldump -u username -p database_name > backup_$(date +%Y%m%d).sql
```

---

## 🐛 Xử lý lỗi:

### Lỗi: "Table 'payments' already exists"

✅ **Đã được xử lý** - Migration đã được sửa để tự động bỏ qua.

### Lỗi: "Table 'debt_orders' doesn't exist"

❌ **Cần chạy migration ngay:**
```bash
php artisan migrate --path=database/migrations/2025_12_30_143031_create_debt_orders_table.php
```

### Lỗi: "Base table or view not found"

Kiểm tra xem các bảng phụ thuộc đã tồn tại chưa:
- `debts` phải có trước `debt_orders`
- `orders` phải có trước `debt_orders`
- `users` phải có trước `debts`

---

## ✅ Checklist sau khi chạy migration:

- [ ] Migration `create_debt_orders_table` đã chạy
- [ ] Bảng `debt_orders` đã tồn tại trong database
- [ ] Migration `create_payments_table` đã chạy (hoặc bỏ qua nếu đã có)
- [ ] Bảng `payments` đã tồn tại
- [ ] Test chức năng xác nhận đơn hàng hoạt động
- [ ] Không còn lỗi "Table doesn't exist"

---

## 📞 Nếu vẫn gặp lỗi:

1. Kiểm tra log: `storage/logs/laravel.log`
2. Kiểm tra quyền file: `chmod -R 755 storage/`
3. Kiểm tra database connection trong `.env`
4. Clear cache: `php artisan config:clear`
