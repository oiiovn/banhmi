# 🚀 Deploy Web Với Node.js Server (Không dùng Static Export)

## ⚠️ Lý do không dùng Static Export

- Có dynamic route `/payments/[id]` không thể pre-render
- Next.js yêu cầu `generateStaticParams()` cho static export
- Nhưng route này dùng `'use client'` nên không thể dùng static export

## 🔧 Giải pháp: Dùng Node.js Server

### Bước 1: Build Next.js

```bash
cd web
npm run build
```

**Kết quả:** Sẽ tạo thư mục `.next/` (không phải `out/`)

### Bước 2: Upload lên host

**Upload toàn bộ thư mục `web/` lên:**
```
domains/websi.vn/web/
```

**Cấu trúc:**
```
domains/websi.vn/
├── web/                ← Upload toàn bộ thư mục web/
│   ├── .next/          ← Build output
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── node_modules/   ← Sẽ cài lại trên server
│   ├── package.json
│   ├── .env.production
│   └── ...
└── public_html/        ← Cần cấu hình proxy
```

### Bước 3: Cài dependencies trên server

**Qua SSH:**
```bash
cd domains/websi.vn/web
npm install --production
```

**Nếu không có SSH:**
- Upload thư mục `node_modules/` từ local (sau khi chạy `npm install --production`)

### Bước 4: Chạy Next.js server

**Qua SSH:**
```bash
cd domains/websi.vn/web
npm start
```

**Hoặc dùng PM2 (khuyến nghị):**
```bash
cd domains/websi.vn/web
pm2 start npm --name "banhmi-web" -- start
pm2 save
pm2 startup
```

### Bước 5: Cấu hình Nginx/Apache proxy

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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Apache (.htaccess trong public_html/):**
```apache
RewriteEngine On
RewriteBase /

# Proxy to Node.js server
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

## 🔄 Giải pháp thay thế: Dùng Static Export với workaround

Nếu hosting không có Node.js, có thể:

1. **Tạo page tĩnh cho payments:**
   - Tạo `app/payments/page.tsx` (không có [id])
   - Route `/payments/[id]` sẽ dùng client-side routing

2. **Hoặc exclude route này:**
   - Tạo redirect từ `/payments/[id]` sang trang khác

## ✅ Checklist

- [ ] Đã build: `npm run build`
- [ ] Đã upload thư mục `web/` lên server
- [ ] Đã cài dependencies: `npm install --production`
- [ ] Đã chạy server: `npm start` hoặc PM2
- [ ] Đã cấu hình Nginx/Apache proxy
- [ ] Đã test: `websi.vn`


