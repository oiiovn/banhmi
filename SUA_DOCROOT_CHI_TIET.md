# 🔧 Sửa Docroot cho api.websi.vn

## ❌ Docroot hiện tại (SAI)

Từ hình ảnh cPanel:
```
Docroot: /domains/api.websi.vn/public_html/api/public
```

**Vấn đề:** Đường dẫn này SAI vì:
- Code nằm ở: `domains/api.websi.vn/api/`
- Public folder: `domains/api.websi.vn/api/public/`
- **KHÔNG có** `public_html` ở giữa!

## ✅ Docroot đúng

```
Docroot: /domains/api.websi.vn/api/public
```

## 🔧 Cách sửa trong cPanel

### Bước 1: Click Edit
- Tìm dòng `api.websi.vn` trong bảng
- Click vào icon **✏️ (Edit)** bên phải

### Bước 2: Sửa Docroot
- Tìm trường **Docroot** hoặc **Document Root**
- **Xóa** đường dẫn cũ:
  ```
  /domains/api.websi.vn/public_html/api/public
  ```
- **Nhập** đường dẫn mới:
  ```
  /domains/api.websi.vn/api/public
  ```

### Bước 3: Save
- Click **Save** hoặc **Update**
- Đợi vài giây để cPanel cập nhật

## 🧪 Test sau khi sửa

```bash
# Test route
curl https://api.websi.vn/api/test

# Phải thấy JSON:
# {
#   "status": "success",
#   "message": "API đang hoạt động! Auto-deploy thành công!",
#   ...
# }
```

## 📋 Cấu trúc thư mục đúng

```
/home/dro94744/domains/api.websi.vn/
├── api/                    ← Code Laravel ở đây
│   ├── app/
│   ├── config/
│   ├── public/             ← Docroot phải trỏ đến đây
│   │   ├── index.php
│   │   └── .htaccess
│   ├── routes/
│   ├── storage/
│   └── ...
├── public_html/            ← KHÔNG dùng cho API
└── ...
```

## 🆘 Nếu vẫn lỗi sau khi sửa

### Kiểm tra đường dẫn thực tế:

**Qua SSH:**
```bash
# Kiểm tra có thư mục api/public không
ls -la /home/dro94744/domains/api.websi.vn/api/public/

# Phải thấy:
# - index.php
# - .htaccess
```

### Kiểm tra file .htaccess:

```bash
cat /home/dro94744/domains/api.websi.vn/api/public/.htaccess
```

### Kiểm tra permissions:

```bash
cd /home/dro94744/domains/api.websi.vn/api
chmod -R 755 storage bootstrap/cache
```

### Clear cache:

```bash
cd /home/dro94744/domains/api.websi.vn/api
php artisan route:clear
php artisan config:clear
php artisan route:cache
php artisan config:cache
```


