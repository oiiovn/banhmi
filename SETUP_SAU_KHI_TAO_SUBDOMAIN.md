# ✅ Setup Code Sau Khi Đã Tạo Subdomain

## 🎯 Tình trạng hiện tại

✅ Subdomain `api.websi.vn` đã được tạo  
✅ Document Root: `/domains/api.websi.vn/public_html`  
⏳ Cần setup code và cấu hình

## 📋 Các bước tiếp theo

### Bước 1: Giải nén file `api-deploy.zip`

1. **Vào File Manager**
2. **Điều hướng đến:** `domains/api.websi.vn/public_html/`
3. **Chọn file:** `api-deploy.zip`
4. **Click "Extract" hoặc "Archive" → "Extract"**
5. **Giải nén vào thư mục hiện tại**

**Kết quả sau khi giải nén:**
```
public_html/
├── api/                    ← Thư mục đã giải nén
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/             ← Quan trọng!
│   ├── routes/
│   ├── storage/
│   ├── vendor/             ← Sẽ cài lại
│   ├── artisan
│   ├── composer.json
│   └── .env                ← Sẽ tạo mới
├── api-deploy.zip
├── cgi-bin/
├── .htaccess
└── index.html
```

### Bước 2: Di chuyển nội dung từ `api/public/` lên `public_html/`

**Cách 1: Qua File Manager**
1. Vào thư mục `public_html/api/public/`
2. Chọn **TẤT CẢ** file và folder (Ctrl+A / Cmd+A)
3. Click **"Move"**
4. Di chuyển lên `public_html/` (thư mục cha)
5. Xác nhận

**Cách 2: Qua SSH (nếu có)**
```bash
cd /domains/api.websi.vn/public_html
cp -r api/public/* .
```

**Kết quả:**
```
public_html/
├── api/                    ← Thư mục gốc Laravel
├── index.php               ← Từ api/public/
├── .htaccess              ← Từ api/public/ (quan trọng!)
├── cgi-bin/
└── index.html              ← Có thể xóa
```

### Bước 3: Sửa file `public_html/index.php`

Mở file `index.php` và sửa các đường dẫn:

**Tìm và thay thế:**

**Dòng 15:**
```php
// Tìm:
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {

// Thay bằng:
if (file_exists($maintenance = __DIR__.'/../api/storage/framework/maintenance.php')) {
```

**Dòng 24:**
```php
// Tìm:
require __DIR__.'/../vendor/autoload.php';

// Thay bằng:
require __DIR__.'/../api/vendor/autoload.php';
```

**Dòng 32:**
```php
// Tìm:
$app = require_once __DIR__.'/../bootstrap/app.php';

// Thay bằng:
$app = require_once __DIR__.'/../api/bootstrap/app.php';
```

**File `index.php` hoàn chỉnh sau khi sửa:**
```php
<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (file_exists($maintenance = __DIR__.'/../api/storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../api/vendor/autoload.php';

$app = require_once __DIR__.'/../api/bootstrap/app.php';

$kernel = $app->make(Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);
```

### Bước 4: Tạo file `.env`

1. **Tạo file mới** trong `public_html/api/`
2. **Đặt tên:** `.env`
3. **Nội dung:**
```env
APP_NAME=Banhmi
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.websi.vn

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

CORS_ALLOWED_ORIGINS=https://websi.vn,https://www.websi.vn

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"
```

**⚠️ Quan trọng:** Thay thế:
- `your_database_name` → Tên database thực
- `your_database_user` → Username database thực
- `your_database_password` → Password database thực

### Bước 5: Cài dependencies

**Nếu có SSH/Terminal:**

```bash
cd /domains/api.websi.vn/api

# Cài dependencies
composer install --optimize-autoloader --no-dev

# Generate key
php artisan key:generate

# Chạy migrations
php artisan migrate --force

# Tạo storage link
php artisan storage:link

# Cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Permissions
chmod -R 775 storage bootstrap/cache
```

**Nếu KHÔNG có SSH:**

1. **Trên máy local:**
   ```bash
   cd api
   composer install --optimize-autoloader --no-dev
   ```

2. **Nén thư mục `vendor/`:**
   ```bash
   zip -r vendor.zip vendor/
   ```

3. **Upload `vendor.zip` lên server**
4. **Giải nén vào `public_html/api/vendor/`**

### Bước 6: Set permissions

**Qua File Manager:**
1. Chọn thư mục `api/storage/`
2. Click "Permissions" hoặc "Change Permissions"
3. Set: `775` (rwxrwxr-x)
4. Apply recursively

**Qua SSH:**
```bash
chmod -R 775 /domains/api.websi.vn/api/storage
chmod -R 775 /domains/api.websi.vn/api/bootstrap/cache
```

### Bước 7: Kiểm tra `.htaccess`

Đảm bảo file `.htaccess` trong `public_html/` có nội dung:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

### Bước 8: Đợi DNS propagate

Sau khi tạo subdomain, DNS cần thời gian:
- **Thường:** 5-30 phút
- **Tối đa:** 24 giờ (hiếm)

**Kiểm tra DNS:**
- https://www.whatsmydns.net/#A/api.websi.vn
- Hoặc: `nslookup api.websi.vn`

### Bước 9: Test API

Sau khi DNS đã propagate:

**Test trong browser:**
```
https://api.websi.vn/api/categories
```

**Hoặc dùng curl:**
```bash
curl https://api.websi.vn/api/categories
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "data": [...]
}
```

## 🧪 Test tạm thời (không cần đợi DNS)

Nếu muốn test ngay:

1. **Tìm IP server:**
   - Ping `websi.vn` hoặc hỏi support

2. **Sửa file hosts:**
   - **Windows:** `C:\Windows\System32\drivers\etc\hosts`
   - **Mac/Linux:** `/etc/hosts`
   
   Thêm:
   ```
   YOUR_SERVER_IP api.websi.vn
   ```

3. **Test:**
   ```
   http://api.websi.vn/api/categories
   ```

## ✅ Checklist

- [ ] Đã giải nén `api-deploy.zip`
- [ ] Đã di chuyển file từ `api/public/` lên `public_html/`
- [ ] Đã sửa `index.php` với path đúng
- [ ] Đã tạo file `.env` với thông tin database đúng
- [ ] Đã cài `composer install` (hoặc upload `vendor/`)
- [ ] Đã chạy `php artisan key:generate`
- [ ] Đã chạy migrations
- [ ] Đã set permissions cho storage
- [ ] Đã kiểm tra `.htaccess`
- [ ] Đã đợi DNS propagate
- [ ] Đã test API endpoint

## 🆘 Troubleshooting

### Lỗi 500 Internal Server Error
- Kiểm tra file `.env` đã tạo chưa
- Kiểm tra `APP_KEY` đã generate chưa
- Kiểm tra permissions của storage
- Xem error log trong cPanel

### Lỗi Database Connection
- Kiểm tra thông tin database trong `.env`
- Kiểm tra database đã được tạo chưa
- Kiểm tra user có quyền truy cập

### Lỗi 404 Not Found
- Kiểm tra `.htaccess` có đúng không
- Kiểm tra Document Root trỏ đúng
- Kiểm tra mod_rewrite đã enable chưa

### DNS vẫn chưa hoạt động
- Đợi thêm thời gian (có thể đến 24h)
- Clear DNS cache: `ipconfig /flushdns` (Windows) hoặc `sudo dscacheutil -flushcache` (Mac)
- Thử dùng DNS khác (8.8.8.8)

## 📝 Lưu ý

- **Composer:** Nếu hosting không có, cần upload `vendor/` từ local
- **PHP Version:** Phải >= 8.1 (kiểm tra trong cPanel)
- **Storage:** Phải có quyền ghi (775)
- **Database:** Phải tạo trước khi chạy migrations

