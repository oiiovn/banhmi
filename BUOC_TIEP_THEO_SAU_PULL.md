# 📋 Bước Tiếp Theo Sau Khi Pull Git

## 📁 Cấu trúc hiện tại

Từ hình ảnh, bạn đang có:
```
domains/api.websi.vn/
├── .git/                    ← Đã init Git
├── public_html/
│   └── api/                 ← API đang ở đây (SAI!)
├── deploy-webhook-v2.sh
├── deploy-webhook.php
└── deploy-webhook.sh
```

## ❌ Vấn đề

**API đang ở trong `public_html/api/`** → Cần di chuyển ra ngoài!

## ✅ Cấu trúc đúng

```
domains/api.websi.vn/
├── .git/                    ← Git repo
├── api/                     ← API phải ở đây (ĐÚNG!)
├── public_html/             ← Thư mục web (nếu có)
├── deploy-webhook-v2.sh
├── deploy-webhook.php
└── deploy-webhook.sh
```

## 🔧 Các bước tiếp theo

### Bước 1: Pull code từ Git

**Qua SSH:**

```bash
cd /home/dro94744/domains/api.websi.vn

# Xóa files conflict (nếu chưa xóa)
rm -f deploy-webhook.php deploy-webhook.sh

# Pull code
git pull origin main
```

### Bước 2: Kiểm tra cấu trúc sau khi pull

```bash
# Kiểm tra có api/ ở ngoài chưa
ls -la api/

# Kiểm tra có api/ trong public_html không
ls -la public_html/api/
```

### Bước 3: Di chuyển api/ ra ngoài (nếu cần)

**Nếu `api/` đang ở trong `public_html/`:**

```bash
# Di chuyển api/ ra ngoài
mv public_html/api .

# Hoặc nếu đã có api/ từ Git, xóa api/ trong public_html
rm -rf public_html/api
```

### Bước 4: Kiểm tra cấu trúc cuối cùng

```bash
# Phải thấy:
ls -la
# - api/          ← Ở đây (ĐÚNG!)
# - public_html/  ← Thư mục web
# - .git/         ← Git repo
```

### Bước 5: Sửa deploy script

**Sửa `deploy-webhook-v2.sh`:**

```bash
# Mở file và sửa:
API_DIR="/home/dro94744/domains/api.websi.vn/api"
```

### Bước 6: Setup cho Web (nếu cần)

**Nếu cần pull web/ cho `domains/websi.vn/`:**

```bash
cd /home/dro94744/domains/websi.vn

# Init Git
git init
git remote add origin https://oiiovn:YOUR_TOKEN_HERE@github.com/oiiovn/banhmi.git

# Pull code
git pull origin main

# Copy web/ vào đúng nơi (nếu chưa có)
# web/ sẽ có từ Git pull
```

## 📋 Checklist

- [ ] Đã pull code từ Git
- [ ] Đã kiểm tra có `api/` ở ngoài chưa
- [ ] Đã di chuyển `api/` ra ngoài (nếu cần)
- [ ] Đã xóa `api/` trong `public_html/` (nếu có)
- [ ] Đã sửa đường dẫn trong deploy script
- [ ] Đã setup Web (nếu cần)

## 🎯 Cấu trúc cuối cùng mong muốn

```
domains/api.websi.vn/
├── .git/
├── api/              ← Laravel API (từ Git)
│   ├── app/
│   ├── config/
│   └── ...
├── public_html/      ← Thư mục web (nếu có)
├── deploy-webhook-v2.sh
├── deploy-webhook.php
└── deploy-webhook.sh
```


