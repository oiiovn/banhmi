# Hướng dẫn sửa lỗi 404 API trên hosting

## Vấn đề:
URL `https://api.websi.vn/api` trả về **404 NOT FOUND**

## Nguyên nhân có thể:

### 1. API chưa được deploy lên hosting
- API code chưa được upload lên hosting
- Hoặc API chưa được cấu hình đúng

### 2. Cấu hình web server chưa đúng
- Apache/Nginx chưa được cấu hình để route đến Laravel
- File `.htaccess` chưa có hoặc sai

### 3. Đường dẫn API không đúng
- API có thể ở: `https://api.websi.vn/` (không có `/api`)
- Hoặc: `https://websi.vn/api/` (cùng domain)

---

## Cách kiểm tra:

### Bước 1: Kiểm tra API có chạy không

**Qua browser:**
```
https://api.websi.vn/
```
- Nếu thấy Laravel welcome page → API đã chạy
- Nếu 404 → API chưa được deploy

**Qua SSH:**
```bash
cd /path/to/api
php artisan route:list | grep api
```

### Bước 2: Kiểm tra routes API

**Qua SSH:**
```bash
cd /path/to/api
php artisan route:list --path=api
```

Phải thấy các routes như:
- `POST /api/login`
- `POST /api/register`
- `GET /api/categories`
- etc.

### Bước 3: Kiểm tra file `.htaccess`

**File: `api/public/.htaccess`**
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

---

## Cách sửa:

### Cách 1: Nếu API ở subdomain `api.websi.vn`

**Cấu hình domain:**
1. Trong cPanel → **Subdomains**
2. Tạo subdomain: `api.websi.vn`
3. Point đến: `public_html/api/public` (hoặc thư mục chứa Laravel)

**Cấu hình `.htaccess` trong `public_html/api/public/`:**
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^ index.php [L]
</IfModule>
```

### Cách 2: Nếu API ở cùng domain `websi.vn/api`

**Cấu hình:**
1. Upload API vào: `public_html/api/`
2. Cấu hình `.htaccess` trong `public_html/api/public/`
3. Frontend sẽ gọi: `https://websi.vn/api/...`

**Sửa frontend:**
- Thay `https://api.websi.vn/api` → `https://websi.vn/api`

### Cách 3: Kiểm tra cấu hình Laravel

**File: `api/.env`:**
```env
APP_URL=https://api.websi.vn
# hoặc
APP_URL=https://websi.vn
```

**File: `api/routes/api.php`:**
- Đảm bảo routes có prefix `/api`

---

## Kiểm tra sau khi sửa:

1. **Test API endpoint:**
   ```
   https://api.websi.vn/api/test
   ```
   Phải trả về JSON, không phải 404

2. **Test login:**
   ```
   POST https://api.websi.vn/api/login
   ```
   Phải trả về token hoặc error message, không phải 404

3. **Kiểm tra CORS:**
   - Mở Console trên `websi.vn`
   - Xem có lỗi CORS không

---

## Troubleshooting:

### Nếu vẫn 404:

1. **Kiểm tra file structure:**
   ```bash
   ls -la /path/to/api/public/
   # Phải có: index.php, .htaccess
   ```

2. **Kiểm tra quyền file:**
   ```bash
   chmod -R 755 /path/to/api/
   chmod -R 644 /path/to/api/public/.htaccess
   ```

3. **Kiểm tra PHP version:**
   - Laravel cần PHP >= 8.1
   - Kiểm tra trong cPanel → PHP Version

4. **Kiểm tra log:**
   ```bash
   tail -f /path/to/api/storage/logs/laravel.log
   ```

---

## Tóm tắt nhanh:

```bash
# 1. Kiểm tra API có chạy
curl https://api.websi.vn/api/test

# 2. Kiểm tra routes
cd /path/to/api
php artisan route:list --path=api

# 3. Kiểm tra .htaccess
cat public/.htaccess

# 4. Clear cache
php artisan config:clear
php artisan route:clear
php artisan cache:clear
```
