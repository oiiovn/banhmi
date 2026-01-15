# ✅ Checklist Sau Khi Upload API Lên Subdomain

## 🎯 Tình trạng hiện tại

✅ Subdomain `api.websi.vn` đã được tạo  
✅ Code API đã được upload  
⏳ Cần kiểm tra và setup

## 📋 Checklist các bước

### Bước 1: Kiểm tra cấu trúc file

**Kiểm tra trong File Manager:**
```
domains/api.websi.vn/
├── public_html/
│   ├── index.php          ← Phải có
│   ├── .htaccess          ← Phải có
│   └── ... (các file khác)
└── api/                    ← Thư mục gốc Laravel
    ├── app/
    ├── bootstrap/
    ├── config/
    ├── database/
    ├── routes/
    ├── storage/
    ├── vendor/             ← Phải có (hoặc sẽ cài)
    ├── artisan
    ├── composer.json
    └── .env                ← Phải tạo
```

### Bước 2: Kiểm tra file `.env`

**Vị trí:** `domains/api.websi.vn/api/.env`

**Nội dung cần có:**
```env
APP_NAME=Banhmi
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.websi.vn

# Database
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

# CORS
CORS_ALLOWED_ORIGINS=https://websi.vn,https://www.websi.vn

# Session
SESSION_DRIVER=file
SESSION_LIFETIME=120

# Cache
CACHE_DRIVER=file
```

**⚠️ Quan trọng:**
- Thay `your_database_name`, `your_database_user`, `your_database_password` bằng thông tin thực
- Đảm bảo database đã được tạo trong cPanel

### Bước 3: Kiểm tra file `index.php`

**Vị trí:** `domains/api.websi.vn/public_html/index.php`

**Phải có các path đúng:**
```php
<?php
// ...
if (file_exists($maintenance = __DIR__.'/../api/storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../api/vendor/autoload.php';

$app = require_once __DIR__.'/../api/bootstrap/app.php';
// ...
```

**Kiểm tra:**
- [ ] Path `__DIR__.'/../api/` đúng với cấu trúc thư mục
- [ ] File không có lỗi syntax

### Bước 4: Kiểm tra file `.htaccess`

**Vị trí:** `domains/api.websi.vn/public_html/.htaccess`

**Nội dung phải có:**
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

### Bước 5: Cài dependencies (nếu chưa có vendor/)

**Nếu có SSH:**
```bash
cd /domains/api.websi.vn/api
composer install --optimize-autoloader --no-dev
```

**Nếu không có SSH:**
1. Trên máy local:
   ```bash
   cd api
   composer install --optimize-autoloader --no-dev
   ```
2. Nén thư mục `vendor/`:
   ```bash
   zip -r vendor.zip vendor/
   ```
3. Upload `vendor.zip` lên server
4. Giải nén vào `domains/api.websi.vn/api/vendor/`

### Bước 6: Generate APP_KEY

**Nếu có SSH:**
```bash
cd /domains/api.websi.vn/api
php artisan key:generate
```

**Nếu không có SSH:**
- Tạo key trên local và copy vào `.env`:
  ```bash
  cd api
  php artisan key:generate
  # Copy APP_KEY từ .env
  ```

### Bước 7: Chạy migrations

**Nếu có SSH:**
```bash
cd /domains/api.websi.vn/api
php artisan migrate --force
```

**Nếu không có SSH:**
- Có thể chạy qua cPanel Terminal (nếu có)
- Hoặc import database trực tiếp qua phpMyAdmin

### Bước 8: Tạo storage link

**Nếu có SSH:**
```bash
cd /domains/api.websi.vn/api
php artisan storage:link
```

**Nếu không có SSH:**
- Tạo symlink thủ công trong File Manager
- Hoặc copy thư mục `storage/app/public` lên `public_html/storage`

### Bước 9: Set permissions

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

### Bước 10: Cache config

**Nếu có SSH:**
```bash
cd /domains/api.websi.vn/api
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 🧪 Test API

### Test 1: Kiểm tra API có hoạt động

**Truy cập trong browser:**
```
https://api.websi.vn/api/categories
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "data": [...]
}
```

**Nếu lỗi:**
- ❌ 500 Internal Server Error → Xem phần Troubleshooting
- ❌ 404 Not Found → Kiểm tra `.htaccess` và routes
- ❌ DNS Error → Đợi DNS propagate

### Test 2: Test đăng nhập

**Truy cập:**
```
https://api.websi.vn/api/login
```

**Method:** POST  
**Body:**
```json
{
  "email": "admin@banhmi.com",
  "password": "admin123"
}
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "..."
  }
}
```

### Test 3: Kiểm tra CORS

**Mở browser console trên `websi.vn`:**
1. F12 → Console
2. Gõ:
```javascript
fetch('https://api.websi.vn/api/categories')
  .then(r => r.json())
  .then(console.log)
```

**Nếu lỗi CORS:**
- Kiểm tra `api/config/cors.php`
- Kiểm tra `CORS_ALLOWED_ORIGINS` trong `.env`

## 🔧 Cấu hình Web để kết nối API

### Bước 1: Tạo file `.env.production`

**Vị trí:** `web/.env.production`

**Nội dung:**
```env
NEXT_PUBLIC_API_URL=https://api.websi.vn/api
NEXT_PUBLIC_IMAGE_DOMAINS=api.websi.vn,websi.vn
```

### Bước 2: Rebuild Web (nếu cần)

```bash
cd web
npm run build
npm start
```

## 🆘 Troubleshooting

### Lỗi 500 Internal Server Error

**Nguyên nhân:**
- File `.env` chưa có hoặc sai
- APP_KEY chưa generate
- Permissions sai
- PHP version không đúng

**Giải pháp:**
1. Kiểm tra file `.env` đã tạo chưa
2. Kiểm tra `APP_KEY` đã có chưa
3. Kiểm tra permissions: `chmod -R 775 storage`
4. Kiểm tra PHP version: >= 8.1

### Lỗi 404 Not Found

**Nguyên nhân:**
- `.htaccess` chưa có hoặc sai
- mod_rewrite chưa enable
- Document Root sai

**Giải pháp:**
1. Kiểm tra file `.htaccess` có đúng không
2. Kiểm tra mod_rewrite đã enable chưa
3. Kiểm tra Document Root trỏ đến `public_html/`

### Lỗi Database Connection

**Nguyên nhân:**
- Thông tin database sai
- Database chưa được tạo
- User không có quyền

**Giải pháp:**
1. Kiểm tra thông tin trong `.env`
2. Tạo database trong cPanel
3. Tạo user và gán quyền

### Lỗi CORS

**Nguyên nhân:**
- CORS chưa cấu hình
- Domain chưa được thêm vào allowed_origins

**Giải pháp:**
1. Kiểm tra `api/config/cors.php`
2. Kiểm tra `CORS_ALLOWED_ORIGINS` trong `.env`
3. Clear cache: `php artisan config:clear`

## ✅ Checklist cuối cùng

- [ ] File `.env` đã tạo với thông tin đúng
- [ ] File `index.php` có path đúng
- [ ] File `.htaccess` có đúng nội dung
- [ ] Thư mục `vendor/` đã có (hoặc đã cài)
- [ ] APP_KEY đã generate
- [ ] Migrations đã chạy
- [ ] Storage link đã tạo
- [ ] Permissions đã set (775)
- [ ] Config đã cache
- [ ] API test thành công: `https://api.websi.vn/api/categories`
- [ ] Web đã cấu hình API URL
- [ ] CORS đã cấu hình đúng

## 📝 Lưu ý

- **Composer:** Nếu hosting không có, cần upload `vendor/` từ local
- **PHP Version:** Phải >= 8.1
- **Database:** Phải tạo trước khi chạy migrations
- **DNS:** Có thể mất 5-30 phút để propagate


