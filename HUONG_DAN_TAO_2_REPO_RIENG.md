# 🔀 Hướng Dẫn Tách Thành 2 Git Repo Riêng

## 🎯 Mục tiêu

**Tách repo hiện tại thành 2 repo:**
1. **Repo API:** Chỉ chứa `api/`
2. **Repo Web:** Chỉ chứa `web/` (hoặc `out/` nếu muốn chỉ build output)

## ✅ Lợi ích

- ✅ Không cần xử lý conflict
- ✅ Pull dễ dàng hơn
- ✅ Mỗi repo chỉ có code cần thiết
- ✅ Deploy đơn giản hơn

## 🔧 Bước 1: Tạo Repo API mới

### Trên máy local:

```bash
# Vào thư mục project
cd banhmi

# Tạo thư mục tạm cho API repo
mkdir banhmi-api
cd banhmi-api

# Init Git
git init

# Copy chỉ api/
cp -r ../api .

# Copy các files cần thiết (nếu có)
cp ../.gitignore .
# Sửa .gitignore để chỉ ignore files của API

# Commit
git add .
git commit -m "Initial commit: API only"

# Tạo repo mới trên GitHub
# Vào GitHub → New repository → Tên: banhmi-api

# Thêm remote và push
git remote add origin https://github.com/oiiovn/banhmi-api.git
git branch -M main
git push -u origin main
```

## 🔧 Bước 2: Tạo Repo Web mới

### Option 1: Repo chứa web/ (source code)

```bash
# Tạo thư mục tạm cho Web repo
cd ..
mkdir banhmi-web
cd banhmi-web

# Init Git
git init

# Copy chỉ web/
cp -r ../web .

# Copy các files cần thiết
cp ../.gitignore .
# Sửa .gitignore để chỉ ignore files của Web

# Commit
git add .
git commit -m "Initial commit: Web only"

# Tạo repo mới trên GitHub
# Vào GitHub → New repository → Tên: banhmi-web

# Thêm remote và push
git remote add origin https://github.com/oiiovn/banhmi-web.git
git branch -M main
git push -u origin main
```

### Option 2: Repo chỉ chứa out/ (build output)

**Không khuyến nghị** vì:
- ❌ Phải build trên máy local rồi push
- ❌ Không có source code để sửa
- ❌ Khó quản lý

## 🔧 Bước 3: Setup trên Hosting

### Setup API repo:

```bash
# Vào thư mục API
cd /home/dro94744/domains/api.websi.vn

# Xóa Git cũ
rm -rf .git

# Clone repo API mới
git clone https://oiiovn:YOUR_TOKEN_HERE@github.com/oiiovn/banhmi-api.git .

# Kiểm tra
ls -la api/  # Phải thấy api/
```

### Setup Web repo:

```bash
# Vào thư mục Web
cd /home/dro94744/domains/websi.vn

# Init Git
git init

# Thêm remote
git remote add origin https://oiiovn:YOUR_TOKEN_HERE@github.com/oiiovn/banhmi-web.git

# Pull code
git pull origin main

# Kiểm tra
ls -la web/  # Phải thấy web/
```

## 🔧 Bước 4: Sửa Deploy Script

### Sửa deploy-webhook-v2.sh:

```bash
# API_DIR - đã đúng
API_DIR="/home/dro94744/domains/api.websi.vn/api"

# WEB_SOURCE_DIR - đã đúng
WEB_SOURCE_DIR="/home/dro94744/domains/websi.vn/web"

# PUBLIC_HTML - đã đúng
PUBLIC_HTML="/home/dro94744/domains/websi.vn/public_html"
```

**Script sẽ tự động:**
- Pull API từ `banhmi-api` repo
- Pull Web từ `banhmi-web` repo
- Deploy riêng biệt

## 📋 Checklist

### Trên máy local:
- [ ] Đã tạo repo `banhmi-api` trên GitHub
- [ ] Đã push `api/` lên `banhmi-api`
- [ ] Đã tạo repo `banhmi-web` trên GitHub
- [ ] Đã push `web/` lên `banhmi-web`

### Trên hosting:
- [ ] Đã clone `banhmi-api` vào `domains/api.websi.vn/`
- [ ] Đã clone `banhmi-web` vào `domains/websi.vn/`
- [ ] Đã sửa deploy script
- [ ] Đã test deploy

## 🎯 Cấu trúc sau khi tách

```
GitHub:
├── banhmi-api/      ← Chỉ có api/
└── banhmi-web/      ← Chỉ có web/

Hosting:
domains/api.websi.vn/
└── api/             ← Từ banhmi-api repo

domains/websi.vn/
└── web/             ← Từ banhmi-web repo
```

## 💡 Lưu ý

1. **Repo banhmi cũ** có thể giữ lại làm backup
2. **Mỗi lần sửa code**, push vào repo tương ứng
3. **Deploy script** sẽ tự động pull từ đúng repo


