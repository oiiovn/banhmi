# 🔧 Giải Quyết Conflict với Deploy Scripts

## ❌ Lỗi

```
error: The following untracked working tree files would be overwritten by merge:
        deploy-webhook.php
        deploy-webhook.sh
Please move or remove them before you merge.
```

**Nguyên nhân:** Files `deploy-webhook.php` và `deploy-webhook.sh` đã tồn tại trong thư mục nhưng chưa được track bởi Git.

## ✅ Giải pháp

### Cách 1: Backup và xóa (Khuyến nghị)

```bash
# Backup các files deploy scripts (nếu đã cấu hình)
mkdir -p ~/backup-deploy
cp deploy-webhook.php ~/backup-deploy/
cp deploy-webhook.sh ~/backup-deploy/

# Xóa các files conflict
rm deploy-webhook.php deploy-webhook.sh

# Pull lại
git pull origin main
```

### Cách 2: Di chuyển sang thư mục khác

```bash
# Tạo thư mục backup
mkdir -p ~/deploy-scripts-backup

# Di chuyển các files
mv deploy-webhook.php ~/deploy-scripts-backup/
mv deploy-webhook.sh ~/deploy-scripts-backup/

# Pull lại
git pull origin main
```

### Cách 3: Add vào Git (nếu muốn giữ)

```bash
# Add các files vào Git
git add deploy-webhook.php deploy-webhook.sh
git commit -m "Add deploy scripts"

# Pull lại với allow-unrelated-histories
git pull origin main --allow-unrelated-histories
```

## 🎯 Khuyến nghị

**Dùng Cách 1** vì:
- ✅ Giữ lại bản backup (nếu đã cấu hình)
- ✅ Pull code từ Git về
- ✅ Sau đó copy lại deploy scripts từ backup nếu cần

## 📋 Sau khi pull thành công

```bash
# Kiểm tra cấu trúc repo
ls -la

# Phải thấy:
# - api/          (Laravel API)
# - web/          (Next.js Web)
# - mobile/       (Flutter Mobile)
# - deploy-webhook.php (từ Git, nếu có)
# - deploy-webhook.sh  (từ Git, nếu có)
```

## 🔄 Nếu repo có cả api/ và web/

**Sau khi pull, bạn sẽ có:**
```
domains/api.websi.vn/
├── api/                   ← Từ Git
├── web/                   ← Từ Git
├── deploy-webhook.php     ← Từ Git (hoặc từ backup)
└── deploy-webhook.sh      ← Từ Git (hoặc từ backup)
```

**Nếu cần copy web/ sang websi.vn:**
```bash
# Copy web/ sang websi.vn (nếu cần)
cp -r web /home/dro94744/domains/websi.vn/
```

## ✅ Checklist

- [ ] Đã backup deploy scripts (nếu đã cấu hình)
- [ ] Đã xóa hoặc di chuyển files conflict
- [ ] Đã pull code thành công
- [ ] Đã kiểm tra có thư mục `api/` chưa
- [ ] Đã kiểm tra có thư mục `web/` chưa
- [ ] Đã copy deploy scripts từ backup (nếu cần)


