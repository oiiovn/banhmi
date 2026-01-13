# 🚀 Hướng Dẫn Deploy Web Lên websi.vn

## ❌ Lỗi 403 Forbidden - Giải pháp

### Nguyên nhân:
- Next.js chưa được build
- File chưa được upload đúng
- Hosting không có Node.js (cần static export)

## 🎯 Có 2 cách deploy

### Cách 1: Static Export (Khuyến nghị cho shared hosting)

**Ưu điểm:**
- ✅ Không cần Node.js trên hosting
- ✅ Dễ deploy
- ✅ Nhanh

**Nhược điểm:**
- ❌ Không có Server-Side Rendering (SSR)
- ❌ Không có API Routes

**Các bước:**

#### 1. Sửa `next.config.js`:

Mở file `web/next.config.js` và sửa:

```javascript
const nextConfig = {
  reactStrictMode: true,
  output: 'export',  // ← Thêm dòng này
  images: {
    unoptimized: true,  // ← Thêm dòng này
    domains: [
      'localhost',
      ...(process.env.NEXT_PUBLIC_IMAGE_DOMAINS 
        ? process.env.NEXT_PUBLIC_IMAGE_DOMAINS.split(',') 
        : [])
    ],
  },
}
```

#### 2. Build:

```bash
cd web
npm run build
```

**Kết quả:** Sẽ tạo thư mục `web/out/` chứa các file static

#### 3. Upload:

Upload **toàn bộ nội dung** trong thư mục `web/out/` lên:
```
domains/websi.vn/public_html/
```

**Cấu trúc sau khi upload:**
```
public_html/
├── index.html
├── _next/
├── favicon.ico
└── ... (các file khác)
```

#### 4. Tạo file `.htaccess`:

Tạo file `public_html/.htaccess`:

```apache
# Enable Rewrite Engine
RewriteEngine On

# Redirect to index.html for SPA
RewriteBase /
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

#### 5. Set permissions:

```bash
chmod -R 755 public_html/
```

---

### Cách 2: Node.js Server (Nếu hosting có Node.js)

**Ưu điểm:**
- ✅ Có SSR
- ✅ Có API Routes
- ✅ Tối ưu hơn

**Nhược điểm:**
- ❌ Cần Node.js trên hosting
- ❌ Phức tạp hơn

**Các bước:**

#### 1. Upload toàn bộ thư mục `web/` lên server

#### 2. SSH vào server:

```bash
cd domains/websi.vn/web
npm install --production
npm run build
```

#### 3. Chạy server:

```bash
npm start
# Hoặc dùng PM2:
pm2 start npm --name "banhmi-web" -- start
```

#### 4. Cấu hình Nginx/Apache:

**Nginx:**
```nginx
server {
    listen 80;
    server_name websi.vn www.websi.vn;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔧 Khắc phục lỗi 403

### Kiểm tra nhanh:

1. **Tạo file test:**
   - Tạo `public_html/test.html` với nội dung: `<h1>Test</h1>`
   - Truy cập: `websi.vn/test.html`
   - Nếu hiển thị → Server OK, vấn đề là Next.js
   - Nếu vẫn 403 → Vấn đề permissions/Document Root

2. **Kiểm tra permissions:**
   ```bash
   chmod -R 755 public_html/
   ```

3. **Kiểm tra Document Root:**
   - Vào cPanel → Domain Setup
   - Xem Document Root có trỏ đến `public_html/` không

4. **Kiểm tra file index:**
   - Phải có file `index.html` trong `public_html/`
   - Nếu chưa có → Next.js chưa được build hoặc upload sai

## ✅ Checklist

- [ ] Đã sửa `next.config.js` (nếu dùng static export)
- [ ] Đã build: `npm run build`
- [ ] Đã upload file từ `out/` lên `public_html/`
- [ ] Đã tạo file `.htaccess`
- [ ] Đã set permissions: `755`
- [ ] Đã kiểm tra Document Root
- [ ] Đã test: `websi.vn`

## 🧪 Test

Sau khi deploy:

1. **Truy cập:** `https://websi.vn`
2. **Kiểm tra Console (F12):** Xem có lỗi không
3. **Test đăng nhập:** Xem có kết nối được API không

## 🆘 Nếu vẫn lỗi

1. **Kiểm tra error log trong cPanel**
2. **Tạo file test đơn giản để xác định vấn đề**
3. **Liên hệ support hosting để hỏi:**
   - Có Node.js không?
   - Document Root ở đâu?
   - Permissions như thế nào?

