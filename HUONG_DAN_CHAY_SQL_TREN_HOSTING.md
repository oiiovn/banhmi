# Hướng dẫn chạy SQL tạo bảng trên hosting

## 📋 File SQL: `api/create_debt_tables.sql`

File này chứa các câu lệnh SQL để tạo/cập nhật các bảng cần thiết cho chức năng xác nhận đơn hàng và tạo công nợ.

---

## 🎯 Các bảng sẽ được tạo/cập nhật:

1. ✅ **`debts`** - Bảng công nợ
   - Tạo mới nếu chưa có
   - Cập nhật `order_id` thành nullable (nếu đã tồn tại)
   - Thêm index `(customer_id, agent_id, status)`

2. ✅ **`debt_orders`** - Bảng liên kết đơn hàng với công nợ (QUAN TRỌNG!)
   - Tạo mới nếu chưa có
   - Unique constraint trên `order_id`

3. ✅ **`payments`** - Bảng thanh toán
   - Tạo mới nếu chưa có
   - Thêm cột `status` nếu chưa có

---

## 🚀 Cách chạy SQL trên hosting:

### Cách 1: Qua phpMyAdmin (Dễ nhất)

1. **Đăng nhập phpMyAdmin**
   - Vào cPanel → phpMyAdmin
   - Chọn database của bạn

2. **Import file SQL**
   - Click tab **SQL**
   - Copy toàn bộ nội dung file `create_debt_tables.sql`
   - Paste vào ô SQL
   - Click **Go** hoặc **Thực thi**

3. **Kiểm tra kết quả**
   - Xem message: `✅ Đã tạo/cập nhật các bảng...`
   - Kiểm tra các bảng đã được tạo trong danh sách bảng

---

### Cách 2: Qua SSH/Command Line

```bash
# 1. Upload file SQL lên hosting
# (Qua FTP hoặc SCP)

# 2. SSH vào hosting
ssh user@hosting

# 3. Chạy SQL
cd /path/to/api
mysql -u username -p database_name < create_debt_tables.sql

# Hoặc nếu đã login MySQL:
mysql -u username -p
USE database_name;
SOURCE create_debt_tables.sql;
```

---

### Cách 3: Qua MySQL Workbench / DBeaver

1. Kết nối với database hosting
2. Mở file `create_debt_tables.sql`
3. Chạy toàn bộ script

---

## ✅ Kiểm tra sau khi chạy:

### 1. Kiểm tra bảng đã tồn tại:

```sql
-- Kiểm tra bảng debts
SHOW TABLES LIKE 'debts';

-- Kiểm tra bảng debt_orders (QUAN TRỌNG!)
SHOW TABLES LIKE 'debt_orders';

-- Kiểm tra bảng payments
SHOW TABLES LIKE 'payments';
```

### 2. Kiểm tra cấu trúc bảng:

```sql
-- Kiểm tra debts.order_id có nullable không
SHOW COLUMNS FROM debts WHERE Field = 'order_id';
-- Phải thấy: Null = YES

-- Kiểm tra debt_orders có unique constraint không
SHOW INDEXES FROM debt_orders WHERE Key_name = 'debt_orders_order_id_unique';
```

### 3. Kiểm tra bằng Laravel:

```bash
cd /path/to/api
php artisan tinker

# Trong tinker:
>>> Schema::hasTable('debt_orders')
=> true

>>> Schema::hasTable('debts')
=> true

>>> DB::select("SHOW COLUMNS FROM debts WHERE Field = 'order_id'")
=> [{"Field":"order_id","Type":"bigint(20) unsigned","Null":"YES",...}]
```

---

## 🔍 Xử lý lỗi:

### Lỗi: "Table 'debts' already exists"

✅ **Không sao!** Script sử dụng `CREATE TABLE IF NOT EXISTS`, sẽ bỏ qua nếu bảng đã tồn tại.

### Lỗi: "Foreign key constraint fails"

❌ **Nguyên nhân:** Bảng `orders` hoặc `users` chưa tồn tại.

**Sửa:** Đảm bảo các bảng phụ thuộc đã được tạo:
- `orders`
- `users`

### Lỗi: "Duplicate key name"

✅ **Không sao!** Script đã kiểm tra index trước khi tạo.

### Lỗi: "Column 'status' already exists"

✅ **Không sao!** Script đã kiểm tra cột trước khi thêm.

---

## 📋 Checklist sau khi chạy:

- [ ] Bảng `debts` đã tồn tại
- [ ] Cột `debts.order_id` là nullable (Null = YES)
- [ ] Bảng `debt_orders` đã tồn tại (QUAN TRỌNG!)
- [ ] Bảng `debt_orders` có unique constraint trên `order_id`
- [ ] Bảng `payments` đã tồn tại
- [ ] Cột `payments.status` đã tồn tại
- [ ] Test chức năng xác nhận đơn hàng hoạt động

---

## 🎯 Kết quả mong đợi:

Sau khi chạy SQL thành công:
- ✅ Tất cả bảng đã được tạo/cập nhật
- ✅ Không có lỗi foreign key
- ✅ Chức năng xác nhận đơn hàng hoạt động bình thường
- ✅ Công nợ được tạo tự động khi xác nhận đơn hàng

---

## 📞 Nếu vẫn gặp lỗi:

1. Copy toàn bộ error message
2. Kiểm tra log: `storage/logs/laravel.log`
3. Kiểm tra database connection trong `.env`
4. Đảm bảo user MySQL có quyền CREATE, ALTER, INDEX
