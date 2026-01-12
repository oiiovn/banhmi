# 🔧 Đã sửa lỗi Network Error khi đăng ký

## ✅ Các thay đổi đã thực hiện

### 1. Cập nhật CORS Configuration
- **File**: `api/config/cors.php`
- **Thay đổi**: Thêm `http://localhost:3002` vào `allowed_origins`
- **Lý do**: Web đang chạy trên port 3002 nhưng CORS chỉ cho phép 3000 và 3001

### 2. Cải thiện xử lý lỗi
- **Files**: 
  - `web/app/register/page.tsx`
  - `web/app/login/page.tsx`
- **Thay đổi**: Thêm xử lý riêng cho lỗi Network Error với thông báo rõ ràng

### 3. Restart API Server
- Đã restart Laravel API server để áp dụng CORS config mới

## 🧪 Kiểm tra

1. **Kiểm tra API đang chạy:**
   ```bash
   curl http://localhost:8000/api/categories
   ```

2. **Kiểm tra CORS:**
   ```bash
   curl -X OPTIONS http://localhost:8000/api/register \
     -H "Origin: http://localhost:3002" \
     -H "Access-Control-Request-Method: POST" \
     -v
   ```

3. **Test đăng ký:**
   - Truy cập: http://localhost:3002/register
   - Điền form và submit
   - Nếu vẫn lỗi, mở Console (F12) để xem chi tiết

## 🐛 Troubleshooting

### Nếu vẫn gặp Network Error:

1. **Kiểm tra API server:**
   ```bash
   lsof -ti:8000
   # Nếu không có output, chạy:
   cd api && php artisan serve
   ```

2. **Kiểm tra CORS config:**
   - Mở `api/config/cors.php`
   - Đảm bảo có `http://localhost:3002` trong `allowed_origins`

3. **Kiểm tra browser console:**
   - Mở DevTools (F12)
   - Xem tab Console và Network
   - Kiểm tra request có bị block không

4. **Kiểm tra .env.local:**
   - Đảm bảo `NEXT_PUBLIC_API_URL=http://localhost:8000/api`

5. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) hoặc Cmd+Shift+R (Mac)

## 📝 Lưu ý

- API phải chạy trên port 8000
- Web phải chạy trên port 3002 (hoặc cập nhật CORS nếu dùng port khác)
- CORS chỉ áp dụng khi có request từ browser (không áp dụng với curl)




