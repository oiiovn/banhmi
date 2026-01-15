# 🌐 Hướng dẫn deploy lên hosting Mắt Bão

## 📋 Thông tin cần biết

Trên hosting Mắt Bão, thường có cấu trúc:
- **Web**: Upload vào `public_html/` hoặc `domains/yourdomain.com/public_html/`
- **API**: Có thể ở subdomain `api.yourdomain.com` hoặc cùng domain `yourdomain.com/api`

## 🚀 Các bước deploy

### Bước 1: Xác định cấu trúc API

Bạn cần biết API của bạn đang ở đâu:

**Trường hợp A: API ở subdomain**
- Web: `https://yourdomain.com`
- API: `https://api.yourdomain.com/api`
- ✅ Code sẽ tự động detect

**Trường hợp B: API ở cùng domain**
- Web: `https://yourdomain.com`
- API: `https://yourdomain.com/api`
- ❌ Cần cấu hình thủ công

**Trường hợp C: API ở domain khác**
- Web: `https://yourdomain.com`
- API: `https://api-different.com/api`
- ❌ Cần cấu hình thủ công

### Bước 2: Build web với cấu hình đúng

#### Nếu API ở subdomain `api.yourdomain.com` (Tự động detect)

Chỉ cần build bình thường, code sẽ tự động detect:

```bash
cd web
npm run build
```

#### Nếu API ở cùng domain hoặc domain khác

Tạo file `.env.production`:

```bash
cd web
echo "NEXT_PUBLIC_API_URL=https://yourdomain.com/api" > .env.production
# Hoặc nếu API ở domain khác:
# echo "NEXT_PUBLIC_API_URL=https://api-different.com/api" > .env.production

npm run build
```

### Bước 3: Upload thư mục out lên hosting

1. **Vào File Manager** trên hosting Mắt Bão
2. **Tìm thư mục**: `public_html/` hoặc `domains/yourdomain.com/public_html/`
3. **Upload toàn bộ nội dung** trong thư mục `web/out/` lên `public_html/`
   - Upload: `index.html`, `_next/`, `login/`, `admin/`, v.v.
   - **Không** upload cả thư mục `out/`

### Bước 4: Tạo file .htaccess

Tạo file `.htaccess` trong `public_html/` với nội dung:

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Bước 5: Set permissions (nếu cần)

Qua SSH hoặc File Manager, set permissions:

```bash
chmod -R 755 public_html/
```

## 🔍 Kiểm tra sau khi deploy

1. Mở web: `https://yourdomain.com`
2. Mở Console browser (F12)
3. Thử đăng nhập
4. Kiểm tra Network tab để xem API URL đang được dùng

Nếu thấy request đến `localhost:8000`, nghĩa là detect chưa đúng.

## ⚙️ Cấu hình API trên Mắt Bão

### Nếu API ở subdomain `api.yourdomain.com`

1. Tạo subdomain `api` trong cPanel/Quản lý hosting
2. Point subdomain về thư mục chứa API (ví dụ: `domains/yourdomain.com/api/`)
3. Upload API Laravel vào thư mục đó
4. Cấu hình `.htaccess` cho API (xem file `api/public/.htaccess`)

### Nếu API ở cùng domain

1. Upload API vào thư mục `domains/yourdomain.com/api/`
2. Cấu hình `.htaccess` để route `/api/*` về Laravel
3. Cập nhật `.env.production` khi build web

## 🐛 Troubleshooting

### Lỗi: "Không thể kết nối đến server"

**Nguyên nhân**: API URL chưa được detect đúng

**Giải pháp**:
1. Kiểm tra Console browser (F12) để xem API URL đang được dùng
2. Nếu vẫn là `localhost:8000`, cần:
   - Tạo file `.env.production` với API URL đúng
   - Build lại: `npm run build`
   - Upload lại thư mục `out/`

### Lỗi: CORS

**Nguyên nhân**: API chưa cấu hình CORS cho domain web

**Giải pháp**: Cập nhật file `api/config/cors.php`:

```php
'allowed_origins' => [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
],
```

### Lỗi: 404 Not Found

**Nguyên nhân**: Routing chưa được cấu hình đúng

**Giải pháp**: 
- Kiểm tra file `.htaccess` trong `public_html/`
- Đảm bảo có nội dung như ở Bước 4

## 📝 Lưu ý quan trọng

1. **Biến môi trường** `NEXT_PUBLIC_API_URL` phải được set **trước khi build**
2. Sau khi build, không thể thay đổi API URL nữa (trừ khi build lại)
3. Đảm bảo API đã được deploy và hoạt động trước khi deploy web
4. Kiểm tra CORS trên API để cho phép domain web gọi API

## 🔗 Liên kết hữu ích

- File hướng dẫn sửa lỗi API URL: `SUA_LOI_API_URL_HOSTING.md`
- File hướng dẫn upload out: `UPLOAD_OUT_MOI.md`
