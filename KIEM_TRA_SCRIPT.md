# ✅ Kiểm Tra Script Deploy

## ✅ Script Đúng Rồi!

Script `deploy-webhook.sh` của bạn **HOÀN TOÀN ĐÚNG** và sẵn sàng sử dụng.

## 📋 Checklist Script

### ✅ Cấu trúc:
- [x] Có phần Configuration (đường dẫn)
- [x] Có Functions (log, error)
- [x] Có phần Deploy Web (Next.js)
- [x] Có phần Deploy API (Laravel)
- [x] Có error handling
- [x] Có logging

### ✅ Logic:
- [x] Kiểm tra thư mục tồn tại
- [x] Pull code từ Git
- [x] Build Next.js
- [x] Copy files ra public_html
- [x] Clear Laravel cache

## 🔧 Chỉ Cần Sửa Đường Dẫn

**Khi upload lên hosting, sửa 2 dòng này:**

```bash
PROJECT_DIR="/home/username/domains/api.websi.vn"  # ← Sửa đường dẫn thực tế
PUBLIC_HTML="/home/username/domains/websi.vn/public_html"  # ← Sửa đường dẫn thực tế
```

**Cách tìm đường dẫn:**
- Qua File Manager: Xem đường dẫn đầy đủ
- Qua SSH: Chạy `pwd` trong thư mục đó

## ⚠️ Lưu Ý

### 1. Đường dẫn phải đúng

**Ví dụ đúng:**
```bash
PROJECT_DIR="/home/dro94744/domains/api.websi.vn"
PUBLIC_HTML="/home/dro94744/domains/websi.vn/public_html"
```

**Kiểm tra:**
- Thư mục `api/` phải có trong `PROJECT_DIR`
- Thư mục `web/` phải có trong `PROJECT_DIR` (nếu có)
- Thư mục `public_html/` phải tồn tại

### 2. Permissions

- Script phải có quyền execute: `755`
- Thư mục project phải có quyền đọc: `755`

### 3. Git phải được setup

- Thư mục project phải là Git repository
- Remote `origin` phải trỏ đến đúng repository
- Branch `main` phải tồn tại

## 🧪 Test Script

### Test thủ công (qua SSH):

```bash
cd /path/to/deploy-webhook.sh
bash deploy-webhook.sh
```

**Kiểm tra log:**
```bash
cat deploy.log
```

## ✅ Kết Luận

**Script của bạn HOÀN TOÀN ĐÚNG!**

Chỉ cần:
1. Upload lên hosting
2. Sửa đường dẫn
3. Set permissions
4. Setup webhook trên GitHub

Script sẽ tự động:
- Pull code từ Git
- Build Next.js
- Deploy Web và API


