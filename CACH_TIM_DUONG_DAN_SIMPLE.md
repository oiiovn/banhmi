# 🔍 Cách Tìm Đường Dẫn - Đơn Giản Nhất

## 🎯 Cần Tìm 2 Đường Dẫn

1. **PROJECT_DIR** - Thư mục chứa `api/` và `web/`
2. **PUBLIC_HTML** - Thư mục `public_html/` của website

## 📂 Cách 1: Qua File Manager (Dễ nhất)

### Tìm PROJECT_DIR:

1. **Mở File Manager** trong cPanel
2. **Tìm và vào** thư mục `api.websi.vn` (thư mục chứa `api/` và `web/`)
3. **Xem đường dẫn** ở trên cùng (breadcrumb hoặc address bar)

**Ví dụ thấy:**
```
Home > domains > api.websi.vn
```

**Đường dẫn đầy đủ thường là:**
```
/home/dro94744/domains/api.websi.vn
```
*(Thay `dro94744` bằng username của bạn)*

### Tìm PUBLIC_HTML:

1. **Mở File Manager**
2. **Tìm và vào** thư mục `websi.vn`
3. **Vào thư mục** `public_html/`
4. **Xem đường dẫn** ở trên

**Ví dụ thấy:**
```
Home > domains > websi.vn > public_html
```

**Đường dẫn đầy đủ thường là:**
```
/home/dro94744/domains/websi.vn/public_html
```

## 🔧 Cách 2: Tạo File Test (Nếu không thấy đường dẫn)

### Tạo file `test-path.php`:

**Nội dung:**
```php
<?php
echo "PROJECT_DIR: " . __DIR__ . "\n";
?>
```

**Upload vào thư mục `api.websi.vn/`**

**Truy cập:** `https://api.websi.vn/test-path.php`

**Kết quả sẽ hiển thị đường dẫn đầy đủ!**

## 📝 Ví Dụ Cụ Thể

**Giả sử bạn thấy:**
- Thư mục `api.websi.vn` ở: `Home > domains > api.websi.vn`
- Thư mục `public_html` ở: `Home > domains > websi.vn > public_html`

**Thì đường dẫn thường là:**
```bash
PROJECT_DIR="/home/dro94744/domains/api.websi.vn"
PUBLIC_HTML="/home/dro94744/domains/websi.vn/public_html"
```

**Lưu ý:** Thay `dro94744` bằng username thực tế của bạn!

## ✅ Sau Khi Tìm Được

**Sửa trong script `deploy-webhook.sh`:**
```bash
PROJECT_DIR="/home/dro94744/domains/api.websi.vn"  # ← Dán đường dẫn bạn tìm được
PUBLIC_HTML="/home/dro94744/domains/websi.vn/public_html"  # ← Dán đường dẫn bạn tìm được
```

## 🆘 Nếu Vẫn Không Tìm Được

**Liên hệ support hosting và hỏi:**
- "Đường dẫn đầy đủ đến thư mục `domains/api.websi.vn` là gì?"
- "Đường dẫn đầy đủ đến thư mục `domains/websi.vn/public_html` là gì?"


