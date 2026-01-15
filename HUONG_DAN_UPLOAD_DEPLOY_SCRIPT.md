# 📤 Hướng Dẫn Upload Deploy Script Lên Hosting

## ❌ Vấn đề

File `deploy-webhook-v2.sh` không có trên hosting (có thể đã bị xóa khi clone repo mới).

## ✅ Giải pháp

### Cách 1: Upload qua File Manager

1. **Mở File Manager** trong cPanel
2. **Vào** `domains/api.websi.vn/`
3. **Upload** file `deploy-webhook-v2.sh` từ máy local
4. **Set permissions:** Click chuột phải → Permissions → `755`

### Cách 2: Tạo file trực tiếp trên hosting

**Qua SSH:**

```bash
# Vào thư mục API
cd /home/dro94744/domains/api.websi.vn

# Tạo file deploy-webhook-v2.sh
nano deploy-webhook-v2.sh
```

**Sau đó copy toàn bộ nội dung từ file `deploy-webhook-v2.sh` trên máy local vào.**

### Cách 3: Copy từ máy local qua SCP

**Trên máy local:**

```bash
# Copy file lên hosting
scp deploy-webhook-v2.sh dro94744@s2d84.your-server.com:/home/dro94744/domains/api.websi.vn/

# Set permissions
ssh dro94744@s2d84.your-server.com "chmod +x /home/dro94744/domains/api.websi.vn/deploy-webhook-v2.sh"
```

## 🔧 Sau khi upload

```bash
# Set permissions
chmod +x /home/dro94744/domains/api.websi.vn/deploy-webhook-v2.sh

# Test
bash deploy-webhook-v2.sh

# Xem log
cat deploy.log
```

## 📋 Checklist

- [ ] Đã upload deploy-webhook-v2.sh lên hosting
- [ ] Đã set permissions (chmod +x)
- [ ] Đã test script
- [ ] Đã kiểm tra log


