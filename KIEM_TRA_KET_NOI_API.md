# 🔍 Kiểm Tra Kết Nối API

## ✅ Tình trạng hiện tại

- ✅ Web frontend (`websi.vn`) đang hoạt động
- ⚠️ Có thể API chưa kết nối được
- ❌ Lỗi đăng nhập: "Email hoặc mật khẩu không đúng"

## 🧪 Các bước kiểm tra

### Bước 1: Kiểm tra API có hoạt động không

**Mở browser và truy cập:**
```
https://api.websi.vn/api/categories
```

**Hoặc test bằng curl:**
```bash
curl https://api.websi.vn/api/categories
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "data": [...]
}
```

**Nếu lỗi:**
- ❌ DNS chưa propagate → Đợi thêm hoặc dùng IP
- ❌ 500 Internal Server Error → API chưa setup đúng
- ❌ 404 Not Found → Route chưa đúng

### Bước 2: Kiểm tra cấu hình API URL trong Web

**File cần kiểm tra:** `web/.env.production` hoặc `.env.local`

**Nội dung phải có:**
```env
NEXT_PUBLIC_API_URL=https://api.websi.vn/api
```

**Nếu chưa có file này:**
1. Tạo file `.env.production` trong thư mục `web/`
2. Thêm dòng trên
3. **Restart Next.js server** (nếu đang chạy)

### Bước 3: Kiểm tra Console Browser

1. **Mở trang login:** `websi.vn/login`
2. **Mở Developer Tools:** F12 hoặc Ctrl+Shift+I
3. **Vào tab Console**
4. **Thử đăng nhập**
5. **Xem lỗi:**

**Các lỗi có thể gặp:**

**Lỗi CORS:**
```
Access to XMLHttpRequest at 'https://api.websi.vn/api/login' 
from origin 'https://websi.vn' has been blocked by CORS policy
```
→ **Giải pháp:** Kiểm tra CORS trong `api/config/cors.php`

**Lỗi Network:**
```
Network Error
ERR_NETWORK
```
→ **Giải pháp:** API chưa hoạt động hoặc URL sai

**Lỗi 404:**
```
404 Not Found
```
→ **Giải pháp:** API URL sai hoặc route không tồn tại

**Lỗi 500:**
```
500 Internal Server Error
```
→ **Giải pháp:** API có lỗi, kiểm tra log

### Bước 4: Kiểm tra Network Tab

1. **Mở Developer Tools** → Tab **Network**
2. **Thử đăng nhập**
3. **Tìm request đến `/api/login`**
4. **Xem:**
   - **Status:** Phải là 200 (success)
   - **Request URL:** Phải là `https://api.websi.vn/api/login`
   - **Response:** Xem nội dung trả về

## 🔧 Các vấn đề thường gặp

### Vấn đề 1: API chưa được setup

**Triệu chứng:**
- Lỗi 500 hoặc 404 khi truy cập `api.websi.vn/api/categories`
- Console hiển thị Network Error

**Giải pháp:**
1. Kiểm tra đã giải nén code chưa
2. Kiểm tra đã tạo `.env` chưa
3. Kiểm tra đã chạy `composer install` chưa
4. Kiểm tra đã chạy migrations chưa
5. Xem file `SETUP_SAU_KHI_TAO_SUBDOMAIN.md`

### Vấn đề 2: API URL sai trong Web

**Triệu chứng:**
- Console hiển thị request đến URL sai
- Network tab cho thấy request đến localhost

**Giải pháp:**
1. Kiểm tra file `.env.production` trong `web/`
2. Đảm bảo có: `NEXT_PUBLIC_API_URL=https://api.websi.vn/api`
3. **Restart Next.js server**
4. Clear browser cache

### Vấn đề 3: CORS chưa cấu hình

**Triệu chứng:**
- Console hiển thị lỗi CORS
- Network tab cho thấy request bị block

**Giải pháp:**
1. Kiểm tra file `api/config/cors.php`
2. Đảm bảo có:
   ```php
   'allowed_origins' => [
       'https://websi.vn',
       'https://www.websi.vn',
   ],
   ```
3. Kiểm tra file `api/.env`:
   ```env
   CORS_ALLOWED_ORIGINS=https://websi.vn,https://www.websi.vn
   ```
4. Clear cache: `php artisan config:clear`

### Vấn đề 4: Database chưa có dữ liệu

**Triệu chứng:**
- API hoạt động nhưng đăng nhập không được
- Response: "Email hoặc mật khẩu không đúng"

**Giải pháp:**
1. Kiểm tra đã chạy migrations chưa:
   ```bash
   php artisan migrate --force
   ```
2. Kiểm tra đã chạy seeder chưa:
   ```bash
   php artisan db:seed --class=AdminSeeder --force
   ```
3. Tài khoản mặc định:
   - Admin: `admin@banhmi.com` / `admin123`
   - Agent: `agent1@banhmi.com` / `agent123`

### Vấn đề 5: DNS chưa propagate

**Triệu chứng:**
- Không truy cập được `api.websi.vn`
- DNS_PROBE_FINISHED_NXDOMAIN

**Giải pháp:**
1. Đợi thêm 5-30 phút
2. Hoặc test bằng IP (sửa hosts file)
3. Kiểm tra DNS: https://www.whatsmydns.net/#A/api.websi.vn

## 🧪 Test nhanh

### Test 1: API có hoạt động?
```
https://api.websi.vn/api/categories
```

### Test 2: API có trả về JSON?
Mở browser → F12 → Console → Gõ:
```javascript
fetch('https://api.websi.vn/api/categories')
  .then(r => r.json())
  .then(console.log)
```

### Test 3: Web có kết nối được API?
Mở `websi.vn` → F12 → Console → Xem có lỗi không

### Test 4: Test đăng nhập trực tiếp
Mở browser → F12 → Console → Gõ:
```javascript
fetch('https://api.websi.vn/api/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'admin@banhmi.com',
    password: 'admin123'
  })
})
.then(r => r.json())
.then(console.log)
```

## ✅ Checklist

- [ ] API hoạt động: `https://api.websi.vn/api/categories` trả về JSON
- [ ] Web có file `.env.production` với `NEXT_PUBLIC_API_URL` đúng
- [ ] CORS đã cấu hình đúng trong `api/config/cors.php`
- [ ] Database đã có dữ liệu (đã chạy migrations và seeders)
- [ ] DNS đã propagate (có thể truy cập `api.websi.vn`)
- [ ] Console browser không có lỗi CORS
- [ ] Network tab cho thấy request đến đúng URL

## 🆘 Nếu vẫn không được

1. **Kiểm tra API log:**
   - Xem file log trong `api/storage/logs/laravel.log`
   - Hoặc xem error log trong cPanel

2. **Kiểm tra Web log:**
   - Xem console browser
   - Xem network tab

3. **Test API trực tiếp:**
   - Dùng Postman hoặc curl
   - Test từng endpoint

4. **Liên hệ support:**
   - Nếu không có SSH
   - Nếu không thể cài composer


