# ✅ Code Đã Sẵn Sàng - Hướng Dẫn Upload Lên Host

## 🎉 Build Thành Công!

Code đã được sửa và build thành công. Bây giờ bạn chỉ cần upload lên host.

## 📦 Các Bước Upload

### Bước 1: Kiểm tra thư mục `out/`

Thư mục `web/out/` chứa tất cả files static đã được build.

### Bước 2: Upload lên host

**Qua File Manager hoặc FTP:**

1. **Vào thư mục:** `domains/websi.vn/public_html/`
2. **Xóa tất cả files cũ** (nếu có)
3. **Upload toàn bộ nội dung** trong `web/out/` lên `public_html/`

**Cấu trúc sau khi upload:**
```
public_html/
├── index.html          ← Phải có
├── _next/              ← Phải có
│   └── static/
├── payments/           ← Route payments
│   └── index.html
└── ... (các file khác)
```

### Bước 3: Tạo file .htaccess

**Tạo file:** `public_html/.htaccess`

**Nội dung:**
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

### Bước 4: Set Permissions

**Qua File Manager:**
- Chọn tất cả files/folders
- Change Permissions:
  - **Files:** `644`
  - **Folders:** `755`

**Hoặc qua SSH:**
```bash
chmod -R 755 public_html/
find public_html/ -type f -exec chmod 644 {} \;
find public_html/ -type d -exec chmod 755 {} \;
```

### Bước 5: Test

1. **Truy cập:** `websi.vn`
2. **Kiểm tra Console (F12):** Xem có lỗi không
3. **Test các route:**
   - `/login`
   - `/register`
   - `/orders`
   - `/payments?id=1` (thay vì `/payments/1`)

## ⚠️ Lưu Ý Quan Trọng

### Route Payments Đã Thay Đổi

**Trước:** `/payments/[id]` (ví dụ: `/payments/1`)
**Bây giờ:** `/payments?id=1` (query params)

**Nếu có code nào redirect đến `/payments/[id]`, cần sửa thành `/payments?id=[id]`**

## 🆘 Nếu Vẫn 403

### Kiểm tra 1: File index.html

- Xem có file `index.html` trong `public_html/` không
- File có kích thước > 0 không

### Kiểm tra 2: Permissions

- Files: `644`
- Folders: `755`

### Kiểm tra 3: Document Root

**Trong cPanel:**
- Domain Setup → Xem Document Root
- Phải trỏ đến `public_html/`

### Kiểm tra 4: .htaccess

- File `.htaccess` có trong `public_html/` không
- Nội dung có đúng không

## ✅ Checklist

- [x] Code đã được sửa
- [x] Build thành công
- [ ] Đã upload toàn bộ từ `out/` lên `public_html/`
- [ ] Đã tạo file `.htaccess`
- [ ] Đã set permissions: `755` (folders), `644` (files)
- [ ] Đã test: `websi.vn`

## 📝 File Đã Tạo

- `web/out/` - Thư mục chứa files static (upload lên host)
- `web/public_html_htaccess_litespeed.txt` - File .htaccess mẫu
- `KHAC_PHUC_403_LITESPEED.md` - Hướng dẫn chi tiết

