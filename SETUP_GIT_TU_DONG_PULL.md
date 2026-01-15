# 🔄 Setup Git Tự Động Pull - API và Web ở 2 Domain

## 🎯 Mục tiêu

**Tự động pull code từ Git và deploy:**
- **API**: `domains/api.websi.vn/api/` (Laravel)
- **Web**: `domains/websi.vn/public_html/` (Next.js static)

## 📁 Cấu trúc trên Hosting

```
domains/
├── api.websi.vn/              ← Subdomain (API)
│   ├── api/                   ← Laravel API (từ Git)
│   ├── web/                   ← Next.js source (từ Git)
│   ├── deploy-webhook.sh      ← Script deploy
│   ├── deploy-webhook.php     ← Webhook endpoint
│   └── .git/                  ← Git repo (clone ở đây)
│
└── websi.vn/                  ← Domain chính (Web)
    └── public_html/           ← Static files (Next.js build output)
```

## 🚀 Bước 1: Clone Git Repo Lần Đầu

### Qua SSH hoặc Terminal trong cPanel:

```bash
# Vào thư mục api.websi.vn
cd /home/dro94744/domains/api.websi.vn

# Clone Git repo (nếu chưa có)
git clone https://github.com/username/banhmi.git .

# Hoặc nếu đã có code, init Git:
git init
git remote add origin https://github.com/username/banhmi.git
git pull origin main
```

**Lưu ý:** Thay `username/banhmi` bằng repo thực tế của bạn!

## 🔧 Bước 2: Cấu hình Script

### Sửa file `deploy-webhook.sh`:

**Mở file và sửa 2 dòng:**

```bash
PROJECT_DIR="/home/dro94744/domains/api.websi.vn"  # ← Đường dẫn thực tế
PUBLIC_HTML="/home/dro94744/domains/websi.vn/public_html"  # ← Đường dẫn thực tế
```

**Script sẽ tự động:**
1. Pull code từ Git vào `domains/api.websi.vn/`
2. Deploy API: xử lý `domains/api.websi.vn/api/`
3. Deploy Web: build `domains/api.websi.vn/web/` → copy vào `domains/websi.vn/public_html/`

## 🔐 Bước 3: Setup Webhook (Tự động)

### Cách 1: GitHub Webhook

1. **Vào GitHub repo** → Settings → Webhooks → Add webhook
2. **Payload URL:** `https://api.websi.vn/deploy-webhook.php`
3. **Content type:** `application/json`
4. **Secret:** (tạo secret key, sửa trong `deploy-webhook.php`)
5. **Events:** Chọn "Just the push event"
6. **Active:** ✅

### Cách 2: Cron Job (Tự động pull định kỳ)

**Tạo cron job trong cPanel:**

1. **Vào cPanel** → Cron Jobs
2. **Add New Cron Job:**
   - **Minute:** `*/5` (mỗi 5 phút)
   - **Hour:** `*`
   - **Day:** `*`
   - **Month:** `*`
   - **Weekday:** `*`
   - **Command:**
     ```bash
     cd /home/dro94744/domains/api.websi.vn && /bin/bash deploy-webhook.sh
     ```

**Hoặc dùng script `auto-pull.sh`:**

```bash
# Tạo cron job chạy mỗi 5 phút
*/5 * * * * cd /home/dro94744/domains/api.websi.vn && git pull origin main
```

## 📋 Bước 4: Test

### Test thủ công:

```bash
# SSH vào hosting
cd /home/dro94744/domains/api.websi.vn

# Chạy script thủ công
bash deploy-webhook.sh

# Xem log
cat deploy.log
```

### Test webhook:

1. **Push code lên Git:**
   ```bash
   git add .
   git commit -m "Test deploy"
   git push origin main
   ```

2. **Kiểm tra log:**
   ```bash
   tail -f /home/dro94744/domains/api.websi.vn/deploy.log
   ```

## ✅ Quy trình hoạt động

### Khi push code lên Git:

1. **GitHub/GitLab** gửi webhook → `deploy-webhook.php`
2. **deploy-webhook.php** gọi → `deploy-webhook.sh`
3. **deploy-webhook.sh** thực hiện:
   - Pull code từ Git
   - Deploy API (Laravel)
   - Build và deploy Web (Next.js)

### Hoặc với Cron Job:

1. **Cron job** chạy định kỳ (mỗi 5 phút)
2. **Pull code** từ Git
3. **Nếu có thay đổi** → Chạy deploy script

## 🔍 Kiểm tra

### Kiểm tra Git repo:

```bash
cd /home/dro94744/domains/api.websi.vn
git status
git remote -v
```

### Kiểm tra script:

```bash
# Test script
bash deploy-webhook.sh

# Xem log
cat deploy.log
```

### Kiểm tra webhook:

```bash
# Test webhook endpoint
curl -X POST https://api.websi.vn/deploy-webhook.php
```

## 🆘 Troubleshooting

### Lỗi: "Git pull failed"

**Nguyên nhân:**
- Chưa clone repo
- Chưa setup Git credentials
- Chưa có quyền truy cập repo

**Giải pháp:**
```bash
# Kiểm tra Git
cd /home/dro94744/domains/api.websi.vn
git status

# Nếu chưa có repo, clone lại
git clone https://github.com/username/banhmi.git .
```

### Lỗi: "Cannot change to project directory"

**Nguyên nhân:**
- Đường dẫn `PROJECT_DIR` sai
- Không có quyền truy cập

**Giải pháp:**
- Kiểm tra đường dẫn thực tế
- Sửa trong script

### Lỗi: "npm install failed"

**Nguyên nhân:**
- Hosting không có Node.js
- Không đủ quyền

**Giải pháp:**
- Build trên máy local rồi upload
- Hoặc cài Node.js trên hosting

## 📝 Checklist

- [ ] Đã clone Git repo vào `domains/api.websi.vn/`
- [ ] Đã sửa đường dẫn trong `deploy-webhook.sh`
- [ ] Đã setup webhook hoặc cron job
- [ ] Đã test script thủ công
- [ ] Đã test webhook
- [ ] Đã kiểm tra log


