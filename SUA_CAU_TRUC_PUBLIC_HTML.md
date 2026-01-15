# 🔧 Sửa cấu trúc thư mục public_html

## ❌ Vấn đề hiện tại

Bạn đã upload cả thư mục `out` vào `public_html`, nên cấu trúc hiện tại là:

```
public_html/
  ├── out/          ← Thư mục này không nên có
  │   ├── index.html
  │   ├── _next/
  │   └── ...
  └── .htaccess
```

Điều này khiến website chạy từ `public_html/out/` thay vì `public_html/`, gây lỗi routing và API URL detection.

## ✅ Cách sửa

### Cách 1: Di chuyển nội dung lên public_html (Khuyến nghị)

1. **Vào File Manager** trên hosting Mắt Bão

2. **Vào thư mục** `public_html/out/`

3. **Chọn tất cả** file và thư mục bên trong `out/` (không chọn thư mục `out`)

4. **Cut** (Cắt) tất cả

5. **Quay lại** thư mục `public_html/`

6. **Paste** (Dán) tất cả vào đây

7. **Xóa** thư mục `out` rỗng (nếu còn)

Kết quả sẽ là:

```
public_html/
  ├── index.html    ✅
  ├── _next/        ✅
  ├── admin/        ✅
  ├── agent/        ✅
  ├── login/        ✅
  ├── .htaccess     ✅
  └── ...
```

### Cách 2: Sửa .htaccess để redirect (Tạm thời)

Nếu không muốn di chuyển file, có thể sửa `.htaccess` để redirect:

1. **Mở file** `.htaccess` trong `public_html/`

2. **Thêm** dòng này ở đầu file:

```apache
RewriteEngine On
RewriteBase /

# Redirect root to /out/
RewriteRule ^$ /out/ [L]

# Redirect all requests to /out/
RewriteCond %{REQUEST_URI} !^/out/
RewriteRule ^(.*)$ /out/$1 [L]
```

**Lưu ý**: Cách này không khuyến nghị vì có thể gây vấn đề với routing và API URL detection.

### Cách 3: Upload lại đúng cách

1. **Xóa toàn bộ** nội dung trong `public_html/` (trừ `.htaccess` nếu cần giữ)

2. **Vào thư mục** `web/out/` trên máy local

3. **Chọn tất cả** file và thư mục bên trong `out/` (không chọn thư mục `out`)

4. **Upload** trực tiếp lên `public_html/`

## ✅ Kiểm tra sau khi sửa

1. Truy cập: `https://websi.vn`
2. Website phải load được trang chủ
3. Mở Console browser (F12) và kiểm tra:
   - Không có lỗi 404
   - API URL được detect đúng (không phải localhost:8000)

## 📝 Lưu ý

- **Cách 1 là tốt nhất** - đảm bảo cấu trúc đúng và website hoạt động tốt
- Sau khi sửa, có thể cần xóa cache browser
- Đảm bảo file `.htaccess` vẫn còn trong `public_html/`
