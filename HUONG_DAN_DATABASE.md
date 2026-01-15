# 💾 Hướng Dẫn Về Database

## 📍 Database lưu ở đâu?

**Database KHÔNG lưu trong code**, mà lưu trên **MySQL Server** của hosting.

### Vị trí thực tế:
- **Database:** Trên MySQL server của hosting (không phải trong code)
- **Cấu hình kết nối:** Trong file `api/.env`
- **Migrations:** Trong `api/database/migrations/` (để tạo cấu trúc database)

## 🔍 Cách xem thông tin database

### 1. Xem trong file `.env`

**Vị trí:** `api/.env`

**Nội dung:**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1        # hoặc localhost
DB_PORT=3306
DB_DATABASE=banhmi       # Tên database
DB_USERNAME=your_user    # Username
DB_PASSWORD=your_pass    # Password
```

### 2. Xem trong cPanel

**Cách 1: Qua phpMyAdmin**
1. Vào cPanel
2. Tìm **phpMyAdmin**
3. Click vào
4. Xem danh sách databases bên trái
5. Chọn database của bạn (thường có tên như `username_banhmi`)

**Cách 2: Qua MySQL Databases**
1. Vào cPanel
2. Tìm **MySQL Databases**
3. Xem danh sách databases
4. Xem thông tin: Database name, Username, Host

### 3. Xem qua SSH (nếu có)

```bash
# Kết nối MySQL
mysql -u your_username -p

# Xem danh sách databases
SHOW DATABASES;

# Chọn database
USE your_database_name;

# Xem danh sách tables
SHOW TABLES;
```

## 📊 Cấu trúc database

Database được tạo từ **migrations** trong:
```
api/database/migrations/
```

**Các bảng chính:**
- `users` - Người dùng (Admin/Agent/Customer)
- `categories` - Danh mục sản phẩm
- `products` - Sản phẩm
- `orders` - Đơn hàng
- `order_items` - Chi tiết đơn hàng
- `debts` - Công nợ
- `payments` - Thanh toán
- `debt_orders` - Liên kết công nợ và đơn hàng
- `order_audit_logs` - Lịch sử thay đổi đơn hàng

## 🔧 Cách tạo database trên hosting

### Qua cPanel:

1. **Vào MySQL Databases**
2. **Tạo database:**
   - Nhập tên: `banhmi` (hoặc tên khác)
   - Click **Create Database**
3. **Tạo user:**
   - Nhập username và password
   - Click **Create User**
4. **Gán quyền:**
   - Chọn user và database
   - Chọn **ALL PRIVILEGES**
   - Click **Make Changes**

### Lưu ý:
- Tên database thường có prefix: `username_banhmi`
- Host thường là `localhost` hoặc `127.0.0.1`
- Port thường là `3306`

## 📝 Cập nhật thông tin trong `.env`

Sau khi tạo database, cập nhật file `api/.env`:

```env
DB_CONNECTION=mysql
DB_HOST=localhost          # Thường là localhost
DB_PORT=3306
DB_DATABASE=username_banhmi  # Tên database thực tế
DB_USERNAME=username_dbuser   # Username thực tế
DB_PASSWORD=your_password     # Password thực tế
```

## 🚀 Chạy migrations để tạo tables

Sau khi cấu hình `.env`:

```bash
cd api
php artisan migrate
```

**Lệnh này sẽ:**
- Tạo tất cả các bảng trong database
- Dựa trên files trong `database/migrations/`

## 💾 Backup database

### Qua phpMyAdmin:
1. Chọn database
2. Click **Export**
3. Chọn **Quick** hoặc **Custom**
4. Click **Go**
5. Download file `.sql`

### Qua SSH:
```bash
mysqldump -u username -p database_name > backup.sql
```

## 🔄 Restore database

### Qua phpMyAdmin:
1. Chọn database
2. Click **Import**
3. Chọn file `.sql`
4. Click **Go**

### Qua SSH:
```bash
mysql -u username -p database_name < backup.sql
```

## 📍 Tóm tắt

**Database lưu ở đâu?**
- ✅ Trên MySQL server của hosting (không phải trong code)
- ✅ Có thể xem qua phpMyAdmin trong cPanel
- ✅ Thông tin kết nối trong `api/.env`

**Cách truy cập:**
- phpMyAdmin (qua cPanel)
- MySQL command line (qua SSH)
- Laravel tinker: `php artisan tinker`

**Cách quản lý:**
- Tạo database: Qua cPanel → MySQL Databases
- Xem dữ liệu: Qua phpMyAdmin
- Backup: Export từ phpMyAdmin hoặc mysqldump


