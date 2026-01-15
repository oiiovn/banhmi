# 📝 Hướng Dẫn Tạo File .htaccess

## 🎯 Mục đích

File `.htaccess` giúp:
- Xử lý routing cho Next.js (SPA - Single Page Application)
- Bảo mật website
- Nén files để tải nhanh hơn
- Cache static files

## 🔧 Cách Tạo File .htaccess

### Cách 1: Tạo file mới trong File Manager

1. **Vào thư mục `public_html/`**
2. **Click nút "New File"** (hoặc "Tạo file mới")
3. **Đặt tên file:** `.htaccess` (bắt đầu bằng dấu chấm!)
4. **Copy nội dung** bên dưới vào file
5. **Save** (Lưu)

### Cách 2: Upload file từ máy tính

1. **Tạo file `.htaccess`** trên máy tính với nội dung bên dưới
2. **Upload** lên `public_html/`
3. **Đảm bảo** tên file là `.htaccess` (có dấu chấm ở đầu)

## 📄 Nội Dung File .htaccess

**Copy toàn bộ nội dung này vào file `.htaccess`:**

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

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

## 📋 Giải Thích Từng Phần

### 1. Rewrite Rules (Xử lý routing)

```apache
RewriteEngine On
RewriteBase /

# Handle Next.js routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

**Chức năng:**
- Bật RewriteEngine để xử lý URL rewriting
- Nếu file hoặc thư mục không tồn tại → redirect về `index.html`
- Giúp Next.js routing hoạt động (ví dụ: `/login`, `/orders` sẽ load `index.html` và Next.js sẽ xử lý route)

### 2. Security Headers (Bảo mật)

```apache
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
</IfModule>
```

**Chức năng:**
- `X-Content-Type-Options: nosniff` - Ngăn browser tự động detect MIME type
- `X-Frame-Options: SAMEORIGIN` - Ngăn website bị embed trong iframe (chống clickjacking)

### 3. Compression (Nén files)

```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

**Chức năng:**
- Nén các file text, CSS, JavaScript trước khi gửi cho browser
- Giúp website tải nhanh hơn

### 4. Cache (Lưu cache)

```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

**Chức năng:**
- Cache images trong 1 năm
- Cache CSS và JavaScript trong 1 tháng
- Giúp website tải nhanh hơn khi user quay lại

## ✅ Kiểm Tra Sau Khi Tạo

1. **File `.htaccess` có trong `public_html/`** không?
2. **Tên file đúng:** `.htaccess` (có dấu chấm ở đầu)
3. **Permissions:** `644` (nếu có thể set)
4. **Nội dung:** Đã copy đầy đủ chưa?

## 🆘 Nếu File Không Hoạt Động

### Kiểm tra 1: Tên file

- Phải là `.htaccess` (có dấu chấm ở đầu)
- KHÔNG phải `htaccess` hoặc `.htaccess.txt`

### Kiểm tra 2: Vị trí file

- File phải ở trong `public_html/`
- KHÔNG phải trong `public_html/out/` hoặc thư mục con khác

### Kiểm tra 3: Permissions

- Set permissions: `644`
- Nếu không được, thử `644` hoặc `755`

### Kiểm tra 4: LiteSpeed Support

- LiteSpeed Web Server hỗ trợ `.htaccess`
- Nếu không hoạt động, liên hệ support hosting

## 📝 File Mẫu

Bạn có thể copy từ file: `web/public_html_htaccess_litespeed.txt` trên máy local

## ⚠️ Lưu Ý

- File `.htaccess` rất nhạy cảm với lỗi cú pháp
- Nếu có lỗi, website có thể không hoạt động
- Nên backup trước khi sửa
- Test ngay sau khi tạo để đảm bảo hoạt động


