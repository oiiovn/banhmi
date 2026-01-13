# 🚀 Hướng Dẫn Setup Git Auto-Deploy

## 📋 Tổng Quan

Sau khi setup, workflow sẽ là:
1. **Sửa code trên máy local**
2. **Commit và push lên Git**
3. **Hosting tự động pull và deploy**

## 🔧 Các Bước Setup

### Bước 1: Tạo Git Repository

1. Tạo repository trên GitHub/GitLab
2. Copy URL repository

### Bước 2: Push Code Lên Git

```bash
cd /Users/buiquocvu/banhmi

# Init Git (nếu chưa có)
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Add remote
git remote add origin https://github.com/username/banhmi.git

# Push
git push -u origin main
```

### Bước 3: Setup trên Hosting

#### Option A: Dùng Webhook (Tự động ngay khi push)

**1. Upload script lên hosting:**
- Upload `deploy-webhook.sh` vào thư mục API (ví dụ: `domains/api.websi.vn/`)
- Upload `deploy-webhook.php` vào thư mục API

**2. Sửa đường dẫn trong script:**
- Mở `deploy-webhook.sh`
- Sửa các đường dẫn:
  - `PROJECT_DIR` → Đường dẫn đến thư mục project trên hosting
  - `PUBLIC_HTML` → Đường dẫn đến `public_html/`

**3. Set permissions:**
```bash
chmod +x deploy-webhook.sh
```

**4. Setup webhook trên GitHub:**
- Vào repository → Settings → Webhooks → Add webhook
- Payload URL: `https://api.websi.vn/deploy-webhook.php`
- Content type: `application/json`
- Secret: Nhập secret key (giống trong `deploy-webhook.php`)
- Events: Chọn "Just the push event"
- Add webhook

#### Option B: Dùng Cron Job (Check định kỳ)

**1. Upload script:**
- Upload `auto-pull.sh` lên hosting

**2. Sửa đường dẫn trong script**

**3. Setup Cron Job trong cPanel:**
- Vào cPanel → Cron Jobs
- Add New Cron Job:
  - **Minute:** `*/5` (mỗi 5 phút)
  - **Command:** `/bin/bash /path/to/auto-pull.sh`

## 📝 Workflow Hàng Ngày

### 1. Sửa code trên local

```bash
cd /Users/buiquocvu/banhmi
# Sửa code...
```

### 2. Commit và push

```bash
git add .
git commit -m "Mô tả thay đổi"
git push origin main
```

### 3. Hosting tự động deploy

- **Webhook:** Tự động chạy ngay (trong vài giây)
- **Cron Job:** Chạy trong vòng 5 phút

## 🔍 Kiểm Tra

### Xem log:

**Webhook:**
```bash
cat deploy.log
```

**Cron Job:**
```bash
cat auto-pull.log
```

### Test manual:

```bash
# Chạy script thủ công để test
bash deploy-webhook.sh
```

## ⚠️ Lưu Ý

1. **Secret Key:** Đổi secret key trong `deploy-webhook.php`
2. **Đường dẫn:** Sửa đúng đường dẫn trong script
3. **Permissions:** Script phải có quyền execute (`755`)
4. **SSH Key:** Setup SSH key cho Git (không dùng password)

## ✅ Checklist

- [ ] Đã tạo Git repository
- [ ] Đã push code lên Git
- [ ] Đã upload script lên hosting
- [ ] Đã sửa đường dẫn trong script
- [ ] Đã set permissions cho script
- [ ] Đã setup webhook hoặc cron job
- [ ] Đã test: Push code → Hosting tự động deploy

