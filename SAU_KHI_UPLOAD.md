# 🚀 Sau Khi Upload Code - Các Bước Tiếp Theo

## ✅ Bạn đã upload code lên host

Bây giờ cần làm các bước sau để website hoạt động:

## 📋 Checklist

### Bước 1: Kiểm tra file .htaccess

**Qua File Manager:**
1. Vào thư mục `public_html/`
2. Kiểm tra có file `.htaccess` không
3. Nếu chưa có, tạo file mới tên `.htaccess`

**Nội dung file `.htaccess`:**
```apache
RewriteEngine On
RewriteBase /

# Handle Next.js routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

**Hoặc copy từ:** `web/public_html_htaccess_litespeed.txt`

### Bước 2: Set Permissions (Quyền truy cập)

**Qua File Manager:**
1. Vào thư mục `public_html/`
2. Chọn **tất cả files và folders**
3. Click **Change Permissions** (hoặc **Permissions**)
4. Set:
   - **Files:** `644`
   - **Folders:** `755`
   - Check **Recurse into subdirectories**

**Hoặc qua SSH:**
```bash
cd public_html
chmod -R 755 .
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
```

### Bước 3: Kiểm tra Document Root

**Trong cPanel:**
1. Vào **Domains** → **websi.vn**
2. Xem **Document Root** là gì
3. Phải trỏ đến `public_html/` hoặc `domains/websi.vn/public_html/`

### Bước 4: Test Website

1. **Truy cập:** `websi.vn`
2. **Kiểm tra:**
   - Website có hiển thị không?
   - Có lỗi 403/404 không?
   - Console (F12) có lỗi không?

### Bước 5: Test Các Route

Thử truy cập các trang:
- `websi.vn/login`
- `websi.vn/register`
- `websi.vn/orders`
- `websi.vn/payments?id=1` (thay vì `/payments/1`)

### Bước 6: Kiểm tra API Connection

1. Mở Console (F12)
2. Xem có lỗi API không
3. Kiểm tra API URL: Phải là `https://api.websi.vn/api`

## 🆘 Nếu Vẫn Bị Lỗi 403

### Kiểm tra 1: File index.html

- Xem có file `index.html` trong `public_html/` không
- File có kích thước > 0 không
- Permissions của file là `644`

### Kiểm tra 2: Permissions

- Files: `644`
- Folders: `755`
- File `.htaccess`: `644`

### Kiểm tra 3: .htaccess

- File `.htaccess` có trong `public_html/` không
- Nội dung có đúng không
- Permissions là `644`

### Kiểm tra 4: Document Root

- Document Root phải trỏ đến `public_html/`
- Nếu không đúng, liên hệ support hosting

## 🔧 Nếu Vẫn Không Hoạt Động

### Tạo file test đơn giản

**Tạo file:** `public_html/test.html`

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test</title>
</head>
<body>
    <h1>Test thành công!</h1>
    <p>Nếu bạn thấy trang này, server đang hoạt động.</p>
</body>
</html>
```

**Truy cập:** `websi.vn/test.html`

- ✅ Nếu vào được → Vấn đề là Next.js routing
- ❌ Nếu không vào được → Vấn đề là permissions hoặc Document Root

## 📝 Lưu Ý Quan Trọng

### Route Payments Đã Thay Đổi

**Trước:** `/payments/1`
**Bây giờ:** `/payments?id=1`

Nếu có code nào redirect đến `/payments/[id]`, cần sửa thành `/payments?id=[id]`

### Environment Variables

Đảm bảo API URL đúng trong code:
- API: `https://api.websi.vn/api`
- Image domains: `api.websi.vn,websi.vn`

## ✅ Hoàn Thành

Sau khi làm xong các bước trên:
- [ ] Đã tạo file `.htaccess`
- [ ] Đã set permissions: `755` (folders), `644` (files)
- [ ] Đã test: `websi.vn`
- [ ] Đã test các routes
- [ ] Đã kiểm tra Console (F12) - không có lỗi

Website sẽ hoạt động bình thường! 🎉

