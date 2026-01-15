# 📤 Hướng Dẫn Upload Scripts Deploy Lên Hosting

## 📍 Vị Trí Files Trên Máy Local

**Files đang ở:**
```
/Users/buiquocvu/banhmi/
├── deploy-webhook.sh      ← Script deploy (shell)
├── deploy-webhook.php     ← Webhook endpoint (PHP)
└── auto-pull.sh           ← Script auto-pull (cron job)
```

## 📂 Nơi Upload Lên Hosting

### Option 1: Upload vào thư mục API (Khuyến nghị)

**Vị trí trên hosting:**
```
domains/api.websi.vn/
├── api/                   ← Laravel API
├── web/                   ← Next.js Web (nếu có)
├── deploy-webhook.sh      ← Upload file này vào đây
└── deploy-webhook.php     ← Upload file này vào đây
```

**Lý do:**
- API server thường có SSH access
- Dễ quản lý và chạy script
- Webhook URL sẽ là: `https://api.websi.vn/deploy-webhook.php`

### Option 2: Upload vào thư mục Web

**Vị trí trên hosting:**
```
domains/websi.vn/
├── public_html/           ← Web static files
└── deploy-webhook.sh      ← Upload vào đây (nếu có SSH)
└── deploy-webhook.php     ← Upload vào đây
```

**Lưu ý:** 
- Nếu chỉ có File Manager, có thể không chạy được `.sh`
- Nên dùng `.php` nếu chỉ có File Manager

## 🔧 Các Bước Upload

### Bước 1: Tìm thư mục đúng trên hosting

**Qua File Manager:**
1. Vào thư mục API: `domains/api.websi.vn/`
2. Hoặc thư mục Web: `domains/websi.vn/` (không phải `public_html/`)

### Bước 2: Upload files

**Upload 2 files:**
- `deploy-webhook.sh`
- `deploy-webhook.php`

**Vị trí sau khi upload:**
```
domains/api.websi.vn/
├── deploy-webhook.sh      ← File này
└── deploy-webhook.php     ← File này
```

### Bước 3: Set permissions

**Qua File Manager:**
- `deploy-webhook.sh`: Set permissions `755` (executable)
- `deploy-webhook.php`: Set permissions `644` (normal file)

**Qua SSH:**
```bash
chmod +x deploy-webhook.sh
chmod 644 deploy-webhook.php
```

### Bước 4: Sửa đường dẫn trong script

**Mở file `deploy-webhook.sh` trên hosting và sửa:**

```bash
# Sửa các dòng này:
PROJECT_DIR="/home/username/domains/api.websi.vn"  # ← Đường dẫn đến thư mục chứa api/ và web/
PUBLIC_HTML="/home/username/domains/websi.vn/public_html"  # ← Đường dẫn đến public_html/
```

**Cách tìm đường dẫn:**
- Qua File Manager: Xem đường dẫn đầy đủ ở trên
- Qua SSH: Chạy `pwd` trong thư mục đó

### Bước 5: Sửa secret key trong PHP

**Mở file `deploy-webhook.php` và sửa:**

```php
$SECRET = 'your-secret-key-here'; // ← Đổi thành secret key của bạn
```

**Tạo secret key:**
- Dùng một chuỗi ngẫu nhiên mạnh
- Ví dụ: `MySecretKey2024!@#Banhmi`

## 🧪 Test Script

### Test PHP endpoint:

**Truy cập:** `https://api.websi.vn/deploy-webhook.php`

**Kết quả:**
- Nếu không có payload → Có thể hiển thị lỗi hoặc message (bình thường)
- Nếu có lỗi 500 → Kiểm tra permissions và đường dẫn

### Test Shell script (qua SSH):

```bash
cd /path/to/deploy-webhook.sh
bash deploy-webhook.sh
```

## 📋 Checklist

- [ ] Đã upload `deploy-webhook.sh` lên hosting
- [ ] Đã upload `deploy-webhook.php` lên hosting
- [ ] Đã set permissions: `.sh` = `755`, `.php` = `644`
- [ ] Đã sửa đường dẫn trong `deploy-webhook.sh`
- [ ] Đã sửa secret key trong `deploy-webhook.php`
- [ ] Đã test PHP endpoint (không lỗi 500)
- [ ] Đã setup webhook trên GitHub

## 🎯 Tóm Tắt

**Files trên local:**
- `/Users/buiquocvu/banhmi/deploy-webhook.sh`
- `/Users/buiquocvu/banhmi/deploy-webhook.php`

**Upload lên hosting:**
- Vào: `domains/api.websi.vn/` (thư mục API)
- Upload 2 files vào đó
- Sửa đường dẫn trong script
- Set permissions

**Webhook URL:**
- `https://api.websi.vn/deploy-webhook.php`


