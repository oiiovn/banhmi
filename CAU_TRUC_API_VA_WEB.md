# 📁 Cấu Trúc API và Web Cùng Một Repository

## ✅ Không Ảnh Hưởng!

Cấu trúc hiện tại có cả `api/` và `web/` trong cùng một repository là **HOÀN TOÀN BÌNH THƯỜNG** và **KHÔNG ẢNH HƯỞNG**.

## 📂 Cấu Trúc Hiện Tại

```
banhmi/
├── api/          ← Laravel API
├── web/          ← Next.js Web
└── mobile/       ← Flutter Mobile (tùy chọn)
```

## 🔧 Script Deploy Đã Xử Lý

Script `deploy-webhook.sh` đã được thiết kế để xử lý cả 2 thư mục:

### 1. Deploy Web (Next.js)
- Pull code từ Git
- Build Next.js: `npm run build`
- Copy `out/` → `public_html/`

### 2. Deploy API (Laravel)
- Pull code từ Git
- Install dependencies: `composer install`
- Clear cache: `php artisan config:cache`

## 📋 Setup Trên Hosting

### Cấu trúc trên hosting:

```
/home/username/
├── domains/
│   ├── api.websi.vn/          ← Thư mục API (chứa cả api/ và web/)
│   │   ├── api/               ← Laravel API
│   │   ├── web/               ← Next.js Web
│   │   ├── deploy-webhook.sh  ← Script deploy
│   │   └── deploy-webhook.php ← Webhook endpoint
│   └── websi.vn/
│       └── public_html/       ← Files static từ web/out/
```

### Hoặc tách riêng:

```
/home/username/
├── domains/
│   ├── api.websi.vn/          ← API
│   │   └── (chứa thư mục api/)
│   └── websi.vn/
│       ├── public_html/       ← Web static files
│       └── (có thể có thư mục web/ để build)
```

## 🔧 Cách Setup

### Option 1: Cùng một thư mục (Khuyến nghị)

**Trên hosting:**
1. Clone repository vào một thư mục (ví dụ: `domains/api.websi.vn/`)
2. Script sẽ tự động:
   - Deploy API từ `api/`
   - Deploy Web từ `web/` → copy ra `public_html/`

**Sửa script:**
```bash
PROJECT_DIR="/home/username/domains/api.websi.vn"  # Thư mục chứa cả api/ và web/
WEB_DIR="$PROJECT_DIR/web"
API_DIR="$PROJECT_DIR/api"
PUBLIC_HTML="/home/username/domains/websi.vn/public_html"
```

### Option 2: Tách riêng (Nếu muốn)

**Nếu muốn tách API và Web ra 2 thư mục riêng:**

1. **Clone repository 2 lần:**
   - Một cho API: `domains/api.websi.vn/`
   - Một cho Web: `domains/websi.vn/web/`

2. **Tạo 2 script riêng:**
   - `deploy-api.sh` - Chỉ deploy API
   - `deploy-web.sh` - Chỉ deploy Web

3. **Setup 2 webhook:**
   - Một cho API
   - Một cho Web

## ✅ Lợi Ích Của Cấu Trúc Hiện Tại

1. **Dễ quản lý:** Tất cả code ở một nơi
2. **Đồng bộ:** API và Web luôn cùng version
3. **Deploy đơn giản:** Chỉ cần 1 script, 1 webhook
4. **Git history:** Có thể xem thay đổi của cả API và Web cùng lúc

## 📝 Workflow

### Khi sửa code:

```bash
# Sửa API
cd /Users/buiquocvu/banhmi/api
# ... sửa code ...

# Hoặc sửa Web
cd /Users/buiquocvu/banhmi/web
# ... sửa code ...

# Commit và push (từ root)
cd /Users/buiquocvu/banhmi
git add .
git commit -m "Sửa API và Web"
git push origin main
```

### Hosting tự động:

1. Nhận webhook từ GitHub
2. Pull code (cả `api/` và `web/`)
3. Deploy API: Clear cache Laravel
4. Deploy Web: Build Next.js và copy ra `public_html/`

## 🔍 Kiểm Tra Script

Script `deploy-webhook.sh` đã có logic:

```bash
# Deploy Web (Next.js)
if [ -d "$WEB_DIR" ]; then
    # Build và copy...
fi

# Deploy API (Laravel)
if [ -d "$API_DIR" ]; then
    # Clear cache...
fi
```

→ Script sẽ tự động phát hiện và deploy cả 2 thư mục!

## ⚠️ Lưu Ý

1. **Đường dẫn:** Đảm bảo `PROJECT_DIR` trỏ đến thư mục chứa cả `api/` và `web/`
2. **Permissions:** Script phải có quyền truy cập cả 2 thư mục
3. **Dependencies:** 
   - API cần Composer
   - Web cần Node.js và npm

## ✅ Kết Luận

**Cấu trúc hiện tại HOÀN TOÀN ỔN!**

- Script đã xử lý cả `api/` và `web/`
- Chỉ cần setup một lần
- Deploy tự động cả 2 phần

Không cần thay đổi gì cả! 🎉

