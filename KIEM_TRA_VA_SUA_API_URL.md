# 🔍 Kiểm tra và sửa lỗi API URL

## ✅ Đã cập nhật

1. **Code mới đã được build** - Thư mục `web/out/` đã có code mới
2. **Logic detect API URL** - Bây giờ sẽ thử cùng domain `websi.vn/api` thay vì subdomain
3. **Console log** - Sẽ hiển thị API URL đang được dùng trong Console browser

## 📤 Bước 1: Upload lại thư mục out

1. **Xóa toàn bộ** nội dung trong `public_html/` trên hosting (trừ `.htaccess` nếu muốn giữ)

2. **Upload lại** toàn bộ nội dung trong `web/out/` lên `public_html/`

3. **Đảm bảo** cấu trúc đúng:
   ```
   public_html/
     ├── index.html
     ├── _next/
     ├── admin/
     ├── login/
     └── ...
   ```

## 🔍 Bước 2: Kiểm tra API URL đang được dùng

1. **Mở website**: `https://websi.vn`
2. **Mở Console browser** (F12 → Console tab)
3. **Thử đăng nhập** hoặc làm bất kỳ action nào
4. **Xem log** trong Console - sẽ có dòng:
   ```
   🌐 API URL đang dùng: https://websi.vn/api
   ```
   (hoặc URL khác tùy vào detect)

## ⚙️ Bước 3: Xác định API URL thực tế

Bạn cần biết API của bạn đang ở đâu:

### Trường hợp A: API ở cùng domain
- URL: `https://websi.vn/api`
- ✅ Code mới sẽ tự động detect đúng

### Trường hợp B: API ở subdomain
- URL: `https://api.websi.vn/api`
- ❌ Cần cấu hình thủ công (xem bên dưới)

### Trường hợp C: API ở domain khác
- URL: `https://api-different.com/api`
- ❌ Cần cấu hình thủ công (xem bên dưới)

## 🔧 Bước 4: Cấu hình API URL thủ công (nếu cần)

Nếu API không ở `websi.vn/api`, bạn cần:

1. **Xác định API URL thực tế**:
   - Thử truy cập: `https://api.websi.vn/api/categories`
   - Hoặc: `https://websi.vn/api/categories`
   - Xem URL nào trả về dữ liệu

2. **Tạo file `.env.production`** trong thư mục `web/`:
   ```bash
   cd web
   echo "NEXT_PUBLIC_API_URL=https://api.websi.vn/api" > .env.production
   # Hoặc nếu API ở cùng domain:
   # echo "NEXT_PUBLIC_API_URL=https://websi.vn/api" > .env.production
   ```

3. **Build lại**:
   ```bash
   npm run build
   ```

4. **Upload lại** thư mục `out/` lên hosting

## 🧪 Bước 5: Test API trực tiếp

Để kiểm tra API có hoạt động không, thử truy cập trực tiếp:

```bash
# Thử subdomain
curl https://api.websi.vn/api/categories

# Thử cùng domain
curl https://websi.vn/api/categories
```

Hoặc mở trong browser:
- `https://api.websi.vn/api/categories`
- `https://websi.vn/api/categories`

URL nào trả về dữ liệu JSON thì đó là API URL đúng.

## 📝 Checklist

- [ ] Đã upload lại thư mục `out/` mới
- [ ] Đã mở Console browser và xem API URL đang được dùng
- [ ] Đã xác định API URL thực tế
- [ ] Đã cấu hình `.env.production` nếu cần
- [ ] Đã build lại và upload lại nếu cần
- [ ] Đã test đăng nhập và không còn lỗi

## 🐛 Nếu vẫn lỗi

1. **Kiểm tra Console browser**:
   - Xem API URL đang được dùng là gì
   - Xem có lỗi CORS không
   - Xem có lỗi 404 không

2. **Kiểm tra Network tab**:
   - Xem request đang gửi đến URL nào
   - Xem response là gì

3. **Kiểm tra API trực tiếp**:
   - Thử truy cập API URL trong browser
   - Xem có trả về dữ liệu không

4. **Gửi thông tin**:
   - API URL đang được dùng (từ Console)
   - API URL thực tế (từ test trực tiếp)
   - Lỗi cụ thể (từ Console/Network)
