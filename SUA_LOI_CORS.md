# 🔧 Sửa Lỗi CORS - API Không Cho Phép Request Từ websi.vn

## ❌ Vấn đề

Console hiển thị:
- `Access to XMLHttpRequest at 'https://api.websi.vn/api/login' from origin 'https://websi.vn' has been blocked by CORS policy`
- `Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present`

**Nguyên nhân:** API server chưa cho phép request từ `https://websi.vn`

## ✅ Giải pháp: Sửa cấu hình CORS trên API server

### Bước 1: Kiểm tra file CORS config

**File:** `api/config/cors.php`

**Cần có:**
```php
'allowed_origins' => array_filter(explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:3001,http://localhost:3002'))),
```

### Bước 2: Sửa file .env trên API server

**Qua File Manager hoặc SSH:**
1. Vào thư mục API (thường là `domains/api.websi.vn/` hoặc tương tự)
2. Mở file `.env`
3. Tìm dòng `CORS_ALLOWED_ORIGINS`
4. Sửa thành:

```env
CORS_ALLOWED_ORIGINS=https://websi.vn,http://localhost:3000,http://localhost:3001
```

**Hoặc nếu chưa có, thêm dòng:**
```env
CORS_ALLOWED_ORIGINS=https://websi.vn,http://localhost:3000,http://localhost:3001
```

### Bước 3: Clear cache Laravel

**Qua SSH (nếu có):**
```bash
cd domains/api.websi.vn
php artisan config:cache
php artisan route:cache
```

**Hoặc qua cPanel Terminal:**
- Vào Terminal trong cPanel
- Chạy các lệnh trên

**Nếu không có SSH:**
- Có thể cần liên hệ support hosting để clear cache
- Hoặc đợi một vài phút để cache tự động clear

### Bước 4: Kiểm tra lại

1. **Test API trực tiếp:**
   - Truy cập: `https://api.websi.vn/api/categories`
   - Phải trả về JSON (không phải lỗi CORS)

2. **Test từ website:**
   - Mở `websi.vn/login`
   - Mở Console (F12)
   - Thử đăng nhập
   - Xem còn lỗi CORS không

## 🔍 Kiểm tra CORS config

### Cách 1: Kiểm tra file .env

**Trong API server:**
- File `.env` phải có: `CORS_ALLOWED_ORIGINS=https://websi.vn,...`
- Không có khoảng trắng thừa
- URL phải đúng format (có `https://`)

### Cách 2: Test bằng curl

**Qua SSH hoặc Terminal:**
```bash
curl -H "Origin: https://websi.vn" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://api.websi.vn/api/login \
     -v
```

**Kết quả mong đợi:**
- Phải có header: `Access-Control-Allow-Origin: https://websi.vn`
- Status: `200 OK` hoặc `204 No Content`

## 🆘 Nếu vẫn lỗi

### Kiểm tra 1: File .env đã sửa chưa?

- Xem file `.env` trên API server
- Đảm bảo có `CORS_ALLOWED_ORIGINS=https://websi.vn`

### Kiểm tra 2: Cache đã clear chưa?

- Chạy `php artisan config:cache`
- Hoặc xóa file `bootstrap/cache/config.php` (nếu có)

### Kiểm tra 3: CORS config đúng chưa?

- Xem file `api/config/cors.php`
- Đảm bảo đọc từ environment variable

### Kiểm tra 4: Web server config

**Nếu dùng Nginx/Apache:**
- Có thể cần thêm CORS headers trong web server config
- Nhưng thường Laravel đã xử lý

## 📋 Checklist

- [ ] Đã sửa file `.env` trên API server: `CORS_ALLOWED_ORIGINS=https://websi.vn`
- [ ] Đã clear cache Laravel: `php artisan config:cache`
- [ ] Đã test API: `https://api.websi.vn/api/categories` hoạt động
- [ ] Đã test từ website: Không còn lỗi CORS

## ✅ Kết quả mong đợi

Sau khi sửa:
- Request từ `https://websi.vn` được phép
- Không còn lỗi CORS trong Console
- Đăng nhập hoạt động bình thường

