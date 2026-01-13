# 🔧 Khắc Phục Lỗi DNS và Test API

## ❌ Lỗi hiện tại: `DNS_PROBE_FINISHED_NXDOMAIN`

Lỗi này có nghĩa là DNS chưa được cấu hình cho subdomain `api.websi.vn`.

## 🔍 Các bước khắc phục

### Bước 1: Kiểm tra DNS trong cPanel/hosting

1. **Vào cPanel/DNS Management**
2. **Tìm phần "Subdomains" hoặc "DNS Zone Editor"**
3. **Kiểm tra xem đã tạo subdomain `api.websi.vn` chưa**

### Bước 2: Tạo subdomain (nếu chưa có)

**Trong cPanel:**
1. Vào **Subdomains**
2. Tạo subdomain: `api`
3. Document Root: `domains/api.websi.vn/public_html`
4. Click **Create**

**Hoặc trong DNS Zone Editor:**
1. Thêm record mới:
   - **Type:** A
   - **Name:** api
   - **Value:** IP của server (cùng IP với websi.vn)
   - **TTL:** 3600

### Bước 3: Giải nén và setup code

Từ hình ảnh, tôi thấy bạn đã upload `api-deploy.zip` vào `public_html`. Bây giờ cần:

#### 3.1. Giải nén file zip

1. **Chọn file `api-deploy.zip`**
2. **Click "Extract" hoặc "Archive" → "Extract"**
3. **Giải nén vào thư mục hiện tại**

Sau khi giải nén, bạn sẽ có:
```
public_html/
├── api/              ← Thư mục api đã giải nén
├── api-deploy.zip
├── cgi-bin/
├── .htaccess
└── index.html
```

#### 3.2. Di chuyển nội dung từ `api/public/` lên `public_html/`

**Cách 1: Qua File Manager**
1. Vào thư mục `api/public/`
2. Chọn tất cả file (Ctrl+A hoặc Cmd+A)
3. Click **Move**
4. Di chuyển lên `public_html/`
5. Xác nhận

**Cách 2: Qua SSH (nếu có quyền)**
```bash
cd domains/api.websi.vn/public_html
cp -r api/public/* .
```

#### 3.3. Sửa file `public_html/index.php`

Mở file `index.php` và sửa các path:

**Tìm:**
```php
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
```

**Sửa thành:**
```php
if (file_exists($maintenance = __DIR__.'/../api/storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../api/vendor/autoload.php';

$app = require_once __DIR__.'/../api/bootstrap/app.php';
```

### Bước 4: Tạo file `.env`

1. **Tạo file mới** trong `public_html/api/` (hoặc `domains/api.websi.vn/api/`)
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

**Lưu ý:** Thay thế thông tin database bằng thông tin thực của bạn.

### Bước 5: Cài dependencies (Qua SSH hoặc Terminal)

Nếu hosting có SSH:

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

# Cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Permissions
chmod -R 775 storage bootstrap/cache
```

**Nếu không có SSH:**
- Upload thư mục `vendor/` từ local (sau khi chạy `composer install` trên máy local)
- Hoặc liên hệ support hosting để họ cài giúp

### Bước 6: Đợi DNS propagate

Sau khi tạo subdomain:
- **Thường mất:** 5-30 phút
- **Có thể mất:** 1-24 giờ (hiếm)
- **Kiểm tra:** https://www.whatsmydns.net/#A/api.websi.vn

### Bước 7: Test API

Sau khi DNS đã propagate:

```bash
# Test endpoint
curl https://api.websi.vn/api/categories

# Hoặc truy cập trong browser:
# https://api.websi.vn/api/categories
```

## 🧪 Test tạm thời bằng IP (nếu có)

Nếu bạn biết IP của server, có thể test tạm thời:

1. **Tìm IP server:**
   ```bash
   ping websi.vn
   # Hoặc hỏi support hosting
   ```

2. **Sửa file hosts trên máy local:**
   - **Windows:** `C:\Windows\System32\drivers\etc\hosts`
   - **Mac/Linux:** `/etc/hosts`
   
   Thêm dòng:
   ```
   YOUR_SERVER_IP api.websi.vn
   ```

3. **Test:**
   ```
   http://api.websi.vn/api/categories
   ```

## ✅ Checklist

- [ ] Đã tạo subdomain `api.websi.vn` trong cPanel
- [ ] Đã giải nén `api-deploy.zip`
- [ ] Đã di chuyển nội dung `api/public/` lên `public_html/`
- [ ] Đã sửa `index.php` với path đúng
- [ ] Đã tạo file `.env` với thông tin đúng
- [ ] Đã cài `composer install` (hoặc upload `vendor/`)
- [ ] Đã chạy `php artisan key:generate`
- [ ] Đã chạy migrations
- [ ] Đã đợi DNS propagate (5-30 phút)
- [ ] Đã test API endpoint

## 🆘 Nếu vẫn không được

1. **Kiểm tra Document Root:**
   - Đảm bảo Document Root của subdomain trỏ đến `public_html/`

2. **Kiểm tra .htaccess:**
   - File `.htaccess` trong `public_html/` phải có nội dung Laravel

3. **Kiểm tra PHP version:**
   - Phải >= 8.1
   - Có thể set trong cPanel hoặc `.htaccess`

4. **Liên hệ support hosting:**
   - Họ có thể giúp kiểm tra DNS và cấu hình

## 📝 Lưu ý

- **DNS propagation** có thể mất thời gian
- **Composer** có thể không có trên shared hosting
- **Storage permissions** phải đúng (775)
- **Database** phải được tạo trước

