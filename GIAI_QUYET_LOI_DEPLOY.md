# 🔧 Giải Quyết Lỗi Deploy Script

## ❌ Lỗi 1: Web Git pull failed

```
error: The following untracked working tree files would be overwritten by merge:
        web/.eslintrc.json
        web/.gitignore
        ...
```

**Nguyên nhân:** Có files conflict trong `web/`

## ❌ Lỗi 2: Composer not found

```
composer: command not found
```

**Nguyên nhân:** Composer chưa được cài đặt hoặc không có trong PATH

## ✅ Giải pháp

### Giải quyết Lỗi 1: Web Git pull failed

**Vì web/ không cần pull từ api.websi.vn (web sẽ ở websi.vn riêng), có 2 cách:**

#### Cách 1: Bỏ qua web/ trong script (Khuyến nghị)

**Sửa `deploy-webhook-v2.sh` để không pull web/ từ api.websi.vn:**

```bash
# Tìm phần pull Web code, comment hoặc xóa:
# if [ -d "$WEB_SOURCE_DIR/../.git" ]; then
#     log "Pulling Web code from Git..."
#     cd "$(dirname $WEB_SOURCE_DIR)" || error "Cannot change to Web directory"
#     git pull origin main >> "$LOG_FILE" 2>&1 || log "Web Git pull failed (may not be a Git repo)"
# fi
```

#### Cách 2: Xóa web/ trong api.websi.vn

```bash
# Xóa web/ trong api.websi.vn (vì không cần)
rm -rf /home/dro94744/domains/api.websi.vn/web
```

### Giải quyết Lỗi 2: Composer not found

#### Cách 1: Tìm đường dẫn Composer

```bash
# Tìm Composer
which composer
# Hoặc
whereis composer
# Hoặc
find /usr -name composer 2>/dev/null
# Hoặc
find /home -name composer 2>/dev/null
```

#### Cách 2: Cài đặt Composer

```bash
# Download Composer
cd ~
curl -sS https://getcomposer.org/installer | php

# Di chuyển vào PATH
mv composer.phar /usr/local/bin/composer
# Hoặc
mv composer.phar ~/bin/composer
chmod +x ~/bin/composer

# Thêm vào PATH (nếu cần)
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

#### Cách 3: Dùng đường dẫn đầy đủ trong script

**Sửa `deploy-webhook-v2.sh`:**

```bash
# Tìm dòng:
composer install --no-dev --optimize-autoloader

# Sửa thành đường dẫn đầy đủ (nếu tìm được):
/usr/local/bin/composer install --no-dev --optimize-autoloader
# Hoặc
php /path/to/composer.phar install --no-dev --optimize-autoloader
```

#### Cách 4: Dùng php composer.phar

**Nếu có composer.phar trong thư mục:**

```bash
# Sửa script:
php composer.phar install --no-dev --optimize-autoloader
```

## 🔧 Sửa script deploy-webhook-v2.sh

### 1. Bỏ qua web/ trong api.websi.vn

**Tìm và comment phần pull Web:**

```bash
# Comment hoặc xóa phần này:
# if [ -d "$WEB_SOURCE_DIR/../.git" ]; then
#     log "Pulling Web code from Git..."
#     cd "$(dirname $WEB_SOURCE_DIR)" || error "Cannot change to Web directory"
#     git pull origin main >> "$LOG_FILE" 2>&1 || log "Web Git pull failed (may not be a Git repo)"
# fi
```

### 2. Sửa đường dẫn Composer

**Tìm dòng:**
```bash
composer install --no-dev --optimize-autoloader
```

**Sửa thành:**
```bash
# Tìm đường dẫn Composer trước
COMPOSER_CMD=$(which composer || echo "composer")

# Hoặc dùng đường dẫn đầy đủ
/usr/local/bin/composer install --no-dev --optimize-autoloader
```

## 📋 Checklist

- [ ] Đã tìm đường dẫn Composer
- [ ] Đã sửa script để bỏ qua web/ trong api.websi.vn
- [ ] Đã sửa đường dẫn Composer trong script
- [ ] Đã test lại script
- [ ] Đã kiểm tra log

## 🎯 Sau khi sửa

**Chạy lại:**
```bash
bash deploy-webhook-v2.sh
cat deploy.log
```


