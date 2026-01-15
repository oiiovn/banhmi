# 🔧 Hướng Dẫn Sửa Script và Tìm Composer

## ✅ Đã sửa script

**Đã sửa `deploy-webhook-v2.sh` để:**
1. ✅ Bỏ qua pull web/ từ api.websi.vn
2. ✅ Tự động tìm Composer

## 📥 Upload script mới lên hosting

**Qua File Manager hoặc SSH:**

1. **Download script mới** từ máy local
2. **Upload lên hosting** vào `domains/api.websi.vn/deploy-webhook-v2.sh`
3. **Set permissions:**
   ```bash
   chmod +x /home/dro94744/domains/api.websi.vn/deploy-webhook-v2.sh
   ```

## 🔍 Tìm Composer trên hosting

### Cách 1: Tìm Composer có sẵn

```bash
# Tìm Composer
which composer
find /usr -name composer 2>/dev/null
find /home -name composer 2>/dev/null
find /opt -name composer 2>/dev/null

# Hoặc tìm composer.phar
find /home -name composer.phar 2>/dev/null
```

### Cách 2: Cài Composer

```bash
# Download Composer
cd ~
curl -sS https://getcomposer.org/installer | php

# Di chuyển vào thư mục home
mv composer.phar ~/composer
chmod +x ~/composer

# Test
~/composer --version
```

### Cách 3: Dùng Composer từ cPanel (nếu có)

**Một số hosting có Composer trong cPanel:**
- Vào cPanel → Software → Composer
- Hoặc tìm trong Softaculous

## 🔧 Sửa script thủ công (nếu cần)

**Nếu script không tự tìm được Composer, sửa thủ công:**

```bash
nano deploy-webhook-v2.sh
```

**Tìm dòng:**
```bash
COMPOSER_CMD=$(which composer 2>/dev/null || echo "")
```

**Sửa thành đường dẫn đầy đủ:**
```bash
COMPOSER_CMD="~/composer"  # Hoặc đường dẫn bạn tìm được
# Hoặc
COMPOSER_CMD="php ~/composer.phar"
```

## 🧪 Test script

```bash
cd /home/dro94744/domains/api.websi.vn
bash deploy-webhook-v2.sh
cat deploy.log
```

## 📋 Checklist

- [ ] Đã upload script mới lên hosting
- [ ] Đã set permissions cho script
- [ ] Đã tìm hoặc cài Composer
- [ ] Đã test script
- [ ] Đã kiểm tra log

## 💡 Lưu ý

1. **Script mới sẽ tự động tìm Composer** → Không cần sửa thủ công
2. **Nếu không tìm được**, script sẽ báo lỗi và hướng dẫn
3. **Web sẽ không bị pull từ api.websi.vn** → Tránh conflict


