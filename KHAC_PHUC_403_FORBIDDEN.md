# 🔧 Khắc Phục Lỗi 403 Forbidden - websi.vn

## ❌ Lỗi hiện tại

**403 Forbidden** - "Access to this resource on the server is denied!"

## 🔍 Nguyên nhân thường gặp

1. **File index không có hoặc sai tên**
2. **Permissions sai**
3. **Document Root chưa đúng**
4. **Next.js chưa được build hoặc chưa setup đúng**
5. **.htaccess chưa có hoặc sai**

## 🔧 Các bước khắc phục

### Bước 1: Kiểm tra cấu trúc file

**Kiểm tra trong File Manager:**
```
domains/websi.vn/
└── public_html/
    ├── index.html          ← Phải có
    ├── .next/              ← Phải có (sau khi build)
    └── ...
```

**Nếu chưa có:**
- Next.js chưa được build
- Hoặc file chưa được upload đúng

### Bước 2: Build Next.js (nếu chưa build)

**Trên máy local:**
```bash
cd web
npm install
npm run build
```

**Sau khi build, bạn sẽ có thư mục `.next/`**

### Bước 3: Upload file đúng cách

**Có 2 cách deploy Next.js:**

#### Cách 1: Static Export (Đơn giản nhất)

**1. Cấu hình `next.config.js`:**
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

module.exports = withPWA(nextConfig)
```

**2. Build:**
```bash
cd web
npm run build
```

**3. Upload:**
- Upload toàn bộ nội dung trong thư mục `web/out/` lên `public_html/`
- Hoặc upload thư mục `.next/` và các file cần thiết

#### Cách 2: Node.js Server (Cần Node.js trên hosting)

**1. Upload toàn bộ thư mục `web/` lên server**

**2. Cài dependencies trên server:**
```bash
cd domains/websi.vn/web
npm install --production
```

**3. Build:**
```bash
npm run build
```

**4. Chạy server:**
```bash
npm start
```

**5. Cấu hình Nginx/Apache để proxy đến Node.js**

### Bước 4: Kiểm tra file index

**Tạo file `public_html/index.html` tạm thời để test:**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test</title>
</head>
<body>
    <h1>Web đang hoạt động!</h1>
</body>
</html>
```

**Nếu file này hiển thị được → Vấn đề là Next.js chưa setup đúng**

### Bước 5: Kiểm tra permissions

**Qua File Manager:**
1. Chọn thư mục `public_html/`
2. Click "Permissions" hoặc "Change Permissions"
3. Set: `755` (rwxr-xr-x)
4. Apply recursively

**Qua SSH:**
```bash
chmod -R 755 /domains/websi.vn/public_html
```

### Bước 6: Kiểm tra .htaccess

**Tạo file `public_html/.htaccess`:**

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

### Bước 7: Kiểm tra Document Root

**Trong cPanel:**
1. Vào **Subdomains** hoặc **Domain Setup**
2. Kiểm tra Document Root của `websi.vn`
3. Phải trỏ đến: `/domains/websi.vn/public_html`

## 🎯 Giải pháp nhanh nhất

### Nếu hosting KHÔNG có Node.js:

**1. Sửa `next.config.js` để export static:**
```javascript
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // ... rest of config
}
```

**2. Build:**
```bash
cd web
npm run build
```

**3. Upload:**
- Upload toàn bộ nội dung trong `web/out/` lên `public_html/`

### Nếu hosting CÓ Node.js:

**1. Upload toàn bộ thư mục `web/` lên server**

**2. SSH vào server:**
```bash
cd domains/websi.vn/web
npm install --production
npm run build
npm start
```

**3. Cấu hình Nginx/Apache proxy:**
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

## 🧪 Test từng bước

### Test 1: File index.html đơn giản
- Tạo file `index.html` đơn giản
- Nếu hiển thị → Server hoạt động
- Nếu vẫn 403 → Vấn đề permissions hoặc Document Root

### Test 2: Kiểm tra permissions
```bash
ls -la public_html/
# Phải thấy: drwxr-xr-x
```

### Test 3: Kiểm tra Document Root
- Vào cPanel → Domain Setup
- Xem Document Root có đúng không

## ✅ Checklist

- [ ] Đã build Next.js: `npm run build`
- [ ] Đã upload file đúng vị trí
- [ ] Permissions đã set đúng (755)
- [ ] Document Root trỏ đúng
- [ ] File `.htaccess` đã có (nếu dùng static export)
- [ ] Node.js đang chạy (nếu dùng server mode)
- [ ] Nginx/Apache đã cấu hình proxy (nếu dùng server mode)

## 🆘 Nếu vẫn không được

1. **Liên hệ support hosting:**
   - Hỏi về Node.js có sẵn không
   - Hỏi về cách deploy Next.js
   - Hỏi về Document Root

2. **Kiểm tra error log:**
   - Xem error log trong cPanel
   - Xem `/var/log/nginx/error.log` (nếu có SSH)

3. **Test với file đơn giản:**
   - Tạo `index.html` đơn giản
   - Nếu vẫn 403 → Vấn đề hosting/config
   - Nếu OK → Vấn đề Next.js setup


