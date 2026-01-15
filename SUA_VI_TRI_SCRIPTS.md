# 🔧 Sửa Vị Trí Scripts - Đang Ở Sai Chỗ

## ❌ Vấn đề hiện tại

**Scripts đang ở:**
```
domains/api.websi.vn/public_html/
├── deploy-webhook.sh      ← SAI! Ở đây
├── deploy-webhook.php     ← SAI! Ở đây
├── api/                   ← Thư mục API
└── index.html
```

**Vấn đề:**
- Scripts đang ở trong `public_html/` (thư mục web)
- Cần phải ở ngoài, cùng cấp với `api/`

## ✅ Cấu trúc đúng

**Scripts phải ở:**
```
domains/api.websi.vn/
├── api/                   ← Laravel API
├── web/                   ← Next.js Web (nếu có)
├── deploy-webhook.sh      ← ĐÚNG! Ở đây
└── deploy-webhook.php     ← ĐÚNG! Ở đây
```

**KHÔNG phải:**
```
domains/api.websi.vn/public_html/  ← SAI!
```

## 🔧 Cách sửa

### Bước 1: Di chuyển scripts ra ngoài

**Qua File Manager:**

1. **Bạn đang ở:** `domains/api.websi.vn/public_html/`
2. **Chọn 2 files:**
   - `deploy-webhook.sh`
   - `deploy-webhook.php`
3. **Click "Move"** (hoặc "Cut")
4. **Quay lại** `domains/api.websi.vn/` (click vào breadcrumb `api.websi.vn`)
5. **Click "Paste"** để dán ra ngoài

### Bước 2: Kiểm tra cấu trúc

**Sau khi di chuyển, trong `domains/api.websi.vn/` phải có:**
```
✅ api/                    (thư mục)
✅ deploy-webhook.sh       (file)
✅ deploy-webhook.php      (file)
✅ web/                    (thư mục, nếu có)
```

**KHÔNG còn trong `public_html/`**

## 📋 Lý do

### Tại sao không được để trong `public_html/`?

1. **`public_html/` là thư mục web:**
   - Chứa files static (HTML, CSS, JS)
   - Có thể bị xóa khi deploy web
   - Không phải nơi chứa scripts

2. **Scripts cần truy cập `api/` và `web/`:**
   - Nếu ở trong `public_html/`, đường dẫn sẽ sai
   - Không thể truy cập `../api/` hoặc `../web/`

3. **Bảo mật:**
   - Scripts không nên ở trong thư mục public
   - Có thể bị truy cập trực tiếp qua web

## ✅ Sau khi sửa

**Cấu trúc đúng:**
```
domains/api.websi.vn/
├── api/                   ← Laravel API
│   ├── app/
│   ├── config/
│   └── ...
├── web/                   ← Next.js Web (nếu có)
│   ├── app/
│   ├── lib/
│   └── ...
├── deploy-webhook.sh      ← Script deploy
├── deploy-webhook.php     ← Webhook endpoint
└── deploy.log             ← Log file (tự động tạo)
```

**Đường dẫn trong script:**
```bash
PROJECT_DIR="/home/username/domains/api.websi.vn"  # ← Trỏ đến đây
WEB_DIR="$PROJECT_DIR/web"                        # → domains/api.websi.vn/web
API_DIR="$PROJECT_DIR/api"                        # → domains/api.websi.vn/api
PUBLIC_HTML="/home/username/domains/websi.vn/public_html"  # ← Thư mục khác
```

## 🎯 Tóm tắt

**Hiện tại:** Scripts đang ở trong `public_html/` → **SAI**

**Cần:** Di chuyển scripts ra ngoài `domains/api.websi.vn/` → **ĐÚNG**

**Cách:** Chọn 2 files → Move → Quay lại `api.websi.vn/` → Paste


