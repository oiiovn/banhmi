# 🔄 Setup Git Tự Động - API và Web ở 2 Nơi Khác Nhau

## 📁 Cấu trúc thực tế

```
domains/
├── api.websi.vn/              ← Subdomain (API)
│   └── api/                   ← Laravel API (từ Git)
│
└── websi.vn/                  ← Domain chính (Web)
    ├── web/                   ← Next.js source (từ Git)
    └── public_html/           ← Static files (Next.js build output)
```

## 🎯 Có 2 trường hợp

### Trường hợp 1: 2 Git Repo riêng biệt

**API repo:**
- Clone vào: `domains/api.websi.vn/`
- Có thư mục: `api/`

**Web repo:**
- Clone vào: `domains/websi.vn/`
- Có thư mục: `web/`

### Trường hợp 2: 1 Git Repo, pull vào 2 nơi

**Git repo có cả `api/` và `web/`:**
- Clone vào: `domains/api.websi.vn/` → có `api/`
- Clone vào: `domains/websi.vn/` → có `web/`

## 🚀 Setup theo từng trường hợp

### Trường hợp 1: 2 Git Repo riêng

#### Bước 1: Clone API repo

```bash
cd /home/dro94744/domains/api.websi.vn
git clone https://github.com/username/banhmi-api.git .
# Hoặc nếu repo có cả api/ và web/:
git clone https://github.com/username/banhmi.git .
# Sau đó chỉ giữ lại api/
```

#### Bước 2: Clone Web repo

```bash
cd /home/dro94744/domains/websi.vn
git clone https://github.com/username/banhmi-web.git .
# Hoặc nếu repo có cả api/ và web/:
git clone https://github.com/username/banhmi.git .
# Sau đó chỉ giữ lại web/
```

#### Bước 3: Sửa script `deploy-webhook-v2.sh`

```bash
API_DIR="/home/dro94744/domains/api.websi.vn/api"
WEB_SOURCE_DIR="/home/dro94744/domains/websi.vn/web"
PUBLIC_HTML="/home/dro94744/domains/websi.vn/public_html"
GIT_REPO_DIR=""  # ← Để trống vì là 2 repo riêng
```

### Trường hợp 2: 1 Git Repo, pull vào 2 nơi

#### Bước 1: Clone vào API

```bash
cd /home/dro94744/domains/api.websi.vn
git clone https://github.com/username/banhmi.git .
# Có cả api/ và web/, nhưng chỉ dùng api/
```

#### Bước 2: Clone vào Web

```bash
cd /home/dro94744/domains/websi.vn
git clone https://github.com/username/banhmi.git .
# Có cả api/ và web/, nhưng chỉ dùng web/
```

#### Bước 3: Sửa script `deploy-webhook-v2.sh`

```bash
API_DIR="/home/dro94744/domains/api.websi.vn/api"
WEB_SOURCE_DIR="/home/dro94744/domains/websi.vn/web"
PUBLIC_HTML="/home/dro94744/domains/websi.vn/public_html"
GIT_REPO_DIR=""  # ← Để trống, script sẽ pull từng nơi
```

## 🔧 Script mới: `deploy-webhook-v2.sh`

**Script này xử lý cả 2 trường hợp:**

1. **Nếu `GIT_REPO_DIR` có giá trị:**
   - Pull từ 1 repo chung
   - Copy `api/` và `web/` vào đúng nơi

2. **Nếu `GIT_REPO_DIR` trống:**
   - Pull từ `domains/api.websi.vn/.git` (cho API)
   - Pull từ `domains/websi.vn/.git` (cho Web)

## 📋 Setup Webhook

### Sửa `deploy-webhook.php`:

```php
$DEPLOY_SCRIPT = __DIR__ . '/deploy-webhook-v2.sh';  // ← Đổi tên script
```

### Setup GitHub Webhook:

1. **Vào GitHub repo** → Settings → Webhooks → Add webhook
2. **Payload URL:** `https://api.websi.vn/deploy-webhook.php`
3. **Secret:** (tạo secret key)
4. **Events:** "Just the push event"

## 🔄 Quy trình hoạt động

### Khi push code:

1. **GitHub** gửi webhook → `deploy-webhook.php`
2. **deploy-webhook.php** gọi → `deploy-webhook-v2.sh`
3. **deploy-webhook-v2.sh** thực hiện:
   - ✅ Pull API code → `domains/api.websi.vn/`
   - ✅ Pull Web code → `domains/websi.vn/`
   - ✅ Deploy API → `domains/api.websi.vn/api/`
   - ✅ Build Web → `domains/websi.vn/web/`
   - ✅ Copy Web → `domains/websi.vn/public_html/`

## 📝 Checklist

- [ ] Đã clone API repo vào `domains/api.websi.vn/`
- [ ] Đã clone Web repo vào `domains/websi.vn/`
- [ ] Đã sửa đường dẫn trong `deploy-webhook-v2.sh`
- [ ] Đã upload `deploy-webhook-v2.sh` lên hosting
- [ ] Đã setup webhook hoặc cron job
- [ ] Đã test script

## 💡 Lưu ý

1. **Nếu là 1 repo chung:**
   - Clone vào cả 2 nơi
   - Script sẽ pull từng nơi riêng

2. **Nếu là 2 repo riêng:**
   - Clone mỗi repo vào đúng nơi
   - Script sẽ pull từng repo riêng

3. **Webhook chỉ cần 1:**
   - Dù là 1 hay 2 repo, chỉ cần 1 webhook
   - Script sẽ tự động pull cả 2 nơi


