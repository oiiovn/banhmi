# 🔧 Hướng Dẫn Sửa Trên Host - API URL

## ✅ Code đã được sửa và build lại

Code đã được sửa để tự động dùng `https://api.websi.vn/api` khi chạy trên production.

## 📦 Cách 1: Upload lại toàn bộ (Khuyến nghị - Đơn giản nhất)

### Bước 1: Upload lại từ local

1. **Trên máy local:** Thư mục `web/out/` đã được build lại với code mới
2. **Qua File Manager hoặc FTP:**
   - Xóa tất cả files/folders trong `public_html/` (trừ `cgi-bin/` và `.htaccess`)
   - Upload toàn bộ nội dung từ `web/out/` lên `public_html/`

### Bước 2: Kiểm tra

1. Truy cập: `websi.vn/login`
2. Hard refresh: `Ctrl + Shift + R` (hoặc `Cmd + Shift + R`)
3. Test đăng nhập

## 📝 Cách 2: Chỉ sửa file JavaScript (Nếu không muốn upload lại toàn bộ)

### Bước 1: Tìm file cần sửa

**Qua File Manager:**
1. Vào `public_html/_next/static/chunks/`
2. Tìm các file `.js` mới nhất (thường có tên như `fd9d1056-*.js` hoặc tương tự)
3. Xem "Last modified" - file nào có thời gian mới nhất

### Bước 2: Upload file mới

1. **Trên máy local:** Copy các file từ `web/out/_next/static/chunks/`
2. **Upload lên host:** Thay thế các file cũ trong `public_html/_next/static/chunks/`

### Bước 3: Xóa cache

1. Hard refresh: `Ctrl + Shift + R`
2. Hoặc xóa cache browser

## 🔍 Cách 3: Sửa trực tiếp trên host (Không khuyến nghị - Phức tạp)

**Nếu muốn sửa trực tiếp trên host:**

### Tìm và sửa file JavaScript

1. **Vào:** `public_html/_next/static/chunks/`
2. **Tìm file:** Có chứa `localhost:8000` (thường là file lớn nhất, khoảng 50-60KB)
3. **Mở file bằng Editor** trong File Manager
4. **Tìm và thay thế:**
   - Tìm: `http://localhost:8000/api`
   - Thay bằng: `https://api.websi.vn/api`
5. **Save** file

**Lưu ý:** Cách này phức tạp và dễ lỗi. Khuyến nghị dùng Cách 1.

## ✅ Kiểm tra sau khi sửa

1. **Mở website:** `websi.vn/login`
2. **Mở Console (F12):** Xem Network tab
3. **Thử đăng nhập:** Xem request có gửi đến `https://api.websi.vn/api` không
4. **Kiểm tra:** Không còn lỗi "Cannot connect to server"

## 🆘 Nếu vẫn lỗi

### Kiểm tra 1: Cache browser

- Hard refresh: `Ctrl + Shift + R` (Windows) hoặc `Cmd + Shift + R` (Mac)
- Hoặc xóa cache browser hoàn toàn
- Hoặc test bằng Incognito/Private mode

### Kiểm tra 2: File đã upload đúng chưa

- Xem "Last modified" của các file trong `_next/static/chunks/`
- Phải là thời gian mới nhất (sau khi build)

### Kiểm tra 3: API có hoạt động không

- Truy cập: `https://api.websi.vn/api/categories`
- Phải trả về JSON (không phải lỗi)

## 📋 Tóm tắt

**Cách đơn giản nhất:**
1. Upload lại toàn bộ từ `web/out/` lên `public_html/`
2. Hard refresh browser
3. Test lại

**Code đã được sửa và build lại sẵn!** Chỉ cần upload lại là xong.

