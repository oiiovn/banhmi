# ✏️ Hướng Dẫn Sửa Code Trên Host

## ✅ Có thể sửa code trên host!

Bạn có thể sửa code trực tiếp trên hosting server qua:
- **File Manager** trong cPanel
- **SSH** (nếu có quyền)
- **FTP Client**

## 🔧 Các file quan trọng có thể sửa trên host

### 1. File `.env` của API

**Vị trí:** `domains/api.websi.vn/api/.env`

**Có thể sửa:**
- Database connection
- APP_URL
- CORS_ALLOWED_ORIGINS
- Các cấu hình khác

**Cách sửa:**
1. Vào File Manager
2. Điều hướng đến `domains/api.websi.vn/api/`
3. Chọn file `.env`
4. Click **Edit**
5. Sửa và **Save**

**Sau khi sửa:**
```bash
# Clear cache (nếu có SSH)
php artisan config:clear
```

### 2. File `index.php` của API

**Vị trí:** `domains/api.websi.vn/public_html/index.php`

**Có thể sửa:**
- Path đến thư mục api
- Các đường dẫn

**Cách sửa:**
1. Vào File Manager
2. Điều hướng đến `public_html/`
3. Chọn `index.php`
4. Click **Edit**
5. Sửa path nếu cần

### 3. File `.htaccess`

**Vị trí:** 
- `domains/api.websi.vn/public_html/.htaccess`
- `domains/websi.vn/public_html/.htaccess`

**Có thể sửa:**
- Rewrite rules
- Security headers
- Các cấu hình Apache

**Cách sửa:**
1. Vào File Manager
2. Chọn file `.htaccess`
3. Click **Edit**
4. Sửa và **Save**

### 4. File config của API

**Vị trí:** `domains/api.websi.vn/api/config/`

**Có thể sửa:**
- `cors.php` - CORS configuration
- `database.php` - Database config (nhưng nên dùng .env)
- Các file config khác

**Lưu ý:** Sau khi sửa config, cần clear cache:
```bash
php artisan config:clear
```

### 5. File `.env.production` của Web

**Vị trí:** `domains/websi.vn/web/.env.production`

**Có thể sửa:**
- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_IMAGE_DOMAINS

**Sau khi sửa:** Cần rebuild Next.js

## 📝 Các trường hợp thường sửa trên host

### 1. Sửa API URL trong Web

**File:** `web/.env.production`

**Sửa:**
```env
NEXT_PUBLIC_API_URL=https://api.websi.vn/api
```

**Sau khi sửa:**
- Nếu dùng static export: Cần rebuild và upload lại
- Nếu dùng Node.js server: Restart server

### 2. Sửa CORS trong API

**File:** `api/config/cors.php` hoặc `api/.env`

**Sửa trong `.env`:**
```env
CORS_ALLOWED_ORIGINS=https://websi.vn,https://www.websi.vn
```

**Sau khi sửa:**
```bash
php artisan config:clear
```

### 3. Sửa Database Connection

**File:** `api/.env`

**Sửa:**
```env
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

**Sau khi sửa:**
- Không cần restart
- Laravel sẽ tự động đọc lại

### 4. Sửa path trong index.php

**File:** `public_html/index.php`

**Nếu cấu trúc thư mục khác, sửa path:**
```php
// Từ:
require __DIR__.'/../api/vendor/autoload.php';

// Thành path đúng với cấu trúc của bạn
```

## ⚠️ Lưu ý khi sửa trên host

### 1. Backup trước khi sửa

**Qua File Manager:**
- Chọn file
- Click **Copy** hoặc **Download**
- Giữ bản backup

### 2. Kiểm tra syntax

**Với PHP:**
```bash
php -l filename.php
```

**Với JavaScript/TypeScript:**
- Kiểm tra trong browser console

### 3. Clear cache sau khi sửa config

**Laravel:**
```bash
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

**Next.js:**
- Xóa thư mục `.next/`
- Rebuild: `npm run build`

### 4. Permissions

- Đảm bảo file có quyền ghi
- Thường là `644` cho files, `755` cho folders

## 🔍 Cách sửa qua File Manager

### Bước 1: Vào File Manager

1. Đăng nhập cPanel
2. Tìm **File Manager**
3. Click vào

### Bước 2: Điều hướng đến file

1. Mở thư mục cần thiết
2. Tìm file cần sửa

### Bước 3: Sửa file

1. **Chọn file** (click vào tên)
2. Click **Edit** (icon bút chì)
3. **Sửa nội dung** trong editor
4. Click **Save Changes**

### Bước 4: Kiểm tra

- Reload trang web
- Kiểm tra có lỗi không
- Xem error log nếu có

## 🔧 Cách sửa qua SSH

**Nếu có quyền SSH:**

```bash
# Vào thư mục
cd domains/api.websi.vn/api

# Sửa file .env
nano .env
# hoặc
vi .env

# Sửa và save (trong nano: Ctrl+O, Enter, Ctrl+X)
# (trong vi: :wq để save và quit)

# Clear cache
php artisan config:clear
```

## 📋 Checklist khi sửa trên host

- [ ] Đã backup file trước khi sửa
- [ ] Đã kiểm tra syntax (nếu có thể)
- [ ] Đã save file
- [ ] Đã clear cache (nếu sửa config)
- [ ] Đã test lại chức năng
- [ ] Đã kiểm tra error log

## 🆘 Nếu sửa sai

1. **Restore từ backup:**
   - Upload lại file backup
   - Hoặc dùng version control (nếu có)

2. **Kiểm tra error log:**
   - Xem error log trong cPanel
   - Hoặc `/var/log/nginx/error.log`

3. **Revert thay đổi:**
   - Undo trong editor (nếu có)
   - Hoặc restore từ backup

## ✅ Tóm tắt

**Có thể sửa trên host:**
- ✅ File `.env` - Cấu hình
- ✅ File `.htaccess` - Apache config
- ✅ File `index.php` - Entry point
- ✅ File config - CORS, database, etc.
- ✅ File code PHP - Controllers, Models, etc.

**Không nên sửa:**
- ❌ File trong `vendor/` - Sẽ bị ghi đè khi `composer install`
- ❌ File trong `node_modules/` - Sẽ bị ghi đè khi `npm install`

**Sau khi sửa:**
- Clear cache nếu sửa config
- Restart service nếu cần
- Test lại chức năng


