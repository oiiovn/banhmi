# 📁 Cấu Trúc Deploy - API ở Subdomain, Web ở Domain

## 🎯 Cấu trúc thực tế

### Trên Hosting:

```
domains/
├── api.websi.vn/              ← Subdomain (API)
│   ├── api/                   ← Laravel API (từ Git)
│   ├── web/                   ← Next.js source (từ Git)
│   ├── deploy-webhook.sh      ← Script deploy
│   └── deploy-webhook.php     ← Webhook endpoint
│
└── websi.vn/                  ← Domain chính (Web)
    └── public_html/           ← Static files (Next.js build output)
        ├── index.html
        ├── _next/
        └── ...
```

## 🔄 Quy trình Deploy

### 1. Git Repo có:
```
banhmi/
├── api/          ← Laravel API
└── web/          ← Next.js Web
```

### 2. Pull về hosting:
- Pull vào `domains/api.websi.vn/`
- Có cả `api/` và `web/`

### 3. Deploy API:
- API ở `domains/api.websi.vn/api/`
- Chạy `composer install`, `php artisan config:cache`, etc.

### 4. Deploy Web:
- Build `domains/api.websi.vn/web/` → tạo `out/`
- Copy `out/*` → `domains/websi.vn/public_html/`

## ✅ Script hiện tại đã đúng!

**Script giả định:**
- `PROJECT_DIR` = `domains/api.websi.vn/` (chứa cả `api/` và `web/`)
- `API_DIR` = `$PROJECT_DIR/api` → `domains/api.websi.vn/api/`
- `WEB_DIR` = `$PROJECT_DIR/web` → `domains/api.websi.vn/web/`
- `PUBLIC_HTML` = `domains/websi.vn/public_html/` (nơi copy build output)

**→ Đúng với cấu trúc của bạn!**

## 📋 Checklist

- [x] API ở subdomain: `api.websi.vn` → `domains/api.websi.vn/api/`
- [x] Web ở domain: `websi.vn` → `domains/websi.vn/public_html/`
- [x] Git repo có cả `api/` và `web/`
- [x] Pull về `domains/api.websi.vn/` → có cả `api/` và `web/`
- [x] Build `web/` → copy vào `websi.vn/public_html/`

## 🔧 Chỉ cần sửa đường dẫn

**Trong `deploy-webhook.sh`:**

```bash
PROJECT_DIR="/home/dro94744/domains/api.websi.vn"  # ← Đã đúng!
PUBLIC_HTML="/home/dro94744/domains/websi.vn/public_html"  # ← Đã đúng!
```

**Script sẽ tự động:**
- `API_DIR` = `$PROJECT_DIR/api` → `domains/api.websi.vn/api/`
- `WEB_DIR` = `$PROJECT_DIR/web` → `domains/api.websi.vn/web/`


