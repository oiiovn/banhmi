# 🖥️ Hướng Dẫn Pull Trên Hosting - Ngắn Gọn

## ✅ Đã hoàn thành

- ✅ Đã push `banhmi-api` lên GitHub
- ✅ Đã push `banhmi-web` lên GitHub

## 🖥️ PHẦN 1: Pull API trên Hosting

### Qua SSH:

```bash
# 1. Vào thư mục API
cd /home/dro94744/domains/api.websi.vn

# 2. Backup và xóa Git cũ
if [ -d ".git" ]; then
    mv .git .git.backup
fi
rm -rf api web mobile

# 3. Clone repo API mới
git clone https://oiiovn:YOUR_TOKEN_HERE@github.com/oiiovn/banhmi-api.git .

# 4. Kiểm tra
ls -la api/
# Phải thấy: app/, config/, routes/, ...
```

## 🖥️ PHẦN 2: Pull Web trên Hosting

### Qua SSH:

```bash
# 1. Vào thư mục Web
cd /home/dro94744/domains/websi.vn

# 2. Xóa web/ cũ (nếu có)
rm -rf web

# 3. Init Git (nếu chưa có)
if [ ! -d ".git" ]; then
    git init
fi

# 4. Thêm remote và pull
git remote remove origin 2>/dev/null
git remote add origin https://oiiovn:YOUR_TOKEN_HERE@github.com/oiiovn/banhmi-web.git
git pull origin main

# 5. Kiểm tra
ls -la web/
# Phải thấy: app/, lib/, components/, ...
```

## 🔧 PHẦN 3: Test Deploy Script

```bash
# Vào thư mục API
cd /home/dro94744/domains/api.websi.vn

# Chạy script
bash deploy-webhook-v2.sh

# Xem log
cat deploy.log
```

## ✅ Xong!

Sau khi pull xong, mỗi lần push code lên GitHub → Webhook sẽ tự động deploy!

## 📋 Checklist

- [ ] Đã clone banhmi-api vào domains/api.websi.vn/
- [ ] Đã kiểm tra có api/ trong domains/api.websi.vn/
- [ ] Đã pull banhmi-web vào domains/websi.vn/
- [ ] Đã kiểm tra có web/ trong domains/websi.vn/
- [ ] Đã test deploy script


