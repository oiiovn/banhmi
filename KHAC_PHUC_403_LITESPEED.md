# 🔧 Khắc Phục Lỗi 403 - LiteSpeed Web Server

## ❌ Vấn đề

- Lỗi 403 Forbidden trên `websi.vn`
- Server: LiteSpeed Web Server
- API đã hoạt động: `api.websi.vn`

## 🎯 Nguyên nhân có thể

1. **Không có file `index.html`** trong `public_html/`
2. **File permissions không đúng**
3. **Document Root không đúng**
4. **Next.js chưa được build hoặc upload**

## ✅ Giải pháp từng bước

### Bước 1: Build Next.js (Nếu chưa build)

```bash
cd web
npm run build
```

**Kiểm tra:** Xem có thư mục `.next/` không

### Bước 2: Kiểm tra Document Root

**Qua cPanel:**
1. Vào **Domains** → **websi.vn**
2. Xem **Document Root** là gì
3. Thường là: `public_html/` hoặc `domains/websi.vn/public_html/`

### Bước 3: Upload file đúng cách

**Option A: Nếu hosting có Node.js**

1. **Upload toàn bộ thư mục `web/`** (trừ `node_modules`)
2. **Qua SSH:**
   ```bash
   cd domains/websi.vn/web
   npm install --production
   npm start
   ```
3. **Cấu hình LiteSpeed** để proxy đến `localhost:3000`

**Option B: Dùng Static Export (Không cần Node.js)**

1. **Sửa `next.config.js` để bật static export:**
   ```javascript
   output: 'export',
   images: { unoptimized: true }
   ```

2. **Build:**
   ```bash
   npm run build
   ```

3. **Upload toàn bộ nội dung từ `out/`** lên `public_html/`

### Bước 4: Tạo file .htaccess cho LiteSpeed

**File:** `public_html/.htaccess`

```apache
# LiteSpeed Web Server Configuration
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

### Bước 5: Set Permissions

**Qua File Manager hoặc SSH:**

```bash
# Set permissions cho thư mục
chmod -R 755 public_html/

# Set permissions cho files
find public_html/ -type f -exec chmod 644 {} \;

# Set permissions cho thư mục
find public_html/ -type d -exec chmod 755 {} \;
```

**Hoặc qua File Manager:**
- Chọn tất cả files/folders
- Change Permissions:
  - Files: `644`
  - Folders: `755`

### Bước 6: Kiểm tra file index.html

**Đảm bảo có file `public_html/index.html`**

**Nếu không có:**
- Build lại Next.js
- Hoặc tạo file tạm thời:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Banhmi</title>
    <meta http-equiv="refresh" content="0; url=/">
</head>
<body>
    <p>Redirecting...</p>
</body>
</html>
```

## 🧪 Test

1. **Truy cập:** `websi.vn`
2. **Kiểm tra Console (F12):** Xem có lỗi không
3. **Test API:** Xem có gọi được `api.websi.vn` không

## 🆘 Nếu vẫn 403

### Kiểm tra 1: File Manager

1. Vào **File Manager** trong cPanel
2. Vào thư mục `public_html/`
3. **Xem có file `index.html` không**
4. **Xem permissions** của files/folders

### Kiểm tra 2: LiteSpeed Configuration

**Liên hệ support hosting để:**
- Kiểm tra Document Root
- Kiểm tra LiteSpeed configuration
- Kiểm tra có block IP không

### Kiểm tra 3: Tạm thời tạo file test

**Tạo file:** `public_html/test.html`

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test</title>
</head>
<body>
    <h1>Test thành công!</h1>
</body>
</html>
```

**Truy cập:** `websi.vn/test.html`

- Nếu vào được → Vấn đề là Next.js chưa được upload đúng
- Nếu không vào được → Vấn đề là permissions hoặc Document Root

## 📋 Checklist

- [ ] Đã build Next.js: `npm run build`
- [ ] Đã kiểm tra Document Root
- [ ] Đã upload files lên `public_html/`
- [ ] Đã tạo file `.htaccess`
- [ ] Đã set permissions: `755` (folders), `644` (files)
- [ ] Đã kiểm tra có file `index.html` không
- [ ] Đã test: `websi.vn`


