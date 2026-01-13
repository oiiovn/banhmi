# 📤 Hướng Dẫn Upload API Lên api.websi.vn

## ✅ Đúng rồi - Chỉ cần thư mục `api/`

Khi dùng subdomain `api.websi.vn`, bạn chỉ cần upload thư mục `api/` lên server.

## 📁 Cấu trúc trên hosting

Dựa vào hình ảnh, bạn đang ở:
```
domains/
└── api.websi.vn/
    └── public_html/  ← Đây là thư mục hiện tại
```

## 🎯 Cách upload đúng

### Cách 1: Upload toàn bộ thư mục `api/` (Khuyến nghị)

**Cấu trúc sau khi upload:**
```
domains/
└── api.websi.vn/
    ├── app/
    ├── bootstrap/
    ├── config/
    ├── database/
    ├── public/          ← Nội dung này sẽ trỏ đến public_html
    ├── routes/
    ├── storage/
    ├── vendor/
    ├── artisan
    ├── composer.json
    └── .env
```

**Sau đó cần:**
1. Di chuyển nội dung từ `public/` lên `public_html/`
2. Hoặc tạo symlink: `public_html` → `public/`
3. Hoặc cấu hình Document Root trỏ đến `public/`

### Cách 2: Upload và chỉnh lại cấu trúc (Đơn giản hơn)

**Bước 1: Upload toàn bộ `api/` lên**
```
domains/
└── api.websi.vn/
    └── api/              ← Upload toàn bộ thư mục api/ vào đây
        ├── app/
        ├── bootstrap/
        ├── config/
        ├── database/
        ├── public/
        ├── routes/
        ├── storage/
        ├── vendor/
        ├── artisan
        ├── composer.json
        └── .env
```

**Bước 2: Di chuyển nội dung `public/` lên `public_html/`**
```bash
# Trong file manager hoặc SSH:
# Copy tất cả file từ api/public/ lên public_html/
cp -r api/public/* public_html/
```

**Bước 3: Sửa file `public_html/index.php`**
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

## 📋 Checklist upload

### Trước khi upload:

- [ ] Loại bỏ `api/vendor/` (sẽ cài lại trên server)
- [ ] Loại bỏ `api/node_modules/` (nếu có)
- [ ] Loại bỏ `api/.env` (tạo mới trên server)
- [ ] Loại bỏ `api/storage/logs/*.log`
- [ ] Giữ lại tất cả file code khác

### Sau khi upload:

- [ ] Upload toàn bộ thư mục `api/` lên `domains/api.websi.vn/`
- [ ] Di chuyển nội dung `api/public/` lên `public_html/`
- [ ] Sửa `public_html/index.php` (như trên)
- [ ] Tạo file `.env` trong `api/`
- [ ] Cài dependencies: `composer install --optimize-autoloader --no-dev`
- [ ] Chạy migrations: `php artisan migrate --force`
- [ ] Tạo storage link: `php artisan storage:link`
- [ ] Set permissions: `chmod -R 775 api/storage api/bootstrap/cache`

## 🔧 Cấu hình .env trên server

Tạo file `.env` trong `domains/api.websi.vn/api/.env`:

```env
APP_NAME=Banhmi
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.websi.vn

# Database
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

# CORS
CORS_ALLOWED_ORIGINS=https://websi.vn,https://www.websi.vn

# Session
SESSION_DRIVER=file
SESSION_LIFETIME=120

# Cache
CACHE_DRIVER=file
```

## 🚀 Các lệnh cần chạy trên server

### Qua SSH hoặc Terminal trong file manager:

```bash
cd domains/api.websi.vn/api

# Cài dependencies
composer install --optimize-autoloader --no-dev

# Generate key
php artisan key:generate

# Chạy migrations
php artisan migrate --force

# Tạo storage link
php artisan storage:link

# Cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
chmod -R 775 storage bootstrap/cache
```

## ⚠️ Lưu ý quan trọng

1. **Document Root:**
   - Đảm bảo Document Root của subdomain `api.websi.vn` trỏ đến `public_html/`
   - Hoặc trỏ trực tiếp đến `api/public/` (nếu hosting cho phép)

2. **PHP Version:**
   - Đảm bảo PHP >= 8.1
   - Kiểm tra trong cPanel hoặc file `.htaccess`

3. **Storage:**
   - Thư mục `storage/` phải có quyền ghi
   - Chạy `php artisan storage:link` để tạo symlink

4. **Composer:**
   - Nếu hosting không có Composer, cần upload `vendor/` từ local
   - Hoặc dùng Composer qua SSH

## 🧪 Kiểm tra sau khi upload

```bash
# Test API
curl https://api.websi.vn/api/categories

# Hoặc truy cập trong browser:
# https://api.websi.vn/api/categories
```

## 📝 Tóm tắt

✅ **Đúng - Chỉ cần thư mục `api/`**

**Các bước:**
1. Upload thư mục `api/` lên `domains/api.websi.vn/`
2. Di chuyển nội dung `api/public/` lên `public_html/`
3. Sửa `public_html/index.php` để trỏ đúng path
4. Tạo `.env` và cấu hình
5. Chạy `composer install` và các lệnh Laravel

**Lưu ý:** Nếu hosting không cho phép SSH, bạn có thể:
- Upload `vendor/` từ local (sau khi chạy `composer install` trên máy local)
- Dùng file manager để tạo `.env` và sửa file

