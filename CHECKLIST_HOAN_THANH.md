# ✅ Checklist Hoàn Thành - Kiểm Tra Từng Bước

## 📋 Các Bước Cần Làm

### ✅ Bước 1: Di chuyển nội dung từ `out/` ra `public_html/`

- [ ] Đã vào thư mục `out/` trong `public_html/`
- [ ] Đã chọn tất cả files và folders trong `out/`
- [ ] Đã click "Move" (hoặc "Cut")
- [ ] Đã quay lại `public_html/`
- [ ] Đã click "Paste" để dán tất cả ra ngoài
- [ ] Đã xóa thư mục `out/` rỗng

**Kiểm tra:** Trong `public_html/` phải có:
- ✅ `index.html` (file chính)
- ✅ `_next/` (thư mục)
- ✅ `admin/`, `agent/`, `payments/`, `login/`, `register/`, ... (các routes)

### ✅ Bước 2: Xóa các thư mục/file không cần thiết

**Xóa các thư mục:**
- [ ] `.next/`
- [ ] `app/`
- [ ] `components/`
- [ ] `lib/`
- [ ] `node_modules/`
- [ ] `public/`
- [ ] `scripts/`

**Xóa các files:**
- [ ] `.env.local`
- [ ] `.env.production`
- [ ] `.eslintrc.json`
- [ ] `.gitignore`
- [ ] `build-for-hosting.sh`
- [ ] `next.config.js`
- [ ] `package.json`
- [ ] `package-lock.json`
- [ ] ... (tất cả file config khác)

**Giữ lại:**
- ✅ `cgi-bin/` (thư mục mặc định của hosting)

### ✅ Bước 3: Tạo file `.htaccess`

- [ ] Đã tạo file `.htaccess` trong `public_html/`
- [ ] Tên file đúng: `.htaccess` (có dấu chấm ở đầu)
- [ ] Đã copy nội dung đầy đủ vào file
- [ ] Đã Save (Lưu) file

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

### ✅ Bước 4: Set Permissions (Quyền truy cập)

- [ ] Đã chọn tất cả files và folders trong `public_html/`
- [ ] Đã click "Change Permissions" (hoặc "Permissions")
- [ ] Đã set:
  - Files: `644`
  - Folders: `755`
- [ ] Đã check "Recurse into subdirectories"

### ✅ Bước 5: Test Website

- [ ] Đã truy cập: `websi.vn`
- [ ] Website có hiển thị không? (không bị 403, 404)
- [ ] Đã mở Console (F12) - không có lỗi đỏ
- [ ] Đã test các routes:
  - [ ] `websi.vn/login`
  - [ ] `websi.vn/register`
  - [ ] `websi.vn/orders`
  - [ ] `websi.vn/payments?id=1`

## 🎯 Cấu Trúc Cuối Cùng

**Sau khi hoàn thành, trong `public_html/` chỉ còn:**

```
public_html/
├── .htaccess         ← File cấu hình
├── index.html        ← File chính
├── _next/            ← Thư mục Next.js
│   └── static/
├── admin/            ← Route admin
├── agent/            ← Route agent
├── payments/          ← Route payments
├── login/             ← Route login
├── register/          ← Route register
├── orders/            ← Route orders
├── debts/             ← Route debts
└── cgi-bin/           ← Thư mục mặc định (giữ lại)
```

**KHÔNG còn:**
- ❌ `out/`
- ❌ `.next/`
- ❌ `app/`
- ❌ `node_modules/`
- ❌ `package.json`
- ❌ ... (các file config khác)

## 🆘 Nếu Vẫn Bị Lỗi

### Lỗi 403 Forbidden:
1. Kiểm tra file `index.html` có trong `public_html/` không
2. Kiểm tra permissions: Files `644`, Folders `755`
3. Kiểm tra file `.htaccess` có đúng không
4. Kiểm tra Document Root trong cPanel phải trỏ đến `public_html/`

### Lỗi 404 Not Found:
1. Kiểm tra file `.htaccess` có đúng không
2. Kiểm tra RewriteEngine có bật không
3. Kiểm tra file `index.html` có tồn tại không

### Website không hiển thị đúng:
1. Mở Console (F12) xem có lỗi không
2. Kiểm tra API URL có đúng không: `https://api.websi.vn/api`
3. Kiểm tra Network tab xem có request nào fail không

## ✅ Hoàn Thành

Nếu đã check hết các bước trên và website hoạt động bình thường → **ĐÃ XONG!** 🎉

