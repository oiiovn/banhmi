# 🚀 Hướng dẫn chạy dự án Banhmi Local

## Yêu cầu hệ thống

- PHP >= 8.1
- Composer
- MySQL/MariaDB
- Node.js >= 18
- npm hoặc yarn

## Bước 1: Cấu hình Database

1. Đảm bảo MySQL đã chạy
2. Tạo database:
```bash
mysql -u root -e "CREATE DATABASE banhmi;"
```

3. Cập nhật thông tin database trong `api/.env`:
```
DB_DATABASE=banhmi
DB_USERNAME=root
DB_PASSWORD=your_password
```

## Bước 2: Chạy API Backend (Laravel)

```bash
cd api

# Cài đặt dependencies (nếu chưa có)
composer install

# Tạo file .env (nếu chưa có)
cp .env.example .env
php artisan key:generate

# Chạy migrations
php artisan migrate

# Chạy seeders để tạo admin và đại lý mẫu
php artisan db:seed --class=AdminSeeder

# Chạy server
php artisan serve
```

API sẽ chạy tại: **http://localhost:8000**

## Bước 3: Chạy Web Frontend (Next.js)

Mở terminal mới:

```bash
cd web

# Cài đặt dependencies (nếu chưa có)
npm install

# Tạo file .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# Chạy development server
npm run dev
```

Web sẽ chạy tại: **http://localhost:3000**

## Bước 4: Chạy Mobile App (Flutter) - Tùy chọn

```bash
cd mobile

# Cài đặt dependencies
flutter pub get

# Cập nhật API URL trong lib/providers/product_provider.dart và auth_provider.dart
# Thay đổi: static const String baseUrl = 'http://localhost:8000/api';
# (Lưu ý: trên mobile cần dùng IP thực của máy, không dùng localhost)

# Chạy app
flutter run
```

## Tài khoản mặc định

Sau khi chạy seeder, bạn có thể đăng nhập với:

- **Admin**: 
  - Email: `admin@banhmi.com`
  - Password: `admin123`

- **Đại lý 1**: 
  - Email: `agent1@banhmi.com`
  - Password: `agent123`

- **Đại lý 2**: 
  - Email: `agent2@banhmi.com`
  - Password: `agent123`

## Kiểm tra API hoạt động

Mở trình duyệt hoặc dùng curl:

```bash
# Kiểm tra API
curl http://localhost:8000/api/categories

# Đăng nhập
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@banhmi.com","password":"admin123"}'
```

## Troubleshooting

### Lỗi database connection
- Kiểm tra MySQL đã chạy chưa
- Kiểm tra thông tin database trong `.env`
- Đảm bảo database `banhmi` đã được tạo

### Lỗi CORS
- Kiểm tra file `api/config/cors.php`
- Đảm bảo `allowed_origins` có `http://localhost:3000`

### Lỗi port đã được sử dụng
- Thay đổi port trong lệnh:
  - API: `php artisan serve --port=8001`
  - Web: `npm run dev -- -p 3001`

## Script tự động

Bạn có thể chạy script `start.sh` để tự động setup:

```bash
chmod +x start.sh
./start.sh
```

Sau đó chạy các server trong terminal riêng:
- Terminal 1: `cd api && php artisan serve`
- Terminal 2: `cd web && npm run dev`




