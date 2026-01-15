# 🔧 Giải Quyết Lỗi 404 API

## ❌ Lỗi

```
404 Not Found
The resource requested could not be found on this server!
```

**URL:** `https://api.websi.vn`

## 🔍 Nguyên nhân

Lỗi 404 thường do:
1. **Document Root** chưa trỏ đúng đến `api/public/`
2. **File .htaccess** chưa có hoặc sai
3. **Cấu trúc thư mục** không đúng

## ✅ Giải pháp

### Bước 1: Kiểm tra Document Root

**Qua cPanel:**

1. **Vào** cPanel → **Domains** → **api.websi.vn**
2. **Kiểm tra Document Root:**
   - Phải trỏ đến: `/home/dro94744/domains/api.websi.vn/api/public`
   - KHÔNG phải: `/home/dro94744/domains/api.websi.vn`
   - KHÔNG phải: `/home/dro94744/domains/api.websi.vn/public_html`

**Nếu sai, sửa:**
- Click "Change" hoặc "Edit"
- Sửa thành: `domains/api.websi.vn/api/public`
- Save

### Bước 2: Kiểm tra cấu trúc thư mục

**Qua SSH:**

```bash
# Kiểm tra cấu trúc
cd /home/dro94744/domains/api.websi.vn
ls -la

# Phải thấy:
# - api/
# - deploy-webhook-v2.sh
# - deploy-webhook.php

# Kiểm tra api/public/
ls -la api/public/

# Phải thấy:
# - index.php
# - .htaccess
```

### Bước 3: Kiểm tra file .htaccess

**Qua SSH:**

```bash
# Kiểm tra có .htaccess chưa
ls -la api/public/.htaccess

# Nếu chưa có, tạo file
cat > api/public/.htaccess << 'EOF'
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
EOF
```

### Bước 4: Kiểm tra file index.php

**Qua SSH:**

```bash
# Kiểm tra index.php
cat api/public/index.php | head -20

# Phải thấy:
# require __DIR__.'/../vendor/autoload.php';
# $app = require_once __DIR__.'/../bootstrap/app.php';
```

### Bước 5: Kiểm tra permissions

```bash
# Set permissions
chmod -R 755 api/storage
chmod -R 755 api/bootstrap/cache
chown -R dro94744:dro94744 api/storage api/bootstrap/cache
```

### Bước 6: Test lại

```bash
# Test route
curl https://api.websi.vn/api/test

# Hoặc test route cơ bản
curl https://api.websi.vn/api/categories
```

## 🔍 Kiểm tra chi tiết

### Kiểm tra Document Root qua SSH:

```bash
# Xem Document Root hiện tại
grep -r "DocumentRoot" /etc/apache2/sites-enabled/ 2>/dev/null
# Hoặc
grep -r "DocumentRoot" /etc/httpd/conf.d/ 2>/dev/null
```

### Kiểm tra qua cPanel:

1. **Vào** cPanel → **Domains** → **api.websi.vn**
2. **Xem** Document Root
3. **Sửa** nếu cần

## 📋 Checklist

- [ ] Document Root trỏ đến `domains/api.websi.vn/api/public`
- [ ] File `api/public/.htaccess` tồn tại
- [ ] File `api/public/index.php` tồn tại
- [ ] Permissions đúng (755 cho storage, cache)
- [ ] Đã test lại route

## 🆘 Nếu vẫn lỗi

### Kiểm tra log:

```bash
# Xem error log
tail -50 /home/dro94744/domains/api.websi.vn/api/storage/logs/laravel.log

# Hoặc Apache error log
tail -50 /var/log/apache2/error.log
```

### Test trực tiếp:

```bash
# Test index.php
curl https://api.websi.vn/index.php

# Test route với index.php
curl https://api.websi.vn/index.php/api/test
```


