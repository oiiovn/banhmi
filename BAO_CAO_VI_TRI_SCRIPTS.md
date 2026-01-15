# ✅ Kiểm Tra Vị Trí Scripts

## ✅ Đã đúng!

**Scripts hiện tại đang ở:**
```
domains/api.websi.vn/
├── public_html/           ← Thư mục web
├── deploy-webhook.sh      ← ✅ ĐÚNG!
└── deploy-webhook.php     ← ✅ ĐÚNG!
```

## 🔍 Cần kiểm tra thêm

### 1. Có thư mục `api/` không?

**Trong `domains/api.websi.vn/` phải có:**
- ✅ `deploy-webhook.sh`
- ✅ `deploy-webhook.php`
- ✅ `public_html/`
- ❓ `api/` (thư mục Laravel) - **Cần kiểm tra**

**Nếu không thấy `api/`:**
- Có thể đang ở trong `public_html/`
- Hoặc ở thư mục khác
- Cần tìm và di chuyển về đây

### 2. Sửa đường dẫn trong script

**Mở file `deploy-webhook.sh` và sửa 2 dòng:**

```bash
PROJECT_DIR="/home/dro94744/domains/api.websi.vn"  # ← Đã đúng!
PUBLIC_HTML="/home/dro94744/domains/websi.vn/public_html"  # ← Cần kiểm tra
```

**Lưu ý:**
- `PROJECT_DIR` trỏ đến `domains/api.websi.vn/` → ✅ Đúng
- `PUBLIC_HTML` trỏ đến `domains/websi.vn/public_html/` → Cần kiểm tra đường dẫn thực tế

## 📋 Bước tiếp theo

1. ✅ **Scripts đã ở đúng vị trí** → Hoàn thành
2. ⏭️ **Sửa đường dẫn trong script** → Cần làm
3. ⏭️ **Set permissions** → Cần làm
4. ⏭️ **Setup webhook trên GitHub** → Cần làm


