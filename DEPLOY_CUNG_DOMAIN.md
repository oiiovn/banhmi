# 🚀 Deploy Cùng Domain (websi.vn/api và websi.vn)

## ✅ Code hiện tại HOÀN TOÀN phù hợp

Code của bạn đã được thiết kế linh hoạt:
- ✅ API URL đọc từ biến môi trường `NEXT_PUBLIC_API_URL`
- ✅ CORS đọc từ biến môi trường `CORS_ALLOWED_ORIGINS`
- ✅ Không hardcode domain nào
- ✅ Có thể dùng subdomain HOẶC cùng domain

## 📋 Cấu trúc khi deploy cùng domain

```
websi.vn/
├── /api/*          → Laravel API (api/public/)
└── /*               → Next.js Web (web/.next/)
```

## 🔧 Cấu hình Nginx cho cùng domain

```nginx
server {
    listen 80;
    server_name websi.vn www.websi.vn;
    
    # API routes - Laravel
    location /api {
        alias /var/www/banhmi/api/public;
        try_files $uri $uri/ @api;
        
        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
            fastcgi_param SCRIPT_FILENAME $request_filename;
            fastcgi_param PATH_INFO $fastcgi_path_info;
            include fastcgi_params;
        }
    }
    
    location @api {
        rewrite ^/api/(.*)$ /api/index.php?$query_string last;
    }
    
    # Web routes - Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files từ Laravel storage
    location /storage {
        alias /var/www/banhmi/api/storage/app/public;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

## 📝 Cấu hình .env

### API (`api/.env`):
```env
APP_NAME=Banhmi
APP_ENV=production
APP_DEBUG=false
APP_URL=https://websi.vn

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=banhmi
DB_USERNAME=your_user
DB_PASSWORD=your_password

# CORS - Cho phép domain chính
CORS_ALLOWED_ORIGINS=https://websi.vn,https://www.websi.vn
```

### Web (`web/.env.production`):
```env
NEXT_PUBLIC_API_URL=https://websi.vn/api
NEXT_PUBLIC_IMAGE_DOMAINS=websi.vn
```

## 🚀 Các bước deploy

### Bước 1: Upload code lên server

```bash
# Tạo thư mục
mkdir -p /var/www/banhmi
cd /var/www/banhmi

# Upload và giải nén code
# (Loại bỏ vendor/, node_modules/, .next/ trước khi nén)
```

### Bước 2: Setup API

```bash
cd /var/www/banhmi/api

# Cài dependencies
composer install --optimize-autoloader --no-dev

# Tạo .env (như trên)

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
chown -R www-data:www-data storage bootstrap/cache
```

### Bước 3: Setup Web

```bash
cd /var/www/banhmi/web

# Cài dependencies
npm install

# Tạo .env.production (như trên)

# Build
npm run build

# Chạy production (hoặc dùng PM2)
npm start
# HOẶC
pm2 start npm --name "banhmi-web" -- start
```

### Bước 4: Cấu hình Nginx

1. Tạo file config:
```bash
sudo nano /etc/nginx/sites-available/websi.vn
```

2. Copy config Nginx ở trên vào

3. Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/websi.vn /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Bước 5: Cài SSL

```bash
sudo certbot --nginx -d websi.vn -d www.websi.vn
```

## ✅ Ưu điểm khi dùng cùng domain

1. **Không cần tạo subdomain** - Đơn giản hơn
2. **Cùng SSL certificate** - Dễ quản lý
3. **Không cần cấu hình DNS thêm** - Tiết kiệm thời gian
4. **Code đã sẵn sàng** - Không cần sửa code

## ⚠️ Lưu ý

1. **Laravel routes phải có prefix `/api`**
   - ✅ Đã có sẵn trong `routes/api.php`
   - Tất cả routes đã có prefix `/api`

2. **CORS phải cho phép domain chính**
   - ✅ Đã cấu hình qua `CORS_ALLOWED_ORIGINS`

3. **Storage link**
   - Phải chạy `php artisan storage:link`
   - Files sẽ truy cập qua `websi.vn/storage/...`

4. **Next.js phải chạy trên port khác**
   - Không được dùng port 80/443 (Nginx đã dùng)
   - Dùng port 3000 và proxy qua Nginx

## 🧪 Kiểm tra sau khi deploy

```bash
# Test API
curl https://websi.vn/api/categories

# Test Web
curl https://websi.vn

# Test Storage
curl https://websi.vn/storage/...
```

## 🆘 Troubleshooting

### Lỗi 404 khi truy cập /api/*
- Kiểm tra Nginx config có đúng path không
- Kiểm tra `alias` trỏ đúng đến `api/public`
- Kiểm tra PHP-FPM đang chạy

### Lỗi CORS
- Kiểm tra `CORS_ALLOWED_ORIGINS` trong `.env`
- Clear cache: `php artisan config:clear`

### Lỗi 502 Bad Gateway
- Kiểm tra Next.js đang chạy: `pm2 list`
- Kiểm tra port 3000 không bị chiếm

### Storage không hiển thị
- Kiểm tra đã chạy `php artisan storage:link`
- Kiểm tra permissions: `chmod -R 775 storage`

## 📊 So sánh 2 cách

| Tiêu chí | Cùng domain | Subdomain |
|----------|-------------|-----------|
| Độ phức tạp | ⭐⭐ Đơn giản | ⭐⭐⭐ Phức tạp hơn |
| Cần DNS | ❌ Không | ✅ Có |
| Scale riêng | ❌ Khó | ✅ Dễ |
| CORS | ⚠️ Cần cấu hình | ✅ Đơn giản |
| SSL | ✅ 1 certificate | ⚠️ Nhiều certificate |
| Code | ✅ Không cần sửa | ✅ Không cần sửa |

## 🎯 Kết luận

**Code của bạn HOÀN TOÀN phù hợp với cả 2 cách!**

- ✅ Không cần sửa code
- ✅ Chỉ cần cấu hình `.env` và Nginx
- ✅ Có thể chuyển đổi dễ dàng giữa 2 cách

**Khuyến nghị:**
- Nếu mới bắt đầu → Dùng **cùng domain** (đơn giản hơn)
- Nếu cần scale sau này → Có thể chuyển sang **subdomain** (không cần sửa code)

