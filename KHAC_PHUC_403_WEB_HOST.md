# 🔧 Khắc Phục Lỗi 403 - Web Trên Host

## ❌ Vấn đề hiện tại

- Web không hoạt động trên host
- Lỗi 403 Forbidden
- Đã upload code nhưng không chạy được

## 🎯 Giải pháp: Dùng Static Export (Không cần Node.js)

Vì hosting có thể không có Node.js, chúng ta sẽ dùng static export.

### Bước 1: Sửa next.config.js để static export

**File:** `web/next.config.js`

**Sửa thành:**
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // ← Bật static export
  images: {
    unoptimized: true, // ← Cần cho static export
    domains: [
      'localhost',
      ...(process.env.NEXT_PUBLIC_IMAGE_DOMAINS 
        ? process.env.NEXT_PUBLIC_IMAGE_DOMAINS.split(',') 
        : [])
    ],
  },
  // Bỏ qua dynamic routes khi export
  trailingSlash: true,
}

module.exports = withPWA(nextConfig)
```

### Bước 2: Sửa dynamic route để tương thích static export

**File:** `web/app/payments/[id]/page.tsx`

**Thêm vào đầu file (sau imports):**
```typescript
// For static export compatibility
export const dynamic = 'force-static'
export const dynamicParams = true
```

**Hoặc tạo file:** `web/app/payments/[id]/route.ts` (tạm thời để bypass)

### Bước 3: Build lại

```bash
cd web
npm run build
```

**Kết quả:** Sẽ tạo thư mục `web/out/` (không phải `.next/`)

### Bước 4: Upload lên host

**Upload toàn bộ nội dung** trong `web/out/` lên:
```
domains/websi.vn/public_html/
```

**Cấu trúc sau khi upload:**
```
public_html/
├── index.html          ← Phải có
├── _next/              ← Phải có
│   └── static/
├── payments/           ← Dynamic routes
│   └── [id]/
│       └── index.html
└── ... (các file khác)
```

### Bước 5: Tạo file .htaccess

**File:** `public_html/.htaccess`

**Nội dung:**
```apache
RewriteEngine On
RewriteBase /

# Handle Next.js routing
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
</IfModule>
```

### Bước 6: Set permissions

```bash
chmod -R 755 public_html/
```

## 🔄 Giải pháp thay thế: Tạm thời bỏ route payments/[id]

Nếu vẫn lỗi, có thể tạm thời:

1. **Đổi tên thư mục:**
   - Đổi `app/payments/[id]/` thành `app/payments/_id/` (tạm thời)
   - Hoặc comment route này

2. **Build lại:**
   ```bash
   npm run build
   ```

3. **Upload lại**

## 🧪 Test sau khi upload

1. **Truy cập:** `websi.vn`
2. **Kiểm tra Console (F12):** Xem có lỗi không
3. **Test các route:**
   - `/login`
   - `/register`
   - `/orders`

## 🆘 Nếu vẫn 403

### Kiểm tra 1: File index.html

**Qua File Manager:**
- Xem có file `index.html` trong `public_html/` không
- File có kích thước > 0 không

### Kiểm tra 2: Permissions

```bash
chmod -R 755 public_html/
chmod 644 public_html/index.html
```

### Kiểm tra 3: Document Root

**Trong cPanel:**
- Domain Setup → Xem Document Root
- Phải trỏ đến `public_html/`

### Kiểm tra 4: .htaccess

- File `.htaccess` có trong `public_html/` không
- Nội dung có đúng không

## ✅ Checklist

- [ ] Đã sửa `next.config.js` với `output: 'export'`
- [ ] Đã sửa `images: { unoptimized: true }`
- [ ] Đã build: `npm run build`
- [ ] Đã upload toàn bộ từ `out/` lên `public_html/`
- [ ] Đã tạo file `.htaccess`
- [ ] Đã set permissions: `755`
- [ ] Đã kiểm tra Document Root
- [ ] Đã test: `websi.vn`

