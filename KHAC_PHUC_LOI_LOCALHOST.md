# 🚨 Khắc Phục Lỗi: Vẫn Gửi Request Đến localhost:8000

## ❌ Vấn đề

Console hiển thị:
- `POST http://localhost:8000/api/login net::ERR_FAILED`
- CORS error: Request từ `https://websi.vn` đến `http://localhost:8000`

**Nguyên nhân:** Code mới chưa được upload lên host, hoặc browser đang cache code cũ.

## ✅ Giải pháp

### Bước 1: Upload lại code mới (BẮT BUỘC)

**Code đã được build lại với fix:**

1. **Xóa tất cả** trong `public_html/` (trừ `cgi-bin/` và `.htaccess`)
2. **Upload lại toàn bộ** từ `web/out/` lên `public_html/`

**Quan trọng:** Phải upload lại, không thể chỉ sửa một vài file!

### Bước 2: Xóa cache browser HOÀN TOÀN

**Cách 1: Dùng Incognito/Private mode**
- Mở `websi.vn` trong Incognito/Private mode
- Test lại

**Cách 2: Xóa cache hoàn toàn**
- Chrome: `Ctrl + Shift + Delete` → Chọn "Cached images and files" → Clear data
- Firefox: `Ctrl + Shift + Delete` → Chọn "Cache" → Clear Now
- Hoặc Settings → Privacy → Clear browsing data

**Cách 3: Hard refresh**
- `Ctrl + Shift + R` (Windows) hoặc `Cmd + Shift + R` (Mac)
- Làm nhiều lần nếu cần

### Bước 3: Kiểm tra code đã upload đúng chưa

**Qua File Manager:**
1. Vào `public_html/_next/static/chunks/`
2. Xem "Last modified" của các file `.js`
3. Phải là thời gian mới nhất (sau khi build lại)

**Nếu thời gian vẫn cũ:**
- Code chưa được upload đúng
- Upload lại toàn bộ

### Bước 4: Test lại

1. **Mở Console (F12):**
   - Tab "Network"
   - Thử đăng nhập
   - Xem request có gửi đến `https://api.websi.vn/api/login` không

2. **Kiểm tra:**
   - Request URL phải là: `https://api.websi.vn/api/login`
   - KHÔNG phải: `http://localhost:8000/api/login`

## 🔍 Debug trong Console

**Mở Console (F12) và chạy:**

```javascript
// Kiểm tra hostname
console.log('Hostname:', window.location.hostname)

// Kiểm tra API URL đang dùng
// (Code sẽ tự động detect và dùng https://api.websi.vn/api)
```

**Nếu vẫn hiển thị localhost:**
- Code chưa được upload đúng
- Hoặc browser đang cache code cũ

## ⚠️ Lưu ý quan trọng

1. **PHẢI upload lại toàn bộ** từ `web/out/`
2. **PHẢI xóa cache browser** hoặc dùng Incognito
3. **KHÔNG thể** chỉ sửa một vài file - phải upload lại tất cả

## 📋 Checklist

- [ ] Đã xóa tất cả files/folders trong `public_html/` (trừ `cgi-bin/` và `.htaccess`)
- [ ] Đã upload lại toàn bộ từ `web/out/` lên `public_html/`
- [ ] Đã xóa cache browser (hoặc dùng Incognito)
- [ ] Đã hard refresh: `Ctrl + Shift + R`
- [ ] Đã kiểm tra Console - request gửi đến `https://api.websi.vn/api/login`
- [ ] Đã test đăng nhập - không còn lỗi

## 🆘 Nếu vẫn lỗi

### Kiểm tra 1: Code đã upload chưa?

- Xem "Last modified" của files trong `_next/static/chunks/`
- Phải là thời gian mới nhất

### Kiểm tra 2: Browser cache

- Test bằng Incognito mode
- Hoặc xóa cache hoàn toàn
- Hoặc dùng browser khác

### Kiểm tra 3: API có hoạt động không?

- Truy cập: `https://api.websi.vn/api/categories`
- Phải trả về JSON (không phải lỗi)

## ✅ Kết quả mong đợi

Sau khi upload lại và xóa cache:
- Request gửi đến: `https://api.websi.vn/api/login`
- KHÔNG còn: `http://localhost:8000/api/login`
- Đăng nhập hoạt động bình thường
- Không còn lỗi CORS

