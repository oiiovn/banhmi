# 🔧 Khắc Phục Lỗi 403 Forbidden - Chi Tiết

## ❌ Lỗi: 403 Forbidden trên websi.vn

## 🎯 Giải pháp nhanh nhất

### Bước 1: Build Next.js với static export

**Chạy script tự động:**
```bash
cd web
./build-for-hosting.sh
```

**Hoặc làm thủ công:**

1. **Sửa `next.config.js`:**
   - Mở file `web/next.config.js`
   - Thêm `output: 'export',` vào `nextConfig`
   - Thêm `unoptimized: true,` vào `images`

2. **Build:**
   ```bash
   cd web
   npm run build
   ```

### Bước 2: Upload file lên hosting

**Upload toàn bộ nội dung** trong thư mục `web/out/` lên:
```
domains/websi.vn/public_html/
```

**Cấu trúc sau khi upload:**
```
public_html/
├── index.html          ← Phải có
├── _next/              ← Phải có
│   ├── static/
│   └── ...
├── favicon.ico
└── ... (các file khác)
```

### Bước 3: Tạo file `.htaccess`

**Tạo file:** `public_html/.htaccess`

**Nội dung:**
```apache
RewriteEngine On
RewriteBase /

# Redirect to index.html for SPA
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
</IfModule>
```

### Bước 4: Set permissions

**Qua File Manager:**
1. Chọn thư mục `public_html/`
2. Click "Permissions" hoặc "Change Permissions"
3. Set: `755` (rwxr-xr-x)
4. Apply recursively

**Qua SSH:**
```bash
chmod -R 755 /domains/websi.vn/public_html
```

### Bước 5: Kiểm tra Document Root

**Trong cPanel:**
1. Vào **Domain Setup** hoặc **Subdomains**
2. Kiểm tra Document Root của `websi.vn`
3. Phải trỏ đến: `/domains/websi.vn/public_html`

## 🧪 Test từng bước

### Test 1: File index.html đơn giản

**Tạo file:** `public_html/test.html`
```html
<!DOCTYPE html>
<html>
<head>
    <title>Test</title>
</head>
<body>
    <h1>Web đang hoạt động!</h1>
</body>
</html>
```

**Truy cập:** `websi.vn/test.html`

- ✅ Nếu hiển thị → Server OK, vấn đề là Next.js
- ❌ Nếu vẫn 403 → Vấn đề permissions/Document Root

### Test 2: Kiểm tra file index.html

**Kiểm tra:**
- File `public_html/index.html` có tồn tại không?
- File có kích thước > 0 không?

```bash
ls -lh public_html/index.html
```

### Test 3: Kiểm tra permissions

```bash
ls -la public_html/
# Phải thấy: drwxr-xr-x
```

## 🔍 Nguyên nhân thường gặp

### 1. File index.html không có

**Triệu chứng:**
- Thư mục `out/` chưa được upload
- Hoặc upload sai vị trí

**Giải pháp:**
- Upload lại toàn bộ nội dung từ `web/out/` lên `public_html/`

### 2. Permissions sai

**Triệu chứng:**
- File có nhưng không truy cập được

**Giải pháp:**
```bash
chmod -R 755 public_html/
```

### 3. Document Root sai

**Triệu chứng:**
- File có nhưng ở vị trí khác

**Giải pháp:**
- Kiểm tra Document Root trong cPanel
- Đảm bảo trỏ đến `public_html/`

### 4. .htaccess chưa có hoặc sai

**Triệu chứng:**
- File có nhưng route không hoạt động

**Giải pháp:**
- Tạo file `.htaccess` với nội dung đúng

### 5. Next.js chưa được build

**Triệu chứng:**
- Thư mục `out/` không có hoặc rỗng

**Giải pháp:**
- Chạy `npm run build` trong thư mục `web/`

## ✅ Checklist khắc phục

- [ ] Đã sửa `next.config.js` để static export
- [ ] Đã build: `npm run build`
- [ ] Đã upload toàn bộ nội dung từ `out/` lên `public_html/`
- [ ] Đã tạo file `.htaccess` trong `public_html/`
- [ ] Đã set permissions: `755`
- [ ] Đã kiểm tra Document Root
- [ ] Đã test file `test.html` đơn giản
- [ ] Đã test: `websi.vn`

## 🆘 Nếu vẫn không được

1. **Kiểm tra error log:**
   - Xem error log trong cPanel
   - Hoặc `/var/log/nginx/error.log` (nếu có SSH)

2. **Liên hệ support hosting:**
   - Hỏi về Document Root
   - Hỏi về permissions
   - Hỏi về .htaccess

3. **Test với file đơn giản:**
   - Tạo `index.html` đơn giản
   - Nếu vẫn 403 → Vấn đề hosting/config
   - Nếu OK → Vấn đề Next.js

## 📝 Lưu ý

- **Static export** không có SSR, chỉ có static files
- **File `out/`** chứa tất cả file cần upload
- **.htaccess** cần thiết cho routing
- **Permissions** phải đúng (755 cho folders, 644 cho files)


