# 🔄 Hướng Dẫn Setup Git Tự Động Pull

## 🎯 Mục tiêu

**Tự động pull code từ Git và deploy vào đúng thư mục:**
- **API**: `domains/api.websi.vn/api/` (Laravel)
- **Web**: `domains/websi.vn/public_html/` (Next.js static)

## 📁 Cấu trúc

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

# Clone Git repo
git clone https://github.com/username/banhmi.git .

# Hoặc nếu đã có code, init Git:
git init
git remote add origin https://github.com/username/banhmi.git
git pull origin main
```

**Lưu ý:** 
- Thay `username/banhmi` bằng repo thực tế của bạn
- Dấu `.` ở cuối nghĩa là clone vào thư mục hiện tại

## 🔧 Bước 2: Sửa Script

### Sửa file `deploy-webhook.sh`:

**Mở file và sửa 2 dòng:**

```bash
PROJECT_DIR="/home/dro94744/domains/api.websi.vn"  # ← Đường dẫn thực tế
PUBLIC_HTML="/home/dro94744/domains/websi.vn/public_html"  # ← Đường dẫn thực tế
```

**Script sẽ tự động:**
1. ✅ Pull code từ Git vào `domains/api.websi.vn/`
2. ✅ Deploy API: xử lý `domains/api.websi.vn/api/`
3. ✅ Deploy Web: build `domains/api.websi.vn/web/` → copy vào `domains/websi.vn/public_html/`

## 🔐 Bước 3: Chọn Phương Thức Tự Động

### Cách 1: GitHub Webhook (Tự động ngay khi push)

**Ưu điểm:** Deploy ngay khi push code

**Cách setup:**

1. **Sửa `deploy-webhook.php`:**
   ```php
   $SECRET = 'your-secret-key-here'; // ← Tạo secret key ngẫu nhiên
   ```

2. **Vào GitHub repo** → Settings → Webhooks → Add webhook
   - **Payload URL:** `https://api.websi.vn/deploy-webhook.php`
   - **Content type:** `application/json`
   - **Secret:** (dán secret key vừa tạo)
   - **Events:** Chọn "Just the push event"
   - **Active:** ✅

3. **Test:**
   ```bash
   # Push code
   git push origin main
   
   # Xem log
   tail -f /home/dro94744/domains/api.websi.vn/deploy.log
   ```

### Cách 2: Cron Job (Tự động pull định kỳ)

**Ưu điểm:** Không cần webhook, chạy định kỳ

**Cách setup:**

1. **Vào cPanel** → Cron Jobs → Add New Cron Job

2. **Cấu hình:**
   - **Minute:** `*/5` (mỗi 5 phút)
   - **Hour:** `*`
   - **Day:** `*`
   - **Month:** `*`
   - **Weekday:** `*`
   - **Command:**
     ```bash
     cd /home/dro94744/domains/api.websi.vn && /bin/bash deploy-webhook.sh
     ```

3. **Hoặc dùng `auto-pull.sh` (chỉ pull, không deploy):**
   ```bash
     cd /home/dro94744/domains/api.websi.vn && /bin/bash auto-pull.sh
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

1. **Push code:**
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

1. **GitHub** gửi webhook → `deploy-webhook.php`
2. **deploy-webhook.php** gọi → `deploy-webhook.sh`
3. **deploy-webhook.sh** thực hiện:
   - ✅ Pull code từ Git vào `domains/api.websi.vn/`
   - ✅ Deploy API: `domains/api.websi.vn/api/`
   - ✅ Build Web: `domains/api.websi.vn/web/`
   - ✅ Copy Web: `domains/websi.vn/public_html/`

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
ls -la  # Phải thấy api/ và web/
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

**Nguyên nhân:** Chưa clone repo hoặc chưa setup Git

**Giải pháp:**
```bash
cd /home/dro94744/domains/api.websi.vn
git clone https://github.com/username/banhmi.git .
```

### Lỗi: "Cannot change to project directory"

**Nguyên nhân:** Đường dẫn `PROJECT_DIR` sai

**Giải pháp:**
- Kiểm tra đường dẫn: `pwd`
- Sửa trong script

### Lỗi: "npm install failed"

**Nguyên nhân:** Hosting không có Node.js

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

## 💡 Lưu ý

1. **Git repo phải có cả `api/` và `web/`** (cùng cấp)
2. **Pull về `domains/api.websi.vn/`** → có cả `api/` và `web/`
3. **Script tự động xử lý:**
   - API → `domains/api.websi.vn/api/`
   - Web → build và copy vào `domains/websi.vn/public_html/`


