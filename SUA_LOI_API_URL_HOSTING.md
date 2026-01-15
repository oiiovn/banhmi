# 🔧 Sửa lỗi "Không thể kết nối đến server" trên Hosting

## Vấn đề

Khi deploy web lên hosting, bạn gặp lỗi: **"Không thể kết nối đến server. Vui lòng kiểm tra API đang chạy tại http://localhost:8000"**

## Nguyên nhân

Web đang cố kết nối đến `localhost:8000` thay vì URL API thực tế trên hosting.

## Giải pháp

### Cách 1: Cấu hình qua biến môi trường (Khuyến nghị)

Khi build web cho hosting, cần set biến môi trường `NEXT_PUBLIC_API_URL`:

#### Nếu build trên máy local:

```bash
cd web
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api npm run build
```

Hoặc tạo file `.env.production`:

```bash
cd web
echo "NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api" > .env.production
npm run build
```

#### Nếu build trên hosting:

1. Tạo file `.env.production` trong thư mục `web/`:

```bash
cd web
nano .env.production
```

2. Thêm nội dung (thay `yourdomain.com` bằng domain thực tế của bạn):

```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

3. Build lại:

```bash
npm run build
```

### Cách 2: Tự động detect (Đã được cập nhật)

Code đã được cập nhật để tự động detect API URL dựa trên domain hiện tại:

- Nếu web ở `example.com` → API sẽ tự động detect là `https://api.example.com/api`
- Nếu web ở `www.example.com` → API sẽ tự động detect là `https://api.example.com/api`
- Nếu web ở `api.example.com` → API sẽ dùng cùng domain `https://api.example.com/api`

**Lưu ý**: Cách này chỉ hoạt động nếu API của bạn ở subdomain `api.{domain}`. Nếu API ở vị trí khác, cần dùng Cách 1.

### Cách 3: Sửa trực tiếp trong code (Không khuyến nghị)

Nếu cần sửa nhanh, có thể sửa file `web/lib/config.ts`:

```typescript
// Thay đổi dòng 44 (default fallback)
return 'https://api.yourdomain.com/api' // Thay yourdomain.com bằng domain thực tế
```

**Lưu ý**: Cách này không linh hoạt, cần sửa lại mỗi khi deploy lên domain khác.

## Kiểm tra cấu trúc API trên hosting

### Trường hợp 1: API ở subdomain
- Web: `https://example.com`
- API: `https://api.example.com/api`
- ✅ Tự động detect sẽ hoạt động

### Trường hợp 2: API ở cùng domain
- Web: `https://example.com`
- API: `https://example.com/api`
- ❌ Cần cấu hình thủ công qua biến môi trường

### Trường hợp 3: API ở domain khác
- Web: `https://example.com`
- API: `https://api-different.com/api`
- ❌ Cần cấu hình thủ công qua biến môi trường

## Các bước thực hiện

1. **Xác định URL API thực tế trên hosting**
   - Ví dụ: `https://api.yourdomain.com/api`
   - Hoặc: `https://yourdomain.com/api`

2. **Tạo file `.env.production` trong thư mục `web/`**
   ```bash
   cd web
   echo "NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api" > .env.production
   ```

3. **Build lại web**
   ```bash
   npm run build
   ```

4. **Deploy lại file build lên hosting**

5. **Kiểm tra lại**
   - Mở web trên hosting
   - Thử đăng nhập
   - Kiểm tra console browser (F12) để xem API URL đang được dùng

## Debug

Để kiểm tra API URL đang được dùng, mở Console browser (F12) và xem:

```javascript
// Trong development mode, sẽ có log:
// API URL: https://api.yourdomain.com/api
```

Hoặc kiểm tra Network tab để xem request đang gửi đến URL nào.

## Lưu ý

- Biến môi trường `NEXT_PUBLIC_API_URL` phải được set **trước khi build**, không thể thay đổi sau khi build
- Nếu đã build rồi, cần build lại với biến môi trường mới
- Đảm bảo API trên hosting đã được cấu hình CORS để cho phép domain web gọi API
