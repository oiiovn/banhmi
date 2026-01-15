# 🧪 Hướng Dẫn Test Auto-Deploy

## ✅ Đã thêm route test

**Route mới:** `GET /api/test`

**Response:**
```json
{
    "status": "success",
    "message": "API đang hoạt động! Auto-deploy thành công!",
    "timestamp": "2026-01-13 17:30:00",
    "version": "1.0.0"
}
```

## 🔄 Đã push lên GitHub

- ✅ Đã commit: "Add test route /api/test for auto-deploy testing"
- ✅ Đã push lên `banhmi-api` repo

## 🧪 Cách test

### Bước 1: Kiểm tra webhook đã chạy chưa

**Trên hosting:**

```bash
# Xem log webhook
tail -f /home/dro94744/domains/api.websi.vn/deploy-webhook.log

# Xem log deploy
tail -f /home/dro94744/domains/api.websi.vn/deploy.log
```

**Hoặc kiểm tra sau khi push:**

```bash
cat /home/dro94744/domains/api.websi.vn/deploy-webhook.log | tail -20
cat /home/dro94744/domains/api.websi.vn/deploy.log | tail -20
```

### Bước 2: Pull code trên hosting (nếu webhook chưa setup)

**Nếu chưa setup webhook, pull thủ công:**

```bash
cd /home/dro94744/domains/api.websi.vn
git pull origin main
```

### Bước 3: Test route

**Qua browser hoặc curl:**

```bash
# Test route
curl https://api.websi.vn/api/test

# Hoặc mở browser:
# https://api.websi.vn/api/test
```

**Kết quả mong đợi:**
```json
{
    "status": "success",
    "message": "API đang hoạt động! Auto-deploy thành công!",
    "timestamp": "2026-01-13 17:30:00",
    "version": "1.0.0"
}
```

## ✅ Nếu thấy response trên

→ **Auto-deploy hoạt động!** 🎉

## ❌ Nếu không thấy route mới

**Kiểm tra:**

1. **Webhook đã chạy chưa?**
   ```bash
   cat deploy-webhook.log | tail -10
   ```

2. **Code đã pull chưa?**
   ```bash
   cd /home/dro94744/domains/api.websi.vn
   git log --oneline -5
   # Phải thấy commit "Add test route /api/test"
   ```

3. **Route cache đã clear chưa?**
   ```bash
   cd /home/dro94744/domains/api.websi.vn/api
   php artisan route:clear
   php artisan route:cache
   ```

## 🔄 Test lại

**Nếu cần pull thủ công:**

```bash
cd /home/dro94744/domains/api.websi.vn
git pull origin main
cd api
php artisan route:clear
php artisan route:cache
```

**Sau đó test lại:**
```bash
curl https://api.websi.vn/api/test
```

## 📋 Checklist

- [ ] Đã push code lên GitHub
- [ ] Đã kiểm tra webhook log (nếu setup webhook)
- [ ] Đã pull code trên hosting
- [ ] Đã clear route cache
- [ ] Đã test route `/api/test`
- [ ] Đã thấy response thành công


