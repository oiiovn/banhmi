# ✅ Các Bước Tiếp Theo Sau Khi Upload Script

## ✅ Đã hoàn thành

- ✅ Đã upload `deploy-webhook-v2.sh` lên hosting

## 🔧 Bước 1: Set Permissions

```bash
cd /home/dro94744/domains/api.websi.vn
chmod +x deploy-webhook-v2.sh

# Kiểm tra
ls -la deploy-webhook-v2.sh
# Phải thấy: -rwxr-xr-x (có x = executable)
```

## 🔄 Bước 2: Pull Code từ Git (Nếu chưa pull)

### Pull API:

```bash
cd /home/dro94744/domains/api.websi.vn

# Kiểm tra đã có api/ chưa
ls -la api/

# Nếu chưa có, pull code
if [ ! -d "api" ]; then
    git pull origin main
fi
```

### Pull Web:

```bash
cd /home/dro94744/domains/websi.vn

# Kiểm tra đã có web/ chưa
ls -la web/

# Nếu chưa có, init Git và pull
if [ ! -d "web" ]; then
    if [ ! -d ".git" ]; then
        git init
    fi
    git remote remove origin 2>/dev/null
    git remote add origin https://oiiovn:YOUR_TOKEN_HERE@github.com/oiiovn/banhmi-web.git
    git pull origin main
fi
```

## 🧪 Bước 3: Test Deploy Script

```bash
cd /home/dro94744/domains/api.websi.vn

# Chạy script
bash deploy-webhook-v2.sh

# Xem log
cat deploy.log
```

## 🔍 Bước 4: Kiểm tra kết quả

```bash
# Kiểm tra API
ls -la api/vendor/  # Phải có sau khi composer install

# Kiểm tra Web (nếu đã build)
ls -la /home/dro94744/domains/websi.vn/web/out/  # Phải có sau khi build
```

## 🔐 Bước 5: Setup Webhook (Tự động deploy)

### Sửa deploy-webhook.php (nếu có):

```bash
cd /home/dro94744/domains/api.websi.vn

# Kiểm tra có deploy-webhook.php chưa
ls -la deploy-webhook.php

# Nếu có, sửa để gọi deploy-webhook-v2.sh
vi deploy-webhook.php
# Tìm dòng: $DEPLOY_SCRIPT = __DIR__ . '/deploy-webhook.sh';
# Sửa thành: $DEPLOY_SCRIPT = __DIR__ . '/deploy-webhook-v2.sh';
```

### Setup GitHub Webhook:

1. **Vào GitHub repo** `banhmi-api` → Settings → Webhooks → Add webhook
2. **Payload URL:** `https://api.websi.vn/deploy-webhook.php`
3. **Content type:** `application/json`
4. **Secret:** (tạo secret key, sửa trong deploy-webhook.php)
5. **Events:** "Just the push event"
6. **Active:** ✅

## 📋 Checklist

- [ ] Đã set permissions cho deploy-webhook-v2.sh
- [ ] Đã pull API code từ Git
- [ ] Đã pull Web code từ Git
- [ ] Đã test deploy script
- [ ] Đã kiểm tra log
- [ ] Đã setup webhook (nếu cần)

## ✅ Xong!

Sau khi hoàn thành, mỗi lần push code lên GitHub → Webhook sẽ tự động deploy!


