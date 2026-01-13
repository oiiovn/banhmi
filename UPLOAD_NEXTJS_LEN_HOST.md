# 🚀 Hướng Dẫn Upload Next.js Lên Host

## ✅ Tình trạng hiện tại

✅ Server đang hoạt động (test.html đã vào được)  
✅ Document Root đúng  
✅ Permissions OK  
⏳ Cần build và upload Next.js

## 🔧 Các bước build và upload

### Bước 1: Build Next.js trên máy local

**Trên máy của bạn:**

```bash
cd web
npm run build
```

**Kết quả:** Sẽ tạo thư mục `web/out/` chứa các file static

**Kiểm tra:**
```bash
ls -la web/out/
# Phải thấy: index.html, _next/, và các file khác
```

### Bước 2: Nén thư mục out/

**Tạo file zip:**
```bash
cd web
zip -r out.zip out/
```

**Hoặc nén thủ công:**
- Chọn thư mục `out/`
- Right click → Compress
- Tạo file `out.zip`

### Bước 3: Upload lên host

**Qua File Manager:**

1. **Vào File Manager**
2. **Điều hướng đến:** `domains/websi.vn/public_html/`
3. **Upload file `out.zip`**
   - Click **Upload**
   - Chọn file `out.zip`
   - Đợi upload xong
4. **Giải nén:**
   - Chọn file `out.zip`
   - Click **Extract** hoặc **Archive** → **Extract**
   - Giải nén vào thư mục hiện tại (`public_html/`)

**Kết quả sau khi giải nén:**
```
public_html/
├── out/              ← Thư mục đã giải nén
│   ├── index.html
│   ├── _next/
│   └── ...
├── test.html
└── out.zip
```

### Bước 4: Di chuyển file từ out/ lên public_html/

**Qua File Manager:**

1. **Vào thư mục:** `public_html/out/`
2. **Chọn TẤT CẢ** file và folder (Ctrl+A / Cmd+A)
3. **Click "Move"**
4. **Di chuyển lên:** `public_html/` (thư mục cha)
5. **Xác nhận**

**Kết quả:**
```
public_html/
├── index.html        ← Từ out/
├── _next/            ← Từ out/
├── favicon.ico       ← Từ out/
├── test.html
└── out/              ← Có thể xóa sau
```

### Bước 5: Tạo file .htaccess

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

### Bước 6: Xóa file không cần thiết

**Có thể xóa:**
- `test.html` (nếu không cần nữa)
- `out.zip` (sau khi đã giải nén)
- Thư mục `out/` (sau khi đã di chuyển file)

### Bước 7: Test

**Truy cập:**
- `websi.vn` - Trang chủ
- `websi.vn/login` - Trang đăng nhập
- `websi.vn/register` - Trang đăng ký

## 🔍 Kiểm tra sau khi upload

### Kiểm tra 1: File index.html

**Phải có:**
- `public_html/index.html`
- File phải có kích thước > 0

### Kiểm tra 2: Thư mục _next/

**Phải có:**
- `public_html/_next/`
- Bên trong có thư mục `static/`

### Kiểm tra 3: Permissions

**Set permissions:**
```bash
chmod -R 755 public_html/
```

## ⚠️ Lưu ý

1. **Đảm bảo đã build với static export:**
   - File `next.config.js` phải có `output: 'export'`
   - Đã được sửa trước đó

2. **File .htaccess quan trọng:**
   - Cần cho routing hoạt động
   - Không có sẽ bị 404 khi vào các route

3. **API URL:**
   - Đã tạo file `.env.production` với `NEXT_PUBLIC_API_URL=https://api.websi.vn/api`
   - File này cần có trước khi build

## 🧪 Test sau khi upload

1. **Truy cập:** `websi.vn`
2. **Kiểm tra Console (F12):** Xem có lỗi không
3. **Test đăng nhập:** Xem có kết nối được API không
4. **Test navigation:** Click các link xem có hoạt động không

## 🆘 Nếu vẫn lỗi

### Lỗi 404 trên các route:
- Kiểm tra file `.htaccess` đã có chưa
- Kiểm tra nội dung `.htaccess` có đúng không

### Lỗi không load được:
- Kiểm tra file `_next/static/` có đầy đủ không
- Kiểm tra Console (F12) xem lỗi gì

### Lỗi API không kết nối:
- Kiểm tra `NEXT_PUBLIC_API_URL` trong build
- Kiểm tra API có hoạt động: `api.websi.vn/api/categories`

## ✅ Checklist

- [ ] Đã build Next.js: `npm run build`
- [ ] Đã nén thư mục `out/` thành zip
- [ ] Đã upload `out.zip` lên `public_html/`
- [ ] Đã giải nén `out.zip`
- [ ] Đã di chuyển file từ `out/` lên `public_html/`
- [ ] Đã tạo file `.htaccess`
- [ ] Đã set permissions: `755`
- [ ] Đã test: `websi.vn`
- [ ] Đã test các route: `/login`, `/register`

