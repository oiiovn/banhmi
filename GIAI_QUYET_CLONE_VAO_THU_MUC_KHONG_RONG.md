# 🔧 Giải Quyết Lỗi Clone Vào Thư Mục Không Rỗng

## ❌ Lỗi

```
fatal: destination path '.' already exists and is not an empty directory.
```

**Nguyên nhân:** Thư mục vẫn còn các files khác (deploy scripts, ...)

## ✅ Giải pháp

### Cách 1: Clone vào thư mục tạm rồi copy (Khuyến nghị)

```bash
# Vào thư mục cha
cd /home/dro94744/domains

# Clone vào thư mục tạm
git clone https://oiiovn:YOUR_TOKEN_HERE@github.com/oiiovn/banhmi-api.git api.websi.vn-temp

# Copy api/ vào đúng nơi
cp -r api.websi.vn-temp/api api.websi.vn/

# Copy .git vào đúng nơi
cp -r api.websi.vn-temp/.git api.websi.vn/

# Xóa thư mục tạm
rm -rf api.websi.vn-temp

# Vào thư mục chính
cd api.websi.vn

# Kiểm tra
ls -la api/
```

### Cách 2: Xóa tất cả trừ deploy scripts

```bash
# Vào thư mục API
cd /home/dro94744/domains/api.websi.vn

# Backup deploy scripts
mkdir -p ~/backup-deploy
cp deploy-webhook*.sh ~/backup-deploy/ 2>/dev/null
cp deploy-webhook*.php ~/backup-deploy/ 2>/dev/null

# Xóa tất cả files và thư mục (trừ .git.backup nếu có)
rm -rf * .[^.]* 2>/dev/null

# Clone
git clone https://oiiovn:YOUR_TOKEN_HERE@github.com/oiiovn/banhmi-api.git .

# Copy lại deploy scripts
cp ~/backup-deploy/deploy-webhook*.sh . 2>/dev/null
cp ~/backup-deploy/deploy-webhook*.php . 2>/dev/null

# Set permissions
chmod +x deploy-webhook*.sh 2>/dev/null
```

### Cách 3: Init Git và pull (Đơn giản nhất)

```bash
# Vào thư mục API
cd /home/dro94744/domains/api.websi.vn

# Xóa api/ cũ (nếu có)
rm -rf api

# Init Git (nếu chưa có)
if [ ! -d ".git" ]; then
    git init
fi

# Thêm remote
git remote remove origin 2>/dev/null
git remote add origin https://oiiovn:YOUR_TOKEN_HERE@github.com/oiiovn/banhmi-api.git

# Pull code
git pull origin main

# Kiểm tra
ls -la api/
```

## 🎯 Khuyến nghị

**Dùng Cách 3** (đơn giản nhất, không mất deploy scripts)


