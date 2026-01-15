# 🚀 Hướng Dẫn Deploy Lên websi.vn

## 📋 Tùy chọn cấu hình domain

### Cách 1: Dùng Subdomain (Khuyến nghị) ⭐

**Cấu trúc:**
- **API**: `api.websi.vn`
- **Web**: `websi.vn`

**Ưu điểm:**
- ✅ Tách biệt rõ ràng giữa API và Web
- ✅ Dễ quản lý và scale riêng
- ✅ CORS đơn giản
- ✅ Có thể cache riêng cho API
- ✅ Dễ debug và monitor

**Cấu hình:**

1. **Tạo subdomain trong DNS:**
   ```
   Type: A
   Name: api
   Value: IP của server
   TTL: 3600
   ```

2. **Cấu hình Nginx cho API:**
   ```nginx
   server {
       listen 80;
       server_name api.websi.vn;
       root /path/to/banhmi/api/public;
       
       index index.php;
       
       location / {
           try_files $uri $uri/ /index.php?$query_string;
       }
       
       location ~ \.php$ {
           fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
           fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
           include fastcgi_params;
       }
   }
   ```

3. **Cấu hình Nginx cho Web:**
   ```nginx
   server {
       listen 80;
       server_name websi.vn www.websi.vn;
       root /path/to/banhmi/web/.next;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **File `.env` của API (`api/.env`):**
   ```env
   APP_URL=https://api.websi.vn
   CORS_ALLOWED_ORIGINS=https://websi.vn,https://www.websi.vn
   ```

5. **File `.env.production` của Web (`web/.env.production`):**
   ```env
   NEXT_PUBLIC_API_URL=https://api.websi.vn/api
   NEXT_PUBLIC_IMAGE_DOMAINS=api.websi.vn,websi.vn
   ```

---

### Cách 2: Dùng cùng domain với path

**Cấu trúc:**
- **API**: `websi.vn/api`
- **Web**: `websi.vn`

**Ưu điểm:**
- ✅ Không cần tạo subdomain
- ✅ Đơn giản hơn

**Nhược điểm:**
- ❌ Khó scale riêng
- ❌ CORS phức tạp hơn

**Cấu hình:**

1. **Cấu hình Nginx:**
   ```nginx
   server {
       listen 80;
       server_name websi.vn www.websi.vn;
       
       # API routes
       location /api {
           root /path/to/banhmi/api/public;
           try_files $uri $uri/ /index.php?$query_string;
           
           location ~ \.php$ {
               fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
               fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
               include fastcgi_params;
           }
       }
       
       # Web routes
       location / {
           root /path/to/banhmi/web/.next;
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

2. **File `.env` của API (`api/.env`):**
   ```env
   APP_URL=https://websi.vn
   CORS_ALLOWED_ORIGINS=https://websi.vn,https://www.websi.vn
   ```

3. **File `.env.production` của Web (`web/.env.production`):**
   ```env
   NEXT_PUBLIC_API_URL=https://websi.vn/api
   NEXT_PUBLIC_IMAGE_DOMAINS=websi.vn
   ```

---

## 🔧 Các bước deploy

### Bước 1: Chuẩn bị trên server

```bash
# Tạo thư mục
mkdir -p /var/www/banhmi
cd /var/www/banhmi

# Upload code (hoặc clone từ git)
# Nén code và upload lên server, sau đó giải nén
```

### Bước 2: Setup API Backend

```bash
cd api

# Cài dependencies
composer install --optimize-autoloader --no-dev

# Tạo file .env
cp .env.example .env

# Sửa .env với thông tin thực:
# - APP_URL (tùy chọn domain bạn chọn)
# - CORS_ALLOWED_ORIGINS
# - DB_* (thông tin database)

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
chown -R www-data:www-data storage bootstrap/cache
```

### Bước 3: Setup Web Frontend

```bash
cd web

# Cài dependencies
npm install

# Tạo file .env.production
# (Nội dung tùy theo cách bạn chọn ở trên)

# Build production
npm run build

# Chạy production server
npm start
# HOẶC dùng PM2 để chạy background:
pm2 start npm --name "banhmi-web" -- start
```

### Bước 4: Cài đặt SSL (Let's Encrypt)

```bash
# Cài certbot
sudo apt install certbot python3-certbot-nginx

# Cài SSL cho cả 2 domain (nếu dùng subdomain)
sudo certbot --nginx -d websi.vn -d www.websi.vn -d api.websi.vn

# HOẶC chỉ cho domain chính (nếu dùng cùng domain)
sudo certbot --nginx -d websi.vn -d www.websi.vn
```

### Bước 5: Kiểm tra

```bash
# Test API
curl https://api.websi.vn/api/categories
# HOẶC
curl https://websi.vn/api/categories

# Test Web
# Truy cập: https://websi.vn
```

---

## 📝 Checklist sau khi deploy

- [ ] Đã tạo subdomain `api.websi.vn` trong DNS (nếu dùng cách 1)
- [ ] Đã cấu hình Nginx cho cả API và Web
- [ ] Đã cài SSL certificate
- [ ] Đã cấu hình `.env` cho API với đúng domain
- [ ] Đã cấu hình `.env.production` cho Web với đúng API URL
- [ ] Đã chạy migrations
- [ ] Đã set permissions cho storage
- [ ] Đã test API endpoint
- [ ] Đã test Web frontend
- [ ] Đã test đăng nhập/đăng ký
- [ ] Đã kiểm tra CORS hoạt động đúng

---

## 🎯 Khuyến nghị

**Nên dùng Cách 1 (Subdomain)** vì:
1. Dễ quản lý và maintain
2. Có thể scale API và Web riêng biệt
3. Dễ debug khi có vấn đề
4. CORS đơn giản hơn
5. Có thể cache riêng cho API

**Lưu ý:**
- Đảm bảo DNS đã propagate (có thể mất vài phút đến vài giờ)
- Kiểm tra firewall cho phép port 80 và 443
- Đảm bảo PHP-FPM đang chạy
- Đảm bảo Node.js process đang chạy (nếu dùng PM2)

---

## 🆘 Troubleshooting

### Lỗi CORS
- Kiểm tra `CORS_ALLOWED_ORIGINS` trong `.env` đã đúng chưa
- Kiểm tra `api/config/cors.php` đã đọc từ env chưa
- Clear cache: `php artisan config:clear`

### Lỗi 502 Bad Gateway
- Kiểm tra PHP-FPM đang chạy: `sudo systemctl status php8.1-fpm`
- Kiểm tra Node.js đang chạy: `pm2 list`
- Kiểm tra Nginx error log: `sudo tail -f /var/log/nginx/error.log`

### Lỗi Database Connection
- Kiểm tra thông tin database trong `.env`
- Kiểm tra MySQL đang chạy: `sudo systemctl status mysql`
- Kiểm tra user có quyền truy cập database


