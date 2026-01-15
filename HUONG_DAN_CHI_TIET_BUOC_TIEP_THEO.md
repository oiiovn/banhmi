# 📋 Hướng Dẫn Chi Tiết Các Bước Tiếp Theo

## ✅ Đã hoàn thành

- ✅ Đã pull code từ Git thành công
- ✅ Đã có thư mục `api/` ở đúng vị trí

## 🔍 Bước 1: Kiểm tra cấu trúc

### Qua SSH trên hosting:

```bash
# Vào thư mục API
cd /home/dro94744/domains/api.websi.vn

# 1. Kiểm tra api/ có đúng chưa
ls -la api/
# Phải thấy: app/, config/, routes/, database/, ...

# 2. Kiểm tra public_html/ có api/ không
ls -la public_html/
# Nếu có api/ → Xóa đi
```

### Nếu có api/ trong public_html/:

```bash
rm -rf public_html/api
```

## 🔧 Bước 2: Sửa deploy script

### Mở file deploy-webhook-v2.sh:

```bash
nano deploy-webhook-v2.sh
```

### Sửa các dòng sau (tìm và sửa):

```bash
# Tìm dòng này:
API_DIR="/home/dro94744/domains/api.websi.vn/api"  # ← Đã đúng!

# Tìm dòng này:
WEB_SOURCE_DIR="/home/dro94744/domains/websi.vn/web"  # ← Sửa đường dẫn

# Tìm dòng này:
PUBLIC_HTML="/home/dro94744/domains/websi.vn/public_html"  # ← Sửa đường dẫn

# Tìm dòng này:
LOG_FILE="/home/dro94744/domains/api.websi.vn/deploy.log"  # ← Đã đúng!
```

### Lưu file:

- **Nano:** Nhấn `Ctrl + X` → `Y` → `Enter`
- **Vi:** Nhấn `Esc` → `:wq` → `Enter`

## 🌐 Bước 3: Setup Web cho websi.vn

### Option 1: Copy web/ từ api.websi.vn sang websi.vn

```bash
# Copy web/ sang websi.vn
cp -r /home/dro94744/domains/api.websi.vn/web /home/dro94744/domains/websi.vn/

# Kiểm tra
ls -la /home/dro94744/domains/websi.vn/web/
```

### Option 2: Clone Git riêng cho websi.vn (Khuyến nghị)

```bash
# Vào thư mục websi.vn
cd /home/dro94744/domains/websi.vn

# Init Git
git init

# Thêm remote
git remote add origin https://oiiovn:YOUR_TOKEN_HERE@github.com/oiiovn/banhmi.git

# Pull code
git pull origin main

# Kiểm tra có web/ chưa
ls -la web/

# Xóa các thư mục không cần (nếu muốn)
rm -rf api mobile
```

## 🧪 Bước 4: Test deploy script

### Chạy thử script:

```bash
# Vào thư mục API
cd /home/dro94744/domains/api.websi.vn

# Chạy script
bash deploy-webhook-v2.sh

# Xem log
cat deploy.log
```

### Kiểm tra kết quả:

```bash
# Kiểm tra API
ls -la api/vendor/  # Phải có sau khi composer install

# Kiểm tra Web (nếu đã setup)
ls -la /home/dro94744/domains/websi.vn/web/out/  # Phải có sau khi build
```

## 🔐 Bước 5: Setup Webhook (Tự động deploy)

### Sửa deploy-webhook.php:

```bash
nano deploy-webhook.php
```

### Tìm và sửa:

```php
// Tìm dòng này:
$DEPLOY_SCRIPT = __DIR__ . '/deploy-webhook.sh';

// Sửa thành:
$DEPLOY_SCRIPT = __DIR__ . '/deploy-webhook-v2.sh';
```

### Sửa secret key (nếu chưa có):

```php
// Tìm dòng này:
$SECRET = 'your-secret-key-here';

// Sửa thành secret key của bạn (tạo ngẫu nhiên)
$SECRET = 'your-random-secret-key-12345';
```

### Setup GitHub Webhook:

1. **Vào GitHub repo** → Settings → Webhooks → Add webhook
2. **Payload URL:** `https://api.websi.vn/deploy-webhook.php`
3. **Content type:** `application/json`
4. **Secret:** (dán secret key vừa tạo)
5. **Events:** Chọn "Just the push event"
6. **Active:** ✅

## 📋 Checklist hoàn chỉnh

- [ ] Đã kiểm tra `api/` có đúng chưa
- [ ] Đã xóa `api/` trong `public_html/` (nếu có)
- [ ] Đã sửa đường dẫn trong `deploy-webhook-v2.sh`
- [ ] Đã setup Web cho `websi.vn` (Option 1 hoặc 2)
- [ ] Đã test deploy script
- [ ] Đã sửa `deploy-webhook.php` để gọi `deploy-webhook-v2.sh`
- [ ] Đã setup GitHub webhook
- [ ] Đã test webhook (push code lên Git)

## 🎯 Cấu trúc cuối cùng

```
domains/api.websi.vn/
├── .git/
├── api/              ← Laravel API
├── deploy-webhook-v2.sh
└── deploy-webhook.php

domains/websi.vn/
├── web/              ← Next.js Web source
└── public_html/      ← Next.js build output
```

## 💡 Lưu ý

1. **Sau khi setup xong**, mỗi lần push code lên Git → Webhook tự động deploy
2. **Có thể test thủ công** bằng cách chạy `bash deploy-webhook-v2.sh`
3. **Xem log** bằng `cat deploy.log` để debug


