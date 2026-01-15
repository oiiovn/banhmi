# 🔧 Hướng Dẫn Sửa Đường Dẫn Trong Script

## ✅ Vị trí scripts đã đúng!

**Scripts đang ở:**
```
domains/api.websi.vn/
├── public_html/
├── deploy-webhook.sh      ← ✅ Đúng vị trí
└── deploy-webhook.php     ← ✅ Đúng vị trí
```

## 📝 Bước tiếp theo: Sửa đường dẫn

### 1. Mở file `deploy-webhook.sh`

**Qua File Manager:**
1. Click vào `deploy-webhook.sh`
2. Click "Edit" (hoặc chuột phải → Edit)

### 2. Sửa 2 dòng này:

**Tìm dòng 10:**
```bash
PROJECT_DIR="/home/username/domains/api.websi.vn"  # ← Sửa đường dẫn này
```

**Sửa thành:**
```bash
PROJECT_DIR="/home/dro94744/domains/api.websi.vn"  # ← Thay username bằng dro94744
```

**Tìm dòng 19:**
```bash
PUBLIC_HTML="/home/username/domains/websi.vn/public_html"  # ← Sửa đường dẫn này
```

**Sửa thành:**
```bash
PUBLIC_HTML="/home/dro94744/domains/websi.vn/public_html"  # ← Thay username bằng dro94744
```

### 3. Lưu file

Click "Save" hoặc "Save Changes"

## 🔍 Kiểm tra thêm

### Có thư mục `api/` không?

**Trong `domains/api.websi.vn/` phải có:**
- ✅ `deploy-webhook.sh`
- ✅ `deploy-webhook.php`
- ✅ `public_html/`
- ❓ `api/` (thư mục Laravel) - **Cần kiểm tra**

**Nếu không thấy `api/`:**
- Có thể đang ở trong `public_html/`
- Hoặc ở thư mục khác
- Cần tìm và di chuyển về đây

**Cách tìm:**
1. Vào `public_html/` xem có `api/` không
2. Nếu có → Di chuyển ra ngoài `domains/api.websi.vn/`
3. Nếu không → Tìm ở thư mục khác

## ✅ Sau khi sửa xong

**Cấu trúc đúng:**
```
domains/api.websi.vn/
├── api/                   ← Thư mục Laravel (cần có)
├── web/                   ← Thư mục Next.js (nếu có)
├── public_html/           ← Thư mục web
├── deploy-webhook.sh      ← Đã sửa đường dẫn
└── deploy-webhook.php     ← Webhook endpoint
```

**Đường dẫn trong script:**
```bash
PROJECT_DIR="/home/dro94744/domains/api.websi.vn"  # ✅ Đã sửa
PUBLIC_HTML="/home/dro94744/domains/websi.vn/public_html"  # ✅ Đã sửa
```

## 📋 Checklist

- [x] Scripts đã ở đúng vị trí
- [ ] Đã sửa `PROJECT_DIR` trong script
- [ ] Đã sửa `PUBLIC_HTML` trong script
- [ ] Đã kiểm tra có thư mục `api/` chưa
- [ ] Đã lưu file


