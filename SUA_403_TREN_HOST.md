# 🔧 Sửa Lỗi 403 Trên Host - Hướng Dẫn Nhanh

## 🎯 Sửa trực tiếp trên host

### Bước 1: Kiểm tra file index.html

**Qua File Manager:**
1. Vào `domains/websi.vn/public_html/`
2. Kiểm tra có file `index.html` không
3. Nếu không có → Cần upload từ `web/out/`

### Bước 2: Tạo file test đơn giản

**Tạo file:** `public_html/test.html`

**Nội dung:**
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

- ✅ Nếu hiển thị → Server OK
- ❌ Nếu vẫn 403 → Vấn đề permissions/Document Root

### Bước 3: Tạo file index.html đơn giản (tạm thời)

**Nếu chưa có file từ Next.js, tạo tạm:**

**File:** `public_html/index.html`

**Nội dung:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Banhmi</title>
</head>
<body>
    <h1>Đang cập nhật...</h1>
    <p>Website đang được cập nhật. Vui lòng quay lại sau.</p>
</body>
</html>
```

**Sau đó upload file từ Next.js build.**

### Bước 4: Tạo file .htaccess

**File:** `public_html/.htaccess`

**Nội dung:**
```apache
RewriteEngine On
RewriteBase /

RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Bước 5: Set permissions

**Qua File Manager:**
1. Chọn thư mục `public_html/`
2. Click **Permissions** hoặc **Change Permissions**
3. Set: `755`
4. Apply recursively

**Hoặc qua SSH:**
```bash
chmod -R 755 /domains/websi.vn/public_html
```

### Bước 6: Kiểm tra Document Root

**Trong cPanel:**
1. Vào **Domain Setup** hoặc **Subdomains**
2. Kiểm tra Document Root của `websi.vn`
3. Phải trỏ đến: `/domains/websi.vn/public_html`

## 🔍 Debug trên host

### Kiểm tra file có tồn tại:

**Qua File Manager:**
- Xem danh sách file trong `public_html/`
- Đảm bảo có `index.html`

### Kiểm tra permissions:

**Qua File Manager:**
- Click vào file
- Xem permissions (phải là `644` cho files, `755` cho folders)

### Kiểm tra error log:

**Trong cPanel:**
1. Tìm **Error Log** hoặc **Logs**
2. Xem lỗi gần nhất
3. Tìm nguyên nhân 403

## ✅ Checklist sửa trên host

- [ ] Đã kiểm tra file `index.html` có tồn tại
- [ ] Đã tạo file `test.html` để test
- [ ] Đã tạo file `.htaccess`
- [ ] Đã set permissions: `755`
- [ ] Đã kiểm tra Document Root
- [ ] Đã xem error log
- [ ] Đã test lại: `websi.vn`

## 🆘 Nếu vẫn không được

1. **Liên hệ support hosting:**
   - Hỏi về Document Root
   - Hỏi về permissions
   - Hỏi về .htaccess

2. **Kiểm tra hosting có hỗ trợ:**
   - Static files
   - .htaccess
   - mod_rewrite

3. **Thử upload file đơn giản:**
   - Nếu file đơn giản cũng 403 → Vấn đề hosting
   - Nếu file đơn giản OK → Vấn đề Next.js


