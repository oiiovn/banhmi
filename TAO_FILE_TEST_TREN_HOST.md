# 📝 Hướng Dẫn Tạo File Test Trên Host

## ❌ Lỗi: 404 Not Found - websi.vn/test.html

File `test.html` chưa được tạo hoặc chưa ở đúng vị trí.

## 🔧 Cách tạo file test.html trên host

### Qua File Manager:

#### Bước 1: Vào File Manager
1. Đăng nhập cPanel
2. Tìm **File Manager**
3. Click vào

#### Bước 2: Điều hướng đến public_html
1. Mở thư mục: `domains/`
2. Mở thư mục: `websi.vn/`
3. Mở thư mục: `public_html/`

#### Bước 3: Tạo file mới
1. Click nút **"New File"** hoặc **"+"** → **"New File"**
2. Nhập tên: `test.html`
3. Click **Create** hoặc **OK**

#### Bước 4: Sửa nội dung file
1. **Chọn file** `test.html` (click vào tên file)
2. Click **Edit** (icon bút chì)
3. **Nhập nội dung:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Test</title>
</head>
<body>
    <h1>Web đang hoạt động!</h1>
    <p>Nếu bạn thấy dòng này, server đang hoạt động tốt.</p>
</body>
</html>
```
4. Click **Save Changes**

#### Bước 5: Kiểm tra
1. Truy cập: `websi.vn/test.html`
2. Nếu hiển thị nội dung → Server OK ✅
3. Nếu vẫn 404 → Kiểm tra Document Root

## 🔍 Kiểm tra Document Root

### Cách 1: Qua cPanel
1. Vào **Domain Setup** hoặc **Subdomains**
2. Tìm domain `websi.vn`
3. Xem **Document Root**
4. Phải là: `/domains/websi.vn/public_html`

### Cách 2: Kiểm tra file có ở đúng vị trí không
1. Vào File Manager
2. Điều hướng đến `domains/websi.vn/`
3. Kiểm tra có thư mục `public_html/` không
4. Kiểm tra file `test.html` có trong `public_html/` không

## 📋 Checklist

- [ ] Đã vào File Manager
- [ ] Đã điều hướng đến `public_html/`
- [ ] Đã tạo file `test.html`
- [ ] Đã nhập nội dung HTML
- [ ] Đã save file
- [ ] Đã kiểm tra Document Root
- [ ] Đã test: `websi.vn/test.html`

## 🆘 Nếu vẫn 404

### Kiểm tra 1: File có tồn tại không?
1. Vào File Manager
2. Xem danh sách file trong `public_html/`
3. Có thấy `test.html` không?

### Kiểm tra 2: Document Root có đúng không?
1. Vào Domain Setup
2. Xem Document Root
3. Có trỏ đến `public_html/` không?

### Kiểm tra 3: Permissions
1. Chọn file `test.html`
2. Click "Permissions"
3. Phải là: `644` (rw-r--r--)

### Kiểm tra 4: Tên file có đúng không?
- Phải là: `test.html` (không phải `test.html.txt`)
- Kiểm tra extension

## ✅ Sau khi test.html hoạt động

Nếu `test.html` hiển thị được:
1. ✅ Server đang hoạt động
2. ✅ Document Root đúng
3. ✅ Permissions OK
4. ⚠️ Vấn đề là Next.js chưa được build/upload

**Tiếp theo:**
- Build Next.js: `npm run build` trong thư mục `web/`
- Upload nội dung từ `web/out/` lên `public_html/`
- Tạo file `.htaccess` cho routing

## 📝 Tạo file index.html tạm thời

Nếu chưa có file từ Next.js, có thể tạo file `index.html` tạm:

**File:** `public_html/index.html`

**Nội dung:**
```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Banhmi - Đang cập nhật</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            padding: 40px;
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
        }
        h1 { font-size: 2.5em; margin-bottom: 20px; }
        p { font-size: 1.2em; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🍞 Banhmi</h1>
        <p>Website đang được cập nhật.</p>
        <p>Vui lòng quay lại sau.</p>
    </div>
</body>
</html>
```

Sau đó upload file từ Next.js build để thay thế.


