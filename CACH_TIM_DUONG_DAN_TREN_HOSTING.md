# 🔍 Cách Tìm Đường Dẫn Thực Tế Trên Hosting

## 🎯 Mục Tiêu

Tìm đường dẫn đầy đủ của 2 thư mục:
1. **PROJECT_DIR** - Thư mục chứa `api/` và `web/`
2. **PUBLIC_HTML** - Thư mục `public_html/` của website

## 📂 Cách 1: Qua File Manager (Dễ nhất)

### Bước 1: Tìm PROJECT_DIR

**Tìm thư mục chứa `api/` và `web/`:**

1. **Mở File Manager** trong cPanel
2. **Tìm thư mục** có chứa:
   - Thư mục `api/`
   - Thư mục `web/`
3. **Xem đường dẫn** ở trên cùng (breadcrumb)

**Ví dụ:**
```
Home > domains > api.websi.vn
```

**Đường dẫn đầy đủ thường là:**
```
/home/username/domains/api.websi.vn
```

**Hoặc:**
```
/home/dro94744/domains/api.websi.vn
```

**Cách xem đường dẫn đầy đủ:**
- Click vào thư mục `api.websi.vn`
- Xem đường dẫn ở trên (có thể có nút "Copy Path" hoặc hiển thị đầy đủ)
- Hoặc click chuột phải → Properties → Xem đường dẫn

### Bước 2: Tìm PUBLIC_HTML

**Tìm thư mục `public_html/` của website:**

1. **Mở File Manager**
2. **Tìm thư mục** `websi.vn` (hoặc domain chính)
3. **Vào thư mục** `public_html/`
4. **Xem đường dẫn** ở trên

**Ví dụ:**
```
Home > domains > websi.vn > public_html
```

**Đường dẫn đầy đủ thường là:**
```
/home/username/domains/websi.vn/public_html
```

**Hoặc:**
```
/home/dro94744/domains/websi.vn/public_html
```

## 🔧 Cách 2: Qua SSH (Nếu có)

### Bước 1: Kết nối SSH

1. **Mở Terminal** hoặc **SSH Client**
2. **Kết nối** đến hosting:
   ```bash
   ssh username@your-server.com
   ```

### Bước 2: Tìm đường dẫn

**Tìm PROJECT_DIR:**
```bash
# Vào thư mục chứa api/ và web/
cd domains/api.websi.vn

# Xem đường dẫn hiện tại
pwd
```

**Kết quả ví dụ:**
```
/home/dro94744/domains/api.websi.vn
```

**Tìm PUBLIC_HTML:**
```bash
# Vào thư mục public_html
cd ../websi.vn/public_html

# Xem đường dẫn hiện tại
pwd
```

**Kết quả ví dụ:**
```
/home/dro94744/domains/websi.vn/public_html
```

## 📝 Ví Dụ Cụ Thể

### Trường hợp 1: Hosting thông thường

**Nếu username là `dro94744`:**
```bash
PROJECT_DIR="/home/dro94744/domains/api.websi.vn"
PUBLIC_HTML="/home/dro94744/domains/websi.vn/public_html"
```

### Trường hợp 2: Hosting khác

**Nếu đường dẫn khác:**
```bash
PROJECT_DIR="/var/www/api.websi.vn"
PUBLIC_HTML="/var/www/websi.vn/public_html"
```

**Hoặc:**
```bash
PROJECT_DIR="/home/user123/public_html/api"
PUBLIC_HTML="/home/user123/public_html"
```

## 🔍 Cách Kiểm Tra Đường Dẫn Đúng

### Test 1: Kiểm tra thư mục tồn tại

**Qua SSH:**
```bash
# Test PROJECT_DIR
ls -la /home/dro94744/domains/api.websi.vn/api
ls -la /home/dro94744/domains/api.websi.vn/web

# Test PUBLIC_HTML
ls -la /home/dro94744/domains/websi.vn/public_html
```

**Nếu thấy files → Đường dẫn đúng!**

### Test 2: Chạy script thử

**Sửa đường dẫn trong script, sau đó chạy thử:**
```bash
bash deploy-webhook.sh
```

**Xem log:**
```bash
cat deploy.log
```

**Nếu không có lỗi "directory not found" → Đường dẫn đúng!**

## 📋 Checklist Tìm Đường Dẫn

### PROJECT_DIR:
- [ ] Đã tìm thấy thư mục chứa `api/` và `web/`
- [ ] Đã xem đường dẫn đầy đủ
- [ ] Đã test: `ls -la $PROJECT_DIR/api` (có files)
- [ ] Đã test: `ls -la $PROJECT_DIR/web` (có files)

### PUBLIC_HTML:
- [ ] Đã tìm thấy thư mục `public_html/`
- [ ] Đã xem đường dẫn đầy đủ
- [ ] Đã test: `ls -la $PUBLIC_HTML` (có files)

## 🆘 Nếu Không Tìm Thấy

### Hỏi support hosting:

1. **Đường dẫn đầy đủ** đến thư mục domain là gì?
2. **Document Root** của domain `api.websi.vn` là gì?
3. **Document Root** của domain `websi.vn` là gì?

### Hoặc xem trong cPanel:

1. **Domains** → **api.websi.vn** → Xem **Document Root**
2. **Domains** → **websi.vn** → Xem **Document Root**

## 💡 Mẹo

### Cách nhanh nhất:

1. **Qua File Manager:**
   - Vào thư mục `api.websi.vn`
   - Xem đường dẫn ở trên (breadcrumb)
   - Copy đường dẫn đó

2. **Hoặc tạo file test:**
   - Tạo file `test-path.php` trong thư mục đó
   - Nội dung: `<?php echo __DIR__; ?>`
   - Truy cập qua browser → Xem đường dẫn

## ✅ Sau Khi Tìm Được

**Sửa trong script:**
```bash
PROJECT_DIR="/home/dro94744/domains/api.websi.vn"  # ← Đường dẫn bạn vừa tìm được
PUBLIC_HTML="/home/dro94744/domains/websi.vn/public_html"  # ← Đường dẫn bạn vừa tìm được
```

**Lưu ý:**
- Phải có dấu ngoặc kép `""`
- Phải là đường dẫn đầy đủ (bắt đầu bằng `/`)
- Không có khoảng trắng thừa


