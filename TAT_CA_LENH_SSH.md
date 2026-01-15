# 🖥️ Tất Cả Lệnh SSH Cần Thiết

## 📋 Setup API trên Hosting

### 1. Vào thư mục API

```bash
cd /home/dro94744/domains/api.websi.vn
```

### 2. Xóa api/ cũ (nếu có)

```bash
rm -rf api
```

### 3. Init Git (nếu chưa có)

```bash
git init
```

### 4. Thêm remote và pull

```bash
git remote remove origin 2>/dev/null
git remote add origin https://oiiovn:YOUR_TOKEN_HERE@github.com/oiiovn/banhmi-api.git
git pull origin main
```

### 5. Kiểm tra

```bash
ls -la api/
# Phải thấy: app/, config/, routes/, ...
```

---

## 📋 Setup Web trên Hosting

### 1. Vào thư mục Web

```bash
cd /home/dro94744/domains/websi.vn
```

### 2. Xóa web/ cũ (nếu có)

```bash
rm -rf web
```

### 3. Init Git (nếu chưa có)

```bash
if [ ! -d ".git" ]; then
    git init
fi
```

### 4. Thêm remote và pull

```bash
git remote remove origin 2>/dev/null
git remote add origin https://oiiovn:YOUR_TOKEN_HERE@github.com/oiiovn/banhmi-web.git
git pull origin main
```

### 5. Kiểm tra

```bash
ls -la web/
# Phải thấy: app/, lib/, components/, ...
```

---

## 📋 Setup Deploy Script

### 1. Vào thư mục API

```bash
cd /home/dro94744/domains/api.websi.vn
```

### 2. Set permissions cho deploy-webhook-v2.sh

```bash
chmod +x deploy-webhook-v2.sh
```

### 3. Kiểm tra

```bash
ls -la deploy-webhook-v2.sh
# Phải thấy: -rwxr-xr-x (có x = executable)
```

---

## 🧪 Test Deploy Script

### 1. Chạy script

```bash
cd /home/dro94744/domains/api.websi.vn
bash deploy-webhook-v2.sh
```

### 2. Xem log

```bash
cat deploy.log
```

### 3. Xem log webhook (nếu có)

```bash
cat deploy-webhook.log
```

---

## 🔍 Kiểm tra kết quả

### Kiểm tra API

```bash
# Kiểm tra có vendor/ sau khi composer install
ls -la /home/dro94744/domains/api.websi.vn/api/vendor/

# Kiểm tra Git
cd /home/dro94744/domains/api.websi.vn
git status
```

### Kiểm tra Web

```bash
# Kiểm tra có web/
ls -la /home/dro94744/domains/websi.vn/web/

# Kiểm tra có out/ sau khi build
ls -la /home/dro94744/domains/websi.vn/web/out/

# Kiểm tra Git
cd /home/dro94744/domains/websi.vn
git status
```

---

## 🔄 Pull code mới (sau này)

### Pull API

```bash
cd /home/dro94744/domains/api.websi.vn
git pull origin main
```

### Pull Web

```bash
cd /home/dro94744/domains/websi.vn
git pull origin main
```

---

## 📝 Tạo Secret Key cho Webhook

```bash
# Tạo secret key ngẫu nhiên
openssl rand -hex 32

# Hoặc
date +%s | sha256sum | base64 | head -c 32
```

**Copy secret key và sửa trong `deploy-webhook.php`**

---

## 🔧 Tìm Composer (nếu cần)

```bash
# Tìm Composer
which composer
find /usr -name composer 2>/dev/null
find /home -name composer.phar 2>/dev/null

# Hoặc cài Composer
cd ~
curl -sS https://getcomposer.org/installer | php
mv composer.phar ~/composer
chmod +x ~/composer
```

---

## 📋 Tất cả lệnh trong 1 lần chạy

### Setup API:

```bash
cd /home/dro94744/domains/api.websi.vn && \
rm -rf api && \
git init && \
git remote remove origin 2>/dev/null && \
git remote add origin https://oiiovn:YOUR_TOKEN_HERE@github.com/oiiovn/banhmi-api.git && \
git pull origin main && \
chmod +x deploy-webhook-v2.sh && \
ls -la api/
```

### Setup Web:

```bash
cd /home/dro94744/domains/websi.vn && \
rm -rf web && \
[ ! -d ".git" ] && git init || true && \
git remote remove origin 2>/dev/null && \
git remote add origin https://oiiovn:YOUR_TOKEN_HERE@github.com/oiiovn/banhmi-web.git && \
git pull origin main && \
ls -la web/
```

### Test Deploy:

```bash
cd /home/dro94744/domains/api.websi.vn && \
bash deploy-webhook-v2.sh && \
cat deploy.log
```


