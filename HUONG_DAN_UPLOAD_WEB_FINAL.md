# ✅ Build Thành Công - Hướng Dẫn Upload Web

## 🎉 Build đã thành công!

Next.js đã được build thành công. Bây giờ cần upload lên host.

## 📦 Cách upload

### Option 1: Upload toàn bộ thư mục web/ (Cần Node.js trên host)

**Các bước:**

1. **Nén thư mục web/ (loại bỏ node_modules):**
   ```bash
   cd /Users/buiquocvu/banhmi
   zip -r web-deploy.zip web/ -x "web/node_modules/*" "web/.next/cache/*"
   ```

2. **Upload `web-deploy.zip` lên host**

3. **Giải nén vào:** `domains/websi.vn/web/`

4. **Cài dependencies trên server:**
   ```bash
   cd domains/websi.vn/web
   npm install --production
   ```

5. **Chạy server:**
   ```bash
   npm start
   # Hoặc PM2:
   pm2 start npm --name "banhmi-web" -- start
   ```

6. **Cấu hình Nginx/Apache proxy** (xem file DEPLOY_WEB_NODEJS.md)

### Option 2: Dùng Static Export (Nếu host không có Node.js)

**Cần sửa lại để bỏ dynamic route hoặc dùng workaround.**

## 🔧 Nếu hosting KHÔNG có Node.js

**Giải pháp tạm thời:**

1. **Tạo file `public_html/index.html` đơn giản:**
```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Banhmi</title>
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
        }
        h1 { font-size: 2.5em; }
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

2. **Sau đó setup Node.js server hoặc dùng hosting có Node.js**

## 📋 Checklist

- [x] Đã build Next.js thành công
- [ ] Đã nén thư mục web/ (loại bỏ node_modules)
- [ ] Đã upload lên host
- [ ] Đã cài dependencies trên server
- [ ] Đã chạy Node.js server
- [ ] Đã cấu hình proxy (Nginx/Apache)
- [ ] Đã test: `websi.vn`

## 🆘 Nếu hosting không có Node.js

**Liên hệ support hosting để:**
- Hỏi về Node.js support
- Hoặc upgrade lên VPS/Cloud server có Node.js
- Hoặc dùng hosting khác có Node.js (Vercel, Netlify, etc.)


