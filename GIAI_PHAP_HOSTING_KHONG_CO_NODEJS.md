# 🔧 Giải Pháp: Hosting Không Có Node.js

## ❌ Vấn đề

- Hosting không có môi trường Node.js
- Next.js cần Node.js để chạy
- Lỗi 403 vì không thể chạy được

## 🎯 Giải pháp

### Option 1: Tìm Hosting Có Node.js (Khuyến nghị)

**Các hosting có Node.js:**
- **Vercel** (Miễn phí, tốt nhất cho Next.js)
- **Netlify** (Miễn phí)
- **Railway** (Miễn phí có giới hạn)
- **Render** (Miễn phí)
- **DigitalOcean App Platform** (Có free tier)

**Cách deploy lên Vercel (Dễ nhất):**

1. **Cài Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd web
   vercel
   ```

4. **Setup domain:**
   - Vào Vercel dashboard
   - Add domain: `websi.vn`
   - Update DNS records theo hướng dẫn

### Option 2: Dùng Static Export (Cần sửa code)

**Nếu bắt buộc dùng hosting hiện tại:**

1. **Tạm thời bỏ route `/payments/[id]`** hoặc đổi thành query params
2. **Build static:**
   ```bash
   cd web
   npm run build
   ```
3. **Upload thư mục `out/` lên `public_html/`**

### Option 3: Upgrade Hosting

**Liên hệ support hosting để:**
- Hỏi về Node.js support
- Upgrade lên VPS/Cloud server
- Hoặc dùng hosting khác

## 🚀 Hướng Dẫn Deploy Lên Vercel (Chi Tiết)

### Bước 1: Chuẩn bị

```bash
cd web
```

### Bước 2: Tạo file `vercel.json`

**File:** `web/vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.websi.vn/api",
    "NEXT_PUBLIC_IMAGE_DOMAINS": "api.websi.vn,websi.vn"
  }
}
```

### Bước 3: Deploy

```bash
vercel
```

### Bước 4: Setup Domain

1. Vào https://vercel.com/dashboard
2. Chọn project
3. Settings → Domains
4. Add domain: `websi.vn`
5. Update DNS:
   - Type: `CNAME`
   - Name: `@` hoặc `www`
   - Value: `cname.vercel-dns.com`

## 📋 Checklist

- [ ] Đã kiểm tra hosting có Node.js không
- [ ] Nếu không có: Chọn giải pháp (Vercel/Netlify/Upgrade)
- [ ] Nếu dùng Vercel: Đã setup domain
- [ ] Đã test: `websi.vn`

## 🆘 Nếu Vẫn Muốn Dùng Hosting Hiện Tại

**Giải pháp tạm thời:**

1. **Tạo file `public_html/index.html` đơn giản:**
```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Banhmi - Đang bảo trì</title>
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
        h1 { font-size: 2.5em; margin-bottom: 20px; }
        p { font-size: 1.2em; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🍞 Banhmi</h1>
        <p>Website đang được nâng cấp.</p>
        <p>Vui lòng quay lại sau.</p>
        <p style="margin-top: 30px; font-size: 0.9em; opacity: 0.8;">
            Liên hệ: support@websi.vn
        </p>
    </div>
</body>
</html>
```

2. **Sau đó migrate sang Vercel hoặc hosting có Node.js**

