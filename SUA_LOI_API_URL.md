# 🔧 Sửa Lỗi API URL - Hướng Dẫn Chi Tiết

## ❌ Vấn đề

Website vẫn hiển thị lỗi: "Không thể kết nối đến server. Vui lòng kiểm tra API đang chạy tại http://localhost:8000"

## ✅ Đã sửa code

Code đã được sửa để tự động dùng `https://api.websi.vn/api` khi chạy trên production.

## 📦 Các Bước Sửa Trên Host

### Bước 1: Upload lại code mới (QUAN TRỌNG!)

**Code đã được build lại với fix mới:**

1. **Xóa cache browser trước:**
   - Mở `websi.vn` trong Incognito/Private mode
   - Hoặc xóa cache browser hoàn toàn

2. **Upload lại toàn bộ từ `web/out/`:**
   - Xóa tất cả files/folders trong `public_html/` (trừ `cgi-bin/` và `.htaccess`)
   - Upload lại toàn bộ từ `web/out/` lên `public_html/`

### Bước 2: Xóa cache browser

**Sau khi upload:**

1. **Hard refresh:**
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Hoặc xóa cache:**
   - Chrome: Settings → Privacy → Clear browsing data → Cached images and files
   - Firefox: Settings → Privacy → Clear Data → Cached Web Content

3. **Hoặc test bằng Incognito/Private mode**

### Bước 3: Kiểm tra

1. **Mở Console (F12):**
   - Tab "Network"
   - Thử đăng nhập
   - Xem request có gửi đến `https://api.websi.vn/api` không

2. **Kiểm tra API hoạt động:**
   - Truy cập: `https://api.websi.vn/api/categories`
   - Phải trả về JSON (không phải lỗi)

## 🆘 Nếu Vẫn Lỗi

### Kiểm tra 1: Code đã upload chưa?

**Xem "Last modified" của files:**
- Vào `public_html/_next/static/chunks/`
- File nào có thời gian mới nhất? (phải là sau khi build lại)
- Nếu vẫn là thời gian cũ → Chưa upload code mới

### Kiểm tra 2: Browser cache

- Test bằng Incognito/Private mode
- Hoặc xóa cache hoàn toàn
- Hoặc dùng browser khác

### Kiểm tra 3: API có hoạt động không?

- Truy cập: `https://api.websi.vn/api/categories`
- Nếu lỗi → Vấn đề là API, không phải website

### Kiểm tra 4: CORS

**Nếu lỗi CORS:**
- Kiểm tra file `api/config/cors.php` trên server API
- Đảm bảo có `websi.vn` trong `CORS_ALLOWED_ORIGINS`

## 🔍 Debug

**Mở Console (F12) và chạy:**

```javascript
// Kiểm tra API URL đang dùng
console.log('Current hostname:', window.location.hostname)
console.log('Expected API:', window.location.hostname !== 'localhost' ? 'https://api.websi.vn/api' : 'http://localhost:8000/api')
```

**Nếu vẫn hiển thị localhost:**
- Code chưa được upload đúng
- Hoặc browser đang cache code cũ

## 📋 Checklist

- [ ] Đã upload lại toàn bộ từ `web/out/` lên `public_html/`
- [ ] Đã xóa cache browser (hoặc dùng Incognito)
- [ ] Đã hard refresh: `Ctrl + Shift + R`
- [ ] Đã kiểm tra Console (F12) - request gửi đến `https://api.websi.vn/api`
- [ ] Đã test API: `https://api.websi.vn/api/categories` hoạt động

## ✅ Kết quả mong đợi

Sau khi sửa:
- Website tự động dùng `https://api.websi.vn/api` khi chạy trên `websi.vn`
- Không còn lỗi "Cannot connect to server"
- Đăng nhập hoạt động bình thường


