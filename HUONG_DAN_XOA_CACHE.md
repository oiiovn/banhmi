# Hướng dẫn xóa cache Browser và Hosting

## 1. Xóa Cache Browser

### Chrome / Edge (Windows/Linux)
1. Nhấn `Ctrl + Shift + Delete` (hoặc `Ctrl + Shift + Del`)
2. Chọn thời gian: **"Tất cả thời gian"** hoặc **"All time"**
3. Chọn các mục:
   - ✅ **"Cached images and files"** (Ảnh và tệp đã lưu)
   - ✅ **"Cookies and other site data"** (Tùy chọn, nếu muốn đăng xuất)
4. Click **"Clear data"** hoặc **"Xóa dữ liệu"**

### Chrome / Edge (Mac)
1. Nhấn `Cmd + Shift + Delete`
2. Chọn thời gian: **"All time"**
3. Chọn: ✅ **"Cached images and files"**
4. Click **"Clear data"**

### Firefox (Windows/Linux)
1. Nhấn `Ctrl + Shift + Delete`
2. Chọn thời gian: **"Everything"**
3. Chọn: ✅ **"Cache"**
4. Click **"Clear Now"**

### Firefox (Mac)
1. Nhấn `Cmd + Shift + Delete`
2. Chọn thời gian: **"Everything"**
3. Chọn: ✅ **"Cache"**
4. Click **"Clear Now"**

### Safari (Mac)
1. Nhấn `Cmd + Option + E` (xóa cache)
2. Hoặc: Safari → Preferences → Advanced → ✅ "Show Develop menu"
3. Develop → Empty Caches

### Cách nhanh nhất: Tab Ẩn danh
- **Chrome/Edge**: `Ctrl + Shift + N` (Windows) hoặc `Cmd + Shift + N` (Mac)
- **Firefox**: `Ctrl + Shift + P` (Windows) hoặc `Cmd + Shift + P` (Mac)
- **Safari**: `Cmd + Shift + N`

Tab ẩn danh không dùng cache cũ, phù hợp để test nhanh.

---

## 2. Xóa Cache trên Hosting (Mắt Bão / LiteSpeed)

### Cách 1: Qua cPanel
1. Đăng nhập **cPanel**
2. Tìm mục **"LiteSpeed Cache"** hoặc **"Cache"**
3. Click **"Purge All"** hoặc **"Xóa tất cả cache"**
4. Chờ vài giây để cache được xóa

### Cách 2: Qua File Manager
1. Đăng nhập **cPanel** → **File Manager**
2. Vào thư mục `public_html/`
3. Xóa các file/thư mục cache (nếu có):
   - `.litespeed_cache/` (nếu có)
   - `.cache/` (nếu có)
   - Các file `.htaccess` cache (nếu có)

### Cách 3: Qua SSH (nếu có quyền)
```bash
# Xóa LiteSpeed cache
rm -rf /home/username/public_html/.litespeed_cache/*

# Hoặc xóa tất cả cache
find /home/username/public_html -name "*.cache" -delete
```

### Cách 4: Xóa cache qua .htaccess
Thêm vào file `.htaccess` trong `public_html/`:
```apache
# Xóa cache cho static files
<IfModule mod_headers.c>
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires 0
</IfModule>
```

**Lưu ý**: Sau khi test xong, nên xóa hoặc comment lại để tối ưu performance.

---

## 3. Xóa Cache Cloudflare (nếu có)

1. Đăng nhập **Cloudflare Dashboard**
2. Chọn domain **websi.vn**
3. Vào **Caching** → **Configuration**
4. Click **"Purge Everything"** hoặc **"Purge All Files"**
5. Chờ vài phút để cache được xóa

---

## 4. Kiểm tra sau khi xóa cache

### Kiểm tra trong Browser Console
1. Mở website: `https://websi.vn/login`
2. Nhấn **F12** → Tab **Console**
3. Xem log: **"🌐 API URL đang dùng:"**
4. Phải hiển thị: `https://api.websi.vn/api` (KHÔNG phải `localhost:8000`)

### Kiểm tra Network Tab
1. Nhấn **F12** → Tab **Network**
2. Refresh trang (F5)
3. Tìm request đến API (ví dụ: `/api/login`)
4. Xem **Request URL** phải là: `https://api.websi.vn/api/login`

### Kiểm tra Source Code
1. Nhấn **F12** → Tab **Sources** hoặc **Network**
2. Tìm file JavaScript trong `_next/static/chunks/`
3. Search: `api.websi.vn` → Phải tìm thấy
4. Search: `localhost:8000` → Chỉ tìm thấy trong logic detect local

---

## 5. Checklist sau khi upload code mới

- [ ] Upload toàn bộ nội dung `out/` lên `public_html/`
- [ ] Xóa cache browser (Ctrl+Shift+Delete)
- [ ] Xóa cache hosting (LiteSpeed Cache)
- [ ] Xóa cache Cloudflare (nếu có)
- [ ] Mở tab ẩn danh để test
- [ ] Kiểm tra Console log API URL
- [ ] Test đăng nhập và các chức năng

---

## 6. Troubleshooting

### Vẫn thấy lỗi `localhost:8000`?

1. **Kiểm tra code mới đã upload chưa:**
   - Xem thời gian modified của file trong `public_html/_next/`
   - Phải là thời gian mới nhất (vừa upload)

2. **Hard refresh browser:**
   - **Windows/Linux**: `Ctrl + F5` hoặc `Ctrl + Shift + R`
   - **Mac**: `Cmd + Shift + R`

3. **Xóa cache thủ công:**
   - Chrome: `chrome://settings/clearBrowserData`
   - Firefox: `about:preferences#privacy` → Clear Data

4. **Kiểm tra file `.htaccess`:**
   - Đảm bảo có file `.htaccess` trong `public_html/`
   - Nội dung phải có rewrite rules cho Next.js

5. **Test với curl (nếu có SSH):**
   ```bash
   curl -I https://websi.vn/
   # Xem header Cache-Control
   ```

---

## 7. Lưu ý quan trọng

- ⚠️ **Sau khi xóa cache, website có thể chậm hơn lần đầu** (do phải load lại từ server)
- ✅ **Nên test trên tab ẩn danh trước** để tránh ảnh hưởng đến cache hiện tại
- 🔄 **Nếu vẫn lỗi, đợi 5-10 phút** rồi thử lại (cache có thể chưa clear hết)
- 📱 **Test trên nhiều browser** để đảm bảo không phải do cache của browser cụ thể
