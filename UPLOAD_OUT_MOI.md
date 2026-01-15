# 📤 Upload lại thư mục out mới lên hosting

## ✅ Đã hoàn thành

Code đã được cập nhật và build lại thành công! Thư mục `web/out/` đã chứa code mới với logic **tự động detect API URL** dựa trên domain hiện tại.

## 🚀 Các bước upload

### 1. Upload thư mục out lên hosting

Upload **toàn bộ nội dung** trong thư mục `web/out/` lên thư mục public_html trên hosting của bạn.

**Lưu ý**: Upload **nội dung bên trong** thư mục `out/`, không phải upload cả thư mục `out/`.

Ví dụ:
- Local: `web/out/index.html`, `web/out/_next/`, v.v.
- Hosting: `public_html/index.html`, `public_html/_next/`, v.v.

### 2. Kiểm tra file .htaccess

Đảm bảo có file `.htaccess` trong `public_html/` với nội dung:

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### 3. Set permissions (nếu cần)

```bash
chmod -R 755 public_html/
```

## 🔍 Cách code mới hoạt động

Code mới sẽ **tự động detect API URL** dựa trên domain hiện tại:

### Trường hợp 1: API ở subdomain `api.domain.com`
- Nếu web ở: `https://example.com` hoặc `https://www.example.com`
- API sẽ tự động detect là: `https://api.example.com/api`
- ✅ **Không cần cấu hình gì thêm**

### Trường hợp 2: API ở cùng domain
- Nếu web ở: `https://example.com`
- API ở: `https://example.com/api`
- ❌ Cần cấu hình thủ công (xem bên dưới)

### Trường hợp 3: API ở domain khác
- Nếu web ở: `https://example.com`
- API ở: `https://api-different.com/api`
- ❌ Cần cấu hình thủ công (xem bên dưới)

## ⚙️ Nếu API không ở subdomain `api.domain.com`

Nếu API của bạn **không** ở subdomain `api.{domain}`, bạn cần:

1. **Tạo file `.env.production`** trong thư mục `web/`:
   ```bash
   cd web
   echo "NEXT_PUBLIC_API_URL=https://your-actual-api-url.com/api" > .env.production
   ```

2. **Build lại**:
   ```bash
   npm run build
   ```

3. **Upload lại** thư mục `out/` lên hosting

## 🧪 Kiểm tra sau khi upload

1. Mở web trên hosting
2. Mở Console browser (F12)
3. Thử đăng nhập
4. Kiểm tra Network tab để xem API URL đang được dùng

Trong development mode, sẽ có log hiển thị API URL:
```
API URL: https://api.example.com/api
```

## 📝 Lưu ý

- Code mới đã được build và sẵn sàng upload
- Logic tự động detect sẽ hoạt động với hầu hết các trường hợp (API ở subdomain `api.{domain}`)
- Nếu vẫn gặp lỗi, kiểm tra Console browser để xem API URL đang được detect là gì
- Đảm bảo API trên hosting đã được cấu hình CORS để cho phép domain web gọi API
