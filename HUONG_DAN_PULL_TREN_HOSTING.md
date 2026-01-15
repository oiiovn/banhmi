# 🖥️ Hướng Dẫn Pull Trên Hosting

## ✅ Đã hoàn thành trên máy local

- ✅ Đã tạo `banhmi-api` (chứa api/)
- ✅ Đã tạo `banhmi-web` (chứa web/)
- ✅ Đã commit code

## 📤 Bước tiếp theo: Push lên GitHub

### Trên máy local:

```bash
# 1. Tạo repo banhmi-api trên GitHub
# Vào: https://github.com/new
# Tên: banhmi-api
# KHÔNG check "Add a README file"

# 2. Push banhmi-api
cd ~/banhmi-api
git remote add origin https://github.com/oiiovn/banhmi-api.git
git branch -M main
git push -u origin main

# 3. Tạo repo banhmi-web trên GitHub
# Vào: https://github.com/new
# Tên: banhmi-web
# KHÔNG check "Add a README file"

# 4. Push banhmi-web
cd ~/banhmi-web
git remote add origin https://github.com/oiiovn/banhmi-web.git
git branch -M main
git push -u origin main
```

---

## 🖥️ PHẦN 1: Pull API trên Hosting

### Bước 1.1: Vào thư mục API

```bash
# SSH vào hosting
ssh dro94744@s2d84.your-server.com

# Vào thư mục API
cd /home/dro94744/domains/api.websi.vn
```

### Bước 1.2: Backup và xóa Git cũ

```bash
# Backup .git cũ (nếu có)
if [ -d ".git" ]; then
    mv .git .git.backup
    echo "✅ Đã backup .git cũ"
fi

# Xóa các thư mục không cần (giữ lại deploy scripts)
rm -rf api web mobile

# Kiểm tra
ls -la
# Phải thấy: deploy-webhook-v2.sh, deploy-webhook.php, ...
```

### Bước 1.3: Clone repo API mới

```bash
# Clone repo (thay YOUR_TOKEN bằng token của bạn)
git clone https://oiiovn:YOUR_TOKEN_HERE@github.com/oiiovn/banhmi-api.git .

# Hoặc nếu dùng SSH:
# git clone git@github.com:oiiovn/banhmi-api.git .
```

**Lưu ý:** Dấu `.` ở cuối nghĩa là clone vào thư mục hiện tại

### Bước 1.4: Kiểm tra

```bash
# Kiểm tra cấu trúc
ls -la
# Phải thấy: api/, .git/, deploy-webhook-v2.sh, deploy-webhook.php

# Kiểm tra api/
ls -la api/
# Phải thấy: app/, config/, routes/, database/, ...
```

---

## 🖥️ PHẦN 2: Pull Web trên Hosting

### Bước 2.1: Vào thư mục Web

```bash
# Vào thư mục Web
cd /home/dro94744/domains/websi.vn
```

### Bước 2.2: Xóa web/ cũ (nếu có)

```bash
# Xóa web/ cũ
rm -rf web

# Kiểm tra
ls -la
```

### Bước 2.3: Init Git (nếu chưa có)

```bash
# Kiểm tra có .git chưa
if [ ! -d ".git" ]; then
    git init
    echo "✅ Đã init Git"
else
    echo "✅ Đã có .git"
fi
```

### Bước 2.4: Thêm remote và pull

```bash
# Xóa remote cũ (nếu có)
git remote remove origin 2>/dev/null

# Thêm remote mới (thay YOUR_TOKEN bằng token của bạn)
git remote add origin https://oiiovn:YOUR_TOKEN_HERE@github.com/oiiovn/banhmi-web.git

# Hoặc nếu dùng SSH:
# git remote add origin git@github.com:oiiovn/banhmi-web.git

# Pull code
git pull origin main
```

### Bước 2.5: Kiểm tra

```bash
# Kiểm tra cấu trúc
ls -la
# Phải thấy: web/, .git/, public_html/

# Kiểm tra web/
ls -la web/
# Phải thấy: app/, lib/, components/, ...
```

---

## 🔧 PHẦN 3: Sửa Deploy Script (Nếu cần)

### Bước 3.1: Kiểm tra script

```bash
# Vào thư mục API
cd /home/dro94744/domains/api.websi.vn

# Xem các đường dẫn trong script
grep -E "API_DIR|WEB_SOURCE_DIR|PUBLIC_HTML" deploy-webhook-v2.sh
```

### Bước 3.2: Sửa script (nếu cần)

```bash
# Mở script
nano deploy-webhook-v2.sh

# Tìm và sửa (nếu cần):
API_DIR="/home/dro94744/domains/api.websi.vn/api"
WEB_SOURCE_DIR="/home/dro94744/domains/websi.vn/web"
PUBLIC_HTML="/home/dro94744/domains/websi.vn/public_html"

# Lưu: Ctrl + X → Y → Enter
```

### Bước 3.3: Set permissions

```bash
chmod +x deploy-webhook-v2.sh
```

---

## 🧪 PHẦN 4: Test

### Bước 4.1: Test thủ công

```bash
# Vào thư mục API
cd /home/dro94744/domains/api.websi.vn

# Chạy script
bash deploy-webhook-v2.sh

# Xem log
cat deploy.log
```

### Bước 4.2: Kiểm tra kết quả

```bash
# Kiểm tra API
ls -la api/vendor/  # Phải có sau khi composer install

# Kiểm tra Web (nếu đã build)
ls -la /home/dro94744/domains/websi.vn/web/out/  # Phải có sau khi build
```

---

## 📋 Checklist

### Trên máy local:
- [x] Đã tạo banhmi-api
- [x] Đã tạo banhmi-web
- [ ] Đã tạo repo banhmi-api trên GitHub
- [ ] Đã push banhmi-api lên GitHub
- [ ] Đã tạo repo banhmi-web trên GitHub
- [ ] Đã push banhmi-web lên GitHub

### Trên hosting:
- [ ] Đã clone banhmi-api vào domains/api.websi.vn/
- [ ] Đã kiểm tra có api/ trong domains/api.websi.vn/
- [ ] Đã pull banhmi-web vào domains/websi.vn/
- [ ] Đã kiểm tra có web/ trong domains/websi.vn/
- [ ] Đã sửa deploy script (nếu cần)
- [ ] Đã test deploy script

---

## 🎯 Cấu trúc cuối cùng

```
Hosting:
domains/
├── api.websi.vn/
│   ├── .git/        ← Từ banhmi-api
│   ├── api/         ← Từ banhmi-api
│   ├── deploy-webhook-v2.sh
│   └── deploy-webhook.php
│
└── websi.vn/
    ├── .git/        ← Từ banhmi-web
    ├── web/         ← Từ banhmi-web
    └── public_html/ ← Next.js build output
```

---

## 💡 Lưu ý

1. **Token GitHub:** Thay `YOUR_TOKEN_HERE` bằng token thực tế của bạn
2. **Đường dẫn:** Kiểm tra đường dẫn trên hosting của bạn
3. **Sau khi pull:** Script deploy sẽ tự động pull từ đúng repo khi có thay đổi


