# 🔧 Khôi Phục API Sau Khi Pull Code

## ❌ Vấn đề

**Trước đó API dùng được, sau khi pull code từ Git lại không dùng được.**

## 🔍 Nguyên nhân có thể

Khi pull code từ Git, có thể:
1. **File .htaccess** bị mất (không có trong Git)
2. **Document Root** bị thay đổi
3. **Permissions** bị reset
4. **Route cache** cần clear lại
5. **File .env** bị ghi đè hoặc mất

## ✅ Giải pháp

### Bước 1: Kiểm tra Document Root

**Qua cPanel:**
1. **Vào** cPanel → **Domains** → **api.websi.vn**
2. **Kiểm tra Document Root:**
   - Phải là: `domains/api.websi.vn/api/public`
   - Nếu sai → Sửa lại

### Bước 2: Kiểm tra và tạo .htaccess

**Qua SSH:**

```bash
cd /home/dro94744/domains/api.websi.vn/api/public

# Kiểm tra có .htaccess chưa
ls -la .htaccess

# Nếu chưa có, tạo file
cat > .htaccess << 'EOF'
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

### Bước 3: Kiểm tra file .env

```bash
cd /home/dro94744/domains/api.websi.vn/api

# Kiểm tra có .env chưa
ls -la .env

# Nếu chưa có, copy từ .env.example
if [ ! -f .env ]; then
    cp .env.example .env
    php artisan key:generate
    echo "⚠️  Cần cấu hình .env (database, CORS, ...)"
fi
```

### Bước 4: Set permissions

```bash
cd /home/dro94744/domains/api.websi.vn/api

# Set permissions
chmod -R 755 storage bootstrap/cache
chown -R dro94744:dro94744 storage bootstrap/cache
```

### Bước 5: Clear và cache lại

```bash
cd /home/dro94744/domains/api.websi.vn/api

# Clear tất cả cache
php artisan route:clear
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# Cache lại
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Bước 6: Kiểm tra CORS (nếu có lỗi CORS)

```bash
# Kiểm tra .env
cat .env | grep CORS

# Phải có:
# CORS_ALLOWED_ORIGINS=https://websi.vn,https://api.websi.vn

# Nếu chưa có, thêm vào
echo "CORS_ALLOWED_ORIGINS=https://websi.vn,https://api.websi.vn" >> .env

# Clear config cache
php artisan config:clear
php artisan config:cache
```

### Bước 7: Test

```bash
# Test route
curl https://api.websi.vn/api/test

# Test categories
curl https://api.websi.vn/api/categories
```

## 📋 Checklist

- [ ] Document Root đã đúng: `domains/api.websi.vn/api/public`
- [ ] File `.htaccess` đã có trong `api/public/`
- [ ] File `.env` đã có và cấu hình đúng
- [ ] Permissions đã đúng (755 cho storage, cache)
- [ ] Route cache đã clear và cache lại
- [ ] CORS đã cấu hình đúng
- [ ] Đã test route `/api/test`

## 🆘 Nếu vẫn lỗi

### Kiểm tra log:

```bash
# Xem Laravel log
tail -50 /home/dro94744/domains/api.websi.vn/api/storage/logs/laravel.log

# Xem Apache error log
tail -50 /var/log/apache2/error.log
```

### Kiểm tra cấu trúc:

```bash
cd /home/dro94744/domains/api.websi.vn
ls -la api/public/
# Phải thấy: index.php, .htaccess
```


