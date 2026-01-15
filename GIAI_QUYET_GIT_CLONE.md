# 🔧 Giải Quyết Lỗi Git Clone - Thư Mục Đã Tồn Tại

## ❌ Lỗi

```
fatal: destination path '.' already exists and is not an empty directory.
```

**Nguyên nhân:** Thư mục `api.websi.vn/` đã có nội dung (không rỗng)

## ✅ Giải pháp

### Cách 1: Kiểm tra xem đã có Git repo chưa

```bash
cd /home/dro94744/domains/api.websi.vn

# Kiểm tra xem đã có .git chưa
ls -la | grep .git

# Nếu có .git, chỉ cần pull
git pull origin main
```

### Cách 2: Clone vào thư mục tạm rồi copy

```bash
# Vào thư mục cha
cd /home/dro94744/domains

# Clone vào thư mục tạm
git clone https://github.com/oiiovn/banhmi-api.git api.websi.vn-temp

# Copy api/ vào đúng nơi (nếu chưa có)
if [ ! -d "api.websi.vn/api" ]; then
    cp -r api.websi.vn-temp/api api.websi.vn/
fi

# Copy .git vào đúng nơi (nếu chưa có)
if [ ! -d "api.websi.vn/.git" ]; then
    cp -r api.websi.vn-temp/.git api.websi.vn/
fi

# Xóa thư mục tạm
rm -rf api.websi.vn-temp

# Vào thư mục chính
cd api.websi.vn
git remote -v  # Kiểm tra remote
```

### Cách 3: Init Git trong thư mục hiện tại

```bash
cd /home/dro94744/domains/api.websi.vn

# Init Git (nếu chưa có)
git init

# Thêm remote
git remote add origin https://github.com/oiiovn/banhmi-api.git

# Pull code
git pull origin main
```

### Cách 4: Xóa nội dung cũ (CẨN THẬN!)

**⚠️ CHỈ DÙNG NẾU KHÔNG CÓ DỮ LIỆU QUAN TRỌNG!**

```bash
cd /home/dro94744/domains/api.websi.vn

# Backup trước (nếu cần)
# cp -r api api-backup

# Xóa nội dung cũ (giữ lại .git nếu có)
# rm -rf api web deploy-webhook.sh deploy-webhook.php

# Clone lại
git clone https://github.com/oiiovn/banhmi-api.git .
```

## 🎯 Khuyến nghị

**Dùng Cách 1 hoặc Cách 3** (an toàn nhất):

```bash
cd /home/dro94744/domains/api.websi.vn

# Kiểm tra xem đã có Git chưa
if [ -d ".git" ]; then
    echo "✅ Đã có Git repo, chỉ cần pull"
    git pull origin main
else
    echo "📦 Chưa có Git repo, init và pull"
    git init
    git remote add origin https://github.com/oiiovn/banhmi-api.git
    git pull origin main
fi
```

## 🔍 Kiểm tra sau khi setup

```bash
# Kiểm tra Git
git status
git remote -v

# Kiểm tra có api/ chưa
ls -la api/

# Kiểm tra có deploy scripts chưa
ls -la deploy-webhook.*
```

## 📋 Checklist

- [ ] Đã kiểm tra xem có `.git` chưa
- [ ] Đã pull hoặc clone code thành công
- [ ] Đã kiểm tra có thư mục `api/` chưa
- [ ] Đã kiểm tra `git remote -v` đúng chưa


