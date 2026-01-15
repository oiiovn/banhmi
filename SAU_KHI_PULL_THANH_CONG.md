# ✅ Sau Khi Pull Thành Công

## ✅ Đã có

Từ `ls -la`, bạn đã có:
```
domains/api.websi.vn/
├── .git/                    ← Git repo
├── api/                     ← ✅ API ở đúng vị trí!
├── web/                     ← Next.js Web (từ Git)
├── mobile/                  ← Flutter Mobile (từ Git)
├── public_html/             ← Thư mục web
├── deploy-webhook-v2.sh     ← Script deploy
├── deploy-webhook.php       ← Webhook endpoint
└── deploy-webhook.sh        ← Script deploy (cũ)
```

## 🔍 Kiểm tra

### 1. Kiểm tra api/ có đúng chưa

```bash
ls -la api/
# Phải thấy: app/, config/, routes/, ...
```

### 2. Kiểm tra public_html/ có api/ không

```bash
ls -la public_html/
# Nếu có api/ trong đây → Xóa đi
```

**Nếu có `api/` trong `public_html/`:**
```bash
rm -rf public_html/api
```

## 🔧 Bước tiếp theo

### 1. Sửa deploy script

**Sửa `deploy-webhook-v2.sh`:**

```bash
# Mở file
nano deploy-webhook-v2.sh

# Sửa các dòng:
API_DIR="/home/dro94744/domains/api.websi.vn/api"
WEB_SOURCE_DIR="/home/dro94744/domains/websi.vn/web"  # Nếu web ở websi.vn
PUBLIC_HTML="/home/dro94744/domains/websi.vn/public_html"
```

### 2. Setup Web (nếu cần)

**Nếu web cần ở `domains/websi.vn/web/`:**

```bash
# Copy web/ sang websi.vn
cp -r web /home/dro94744/domains/websi.vn/

# Hoặc init Git riêng cho websi.vn
cd /home/dro94744/domains/websi.vn
git init
git remote add origin https://oiiovn:YOUR_TOKEN_HERE@github.com/oiiovn/banhmi.git
git pull origin main
# Sau đó chỉ giữ lại web/
```

### 3. Test deploy script

```bash
# Test script
bash deploy-webhook-v2.sh

# Xem log
cat deploy.log
```

## 📋 Checklist

- [x] Đã pull code từ Git thành công
- [x] Đã có thư mục `api/` ở đúng vị trí
- [ ] Đã kiểm tra và xóa `api/` trong `public_html/` (nếu có)
- [ ] Đã sửa đường dẫn trong `deploy-webhook-v2.sh`
- [ ] Đã setup Web (nếu cần)
- [ ] Đã test deploy script

## 🎯 Cấu trúc cuối cùng mong muốn

```
domains/api.websi.vn/
├── .git/
├── api/              ← Laravel API (ĐÚNG!)
├── web/              ← Next.js Web (có thể xóa nếu không dùng)
├── mobile/           ← Flutter Mobile (có thể xóa nếu không dùng)
├── public_html/      ← Thư mục web (không có api/ bên trong)
├── deploy-webhook-v2.sh
└── deploy-webhook.php
```

```
domains/websi.vn/
├── web/              ← Next.js Web source (nếu cần)
└── public_html/      ← Next.js build output
```

## 💡 Lưu ý

1. **API đã ở đúng vị trí** → `domains/api.websi.vn/api/`
2. **Có thể xóa `web/` và `mobile/`** nếu không dùng ở đây
3. **Script deploy sẽ tự động pull và deploy** → Không cần làm thủ công


