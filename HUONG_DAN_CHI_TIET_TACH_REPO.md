# 📚 Hướng Dẫn Chi Tiết Tách Repo Thành 2 Repo Riêng

## 🎯 Mục tiêu

Tách repo `banhmi` hiện tại thành 2 repo riêng:
1. **banhmi-api** - Chỉ chứa thư mục `api/`
2. **banhmi-web** - Chỉ chứa thư mục `web/`

## 📋 Chuẩn bị

- ✅ Đã có repo `banhmi` trên GitHub
- ✅ Đã có code local với đầy đủ `api/` và `web/`
- ✅ Đã có quyền tạo repo mới trên GitHub

---

## 🔧 PHẦN 1: Tách Repo Trên Máy Local

### Bước 1.1: Kiểm tra cấu trúc hiện tại

```bash
# Vào thư mục project
cd banhmi

# Kiểm tra có api/ và web/ chưa
ls -la
# Phải thấy: api/, web/, mobile/, .git/, ...

# Kiểm tra Git status
git status
```

### Bước 1.2: Tạo thư mục tạm cho API repo

```bash
# Vẫn ở trong thư mục banhmi
# Tạo thư mục banhmi-api ở cùng cấp
cd ..
mkdir banhmi-api
cd banhmi-api

# Kiểm tra
pwd
# Phải thấy: .../banhmi-api
```

### Bước 1.3: Init Git cho API repo

```bash
# Vẫn ở trong banhmi-api
git init

# Kiểm tra
ls -la
# Phải thấy: .git/
```

### Bước 1.4: Copy thư mục api/ vào banhmi-api

```bash
# Copy api/ từ banhmi sang banhmi-api
cp -r ../banhmi/api .

# Kiểm tra
ls -la
# Phải thấy: api/, .git/
ls -la api/
# Phải thấy: app/, config/, routes/, ...
```

### Bước 1.5: Tạo .gitignore cho API repo

```bash
# Tạo file .gitignore
cat > .gitignore << 'EOF'
# Laravel
/vendor/
/node_modules/
.env
.env.backup
.phpunit.result.cache
Homestead.json
Homestead.yaml
npm-debug.log
yarn-error.log
/.idea
/.vscode

# Ignore web và mobile (không cần trong API repo)
web/
mobile/
EOF

# Kiểm tra
cat .gitignore
```

### Bước 1.6: Commit code API

```bash
# Add tất cả files
git add .

# Kiểm tra files sẽ được commit
git status

# Commit
git commit -m "Initial commit: API only"

# Kiểm tra
git log
# Phải thấy commit vừa tạo
```

### Bước 1.7: Tạo thư mục tạm cho Web repo

```bash
# Quay lại thư mục cha
cd ..

# Tạo thư mục banhmi-web
mkdir banhmi-web
cd banhmi-web

# Kiểm tra
pwd
# Phải thấy: .../banhmi-web
```

### Bước 1.8: Init Git cho Web repo

```bash
# Vẫn ở trong banhmi-web
git init

# Kiểm tra
ls -la
# Phải thấy: .git/
```

### Bước 1.9: Copy thư mục web/ vào banhmi-web

```bash
# Copy web/ từ banhmi sang banhmi-web
cp -r ../banhmi/web .

# Kiểm tra
ls -la
# Phải thấy: web/, .git/
ls -la web/
# Phải thấy: app/, lib/, components/, ...
```

### Bước 1.10: Tạo .gitignore cho Web repo

```bash
# Tạo file .gitignore
cat > .gitignore << 'EOF'
# Next.js
/node_modules/
/.next/
/out/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Ignore api và mobile (không cần trong Web repo)
api/
mobile/
EOF

# Kiểm tra
cat .gitignore
```

### Bước 1.11: Commit code Web

```bash
# Add tất cả files
git add .

# Kiểm tra files sẽ được commit
git status

# Commit
git commit -m "Initial commit: Web only"

# Kiểm tra
git log
# Phải thấy commit vừa tạo
```

---

## 🌐 PHẦN 2: Tạo Repo Mới Trên GitHub

### Bước 2.1: Tạo repo banhmi-api

1. **Đăng nhập GitHub** → https://github.com
2. **Click** nút **"+"** ở góc trên bên phải → **"New repository"**
3. **Repository name:** `banhmi-api`
4. **Description:** `API Backend cho dự án Banhmi (Laravel)`
5. **Visibility:** 
   - ✅ **Private** (nếu muốn private)
   - ✅ **Public** (nếu muốn public)
6. **KHÔNG** check "Add a README file" (vì đã có code)
7. **KHÔNG** check "Add .gitignore" (vì đã có)
8. **Click** **"Create repository"**

### Bước 2.2: Tạo repo banhmi-web

1. **Click** nút **"+"** → **"New repository"**
2. **Repository name:** `banhmi-web`
3. **Description:** `Web Frontend cho dự án Banhmi (Next.js)`
4. **Visibility:** Chọn như trên
5. **KHÔNG** check các options
6. **Click** **"Create repository"**

---

## 📤 PHẦN 3: Push Code Lên GitHub

### Bước 3.1: Push banhmi-api

```bash
# Vào thư mục banhmi-api
cd ../banhmi-api

# Kiểm tra remote (chưa có)
git remote -v

# Thêm remote (thay YOUR_TOKEN bằng token của bạn)
git remote add origin https://oiiovn:YOUR_TOKEN@github.com/oiiovn/banhmi-api.git

# Hoặc dùng SSH (nếu đã setup SSH key):
# git remote add origin git@github.com:oiiovn/banhmi-api.git

# Đổi branch thành main
git branch -M main

# Push code lên GitHub
git push -u origin main
```

**Kết quả mong đợi:**
```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
Writing objects: 100% (X/X), done.
To https://github.com/oiiovn/banhmi-api.git
 * [new branch]      main -> main
Branch 'main' set up to track 'remote/origin/main'.
```

### Bước 3.2: Kiểm tra banhmi-api trên GitHub

1. **Vào** https://github.com/oiiovn/banhmi-api
2. **Kiểm tra** phải thấy:
   - ✅ Thư mục `api/`
   - ✅ File `.gitignore`
   - ✅ Các files khác từ api/

### Bước 3.3: Push banhmi-web

```bash
# Vào thư mục banhmi-web
cd ../banhmi-web

# Kiểm tra remote (chưa có)
git remote -v

# Thêm remote (thay YOUR_TOKEN bằng token của bạn)
git remote add origin https://oiiovn:YOUR_TOKEN@github.com/oiiovn/banhmi-web.git

# Hoặc dùng SSH:
# git remote add origin git@github.com:oiiovn/banhmi-web.git

# Đổi branch thành main
git branch -M main

# Push code lên GitHub
git push -u origin main
```

**Kết quả mong đợi:**
```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
Writing objects: 100% (X/X), done.
To https://github.com/oiiovn/banhmi-web.git
 * [new branch]      main -> main
Branch 'main' set up to track 'remote/origin/main'.
```

### Bước 3.4: Kiểm tra banhmi-web trên GitHub

1. **Vào** https://github.com/oiiovn/banhmi-web
2. **Kiểm tra** phải thấy:
   - ✅ Thư mục `web/`
   - ✅ File `.gitignore`
   - ✅ Các files khác từ web/

---

## 🖥️ PHẦN 4: Setup Trên Hosting

### Bước 4.1: Setup API repo trên hosting

```bash
# SSH vào hosting
ssh dro94744@s2d84.your-server.com

# Vào thư mục API
cd /home/dro94744/domains/api.websi.vn

# Backup .git cũ (nếu có)
if [ -d ".git" ]; then
    mv .git .git.backup
fi

# Xóa các files cũ (giữ lại deploy scripts)
# KHÔNG xóa: deploy-webhook-v2.sh, deploy-webhook.php
rm -rf api web mobile

# Clone repo API mới
git clone https://oiiovn:YOUR_TOKEN@github.com/oiiovn/banhmi-api.git .

# Kiểm tra
ls -la
# Phải thấy: api/, .git/, deploy-webhook-v2.sh, deploy-webhook.php

ls -la api/
# Phải thấy: app/, config/, routes/, ...
```

### Bước 4.2: Setup Web repo trên hosting

```bash
# Vào thư mục Web
cd /home/dro94744/domains/websi.vn

# Xóa web/ cũ (nếu có)
rm -rf web

# Init Git
git init

# Thêm remote
git remote add origin https://oiiovn:YOUR_TOKEN@github.com/oiiovn/banhmi-web.git

# Pull code
git pull origin main

# Kiểm tra
ls -la
# Phải thấy: web/, .git/

ls -la web/
# Phải thấy: app/, lib/, components/, ...
```

---

## 🔧 PHẦN 5: Sửa Deploy Script

### Bước 5.1: Kiểm tra script hiện tại

```bash
# Vào thư mục API
cd /home/dro94744/domains/api.websi.vn

# Xem script
cat deploy-webhook-v2.sh | grep -A 2 "API_DIR\|WEB_SOURCE_DIR\|PUBLIC_HTML"
```

### Bước 5.2: Sửa script (nếu cần)

```bash
# Mở script
nano deploy-webhook-v2.sh

# Tìm và sửa các dòng:
API_DIR="/home/dro94744/domains/api.websi.vn/api"  # ← Đã đúng
WEB_SOURCE_DIR="/home/dro94744/domains/websi.vn/web"  # ← Đã đúng
PUBLIC_HTML="/home/dro94744/domains/websi.vn/public_html"  # ← Đã đúng

# Lưu: Ctrl + X → Y → Enter
```

### Bước 5.3: Set permissions

```bash
chmod +x deploy-webhook-v2.sh
```

---

## 🧪 PHẦN 6: Test Deploy

### Bước 6.1: Test thủ công

```bash
# Vào thư mục API
cd /home/dro94744/domains/api.websi.vn

# Chạy script
bash deploy-webhook-v2.sh

# Xem log
cat deploy.log
```

### Bước 6.2: Kiểm tra kết quả

```bash
# Kiểm tra API
ls -la api/vendor/  # Phải có sau khi composer install

# Kiểm tra Web (nếu đã build)
ls -la /home/dro94744/domains/websi.vn/web/out/  # Phải có sau khi build
```

---

## 📋 Checklist Hoàn Chỉnh

### Trên máy local:
- [ ] Đã tạo thư mục banhmi-api
- [ ] Đã copy api/ vào banhmi-api
- [ ] Đã init Git và commit cho banhmi-api
- [ ] Đã tạo thư mục banhmi-web
- [ ] Đã copy web/ vào banhmi-web
- [ ] Đã init Git và commit cho banhmi-web
- [ ] Đã tạo repo banhmi-api trên GitHub
- [ ] Đã push banhmi-api lên GitHub
- [ ] Đã tạo repo banhmi-web trên GitHub
- [ ] Đã push banhmi-web lên GitHub

### Trên hosting:
- [ ] Đã clone banhmi-api vào domains/api.websi.vn/
- [ ] Đã kiểm tra có api/ trong domains/api.websi.vn/
- [ ] Đã clone banhmi-web vào domains/websi.vn/
- [ ] Đã kiểm tra có web/ trong domains/websi.vn/
- [ ] Đã sửa deploy script (nếu cần)
- [ ] Đã test deploy script
- [ ] Đã kiểm tra log

---

## 🎯 Cấu Trúc Cuối Cùng

### GitHub:
```
oiiovn/
├── banhmi-api/      ← Chỉ có api/
└── banhmi-web/      ← Chỉ có web/
```

### Hosting:
```
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

1. **Token GitHub:** Thay `YOUR_TOKEN` bằng token thực tế của bạn
2. **Đường dẫn:** Kiểm tra đường dẫn trên hosting của bạn
3. **Backup:** Luôn backup trước khi xóa
4. **Test:** Test kỹ trước khi deploy production

---

## 🆘 Troubleshooting

### Lỗi: "Repository not found"
- Kiểm tra tên repo đúng chưa
- Kiểm tra token có quyền truy cập repo chưa

### Lỗi: "Permission denied"
- Kiểm tra permissions: `chmod +x deploy-webhook-v2.sh`
- Kiểm tra quyền truy cập thư mục

### Lỗi: "Composer not found"
- Tìm Composer: `which composer`
- Hoặc cài Composer: `curl -sS https://getcomposer.org/installer | php`


