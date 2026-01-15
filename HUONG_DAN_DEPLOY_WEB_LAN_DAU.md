# 🚀 Hướng Dẫn Deploy Web Lần Đầu

## 📋 Tình huống

**Web chưa có gì trong `domains/websi.vn/public_html/`** → Cần build và upload lần đầu

## 🎯 Có 2 cách

### Cách 1: Build trên máy local rồi upload (Khuyến nghị)

### Cách 2: Build trực tiếp trên hosting (Nếu có Node.js)

---

## 📦 Cách 1: Build trên máy local rồi upload

### Bước 1: Build trên máy local

**Trên máy của bạn:**

```bash
cd web

# Tạo file .env.production (nếu chưa có)
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=https://api.websi.vn/api
NEXT_PUBLIC_IMAGE_DOMAINS=api.websi.vn,websi.vn
EOF

# Cài dependencies (nếu chưa có)
npm install

# Build
npm run build
```

**Kết quả:** Tạo thư mục `web/out/` chứa files static

### Bước 2: Upload lên hosting

**Qua File Manager:**

1. **Mở File Manager**
2. **Vào** `domains/websi.vn/public_html/`
3. **Upload toàn bộ** nội dung trong `web/out/` lên đây

**Hoặc qua FTP:**
- Upload tất cả files trong `web/out/` → `public_html/`

### Bước 3: Tạo file .htaccess

**Tạo file `.htaccess` trong `public_html/`:**

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Bước 4: Set permissions

**Qua File Manager:**
- Chọn tất cả files → Permissions → `755` (cho folders) và `644` (cho files)

**Hoặc qua SSH:**
```bash
chmod -R 755 /home/dro94744/domains/websi.vn/public_html
```

### ✅ Xong!

Truy cập: `https://websi.vn` → Web sẽ hiển thị!

---

## 🔧 Cách 2: Build trực tiếp trên hosting

### Bước 1: Pull code lên hosting

**Đảm bảo đã pull code về `domains/api.websi.vn/`:**

```bash
cd /home/dro94744/domains/api.websi.vn
git pull origin main
```

### Bước 2: Build trên hosting

**Qua SSH hoặc Terminal trong cPanel:**

```bash
cd /home/dro94744/domains/api.websi.vn/web

# Tạo file .env.production
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=https://api.websi.vn/api
NEXT_PUBLIC_IMAGE_DOMAINS=api.websi.vn,websi.vn
EOF

# Cài dependencies
npm install

# Build
npm run build
```

**Lưu ý:** Cần có Node.js trên hosting!

### Bước 3: Copy files

```bash
# Copy build output vào public_html
cp -r /home/dro94744/domains/api.websi.vn/web/out/* /home/dro94744/domains/websi.vn/public_html/

# Set permissions
chmod -R 755 /home/dro94744/domains/websi.vn/public_html
```

### Bước 4: Tạo .htaccess

**Tạo file `.htaccess` trong `public_html/`:**

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### ✅ Xong!

---

## 🎯 Khuyến nghị

**Nên dùng Cách 1** (build trên local):
- ✅ Không cần Node.js trên hosting
- ✅ Build nhanh hơn
- ✅ Dễ debug lỗi
- ✅ Không tốn tài nguyên hosting

**Chỉ dùng Cách 2** nếu:
- Hosting có Node.js
- Muốn tự động hóa hoàn toàn

---

## 🔄 Sau khi deploy lần đầu

**Từ lần sau, dùng script `deploy-webhook.sh`:**
- Script sẽ tự động build và copy
- Chỉ cần push code lên Git → Webhook tự động deploy

---

## 📋 Checklist

- [ ] Đã build Next.js (tạo thư mục `out/`)
- [ ] Đã upload files vào `public_html/`
- [ ] Đã tạo file `.htaccess`
- [ ] Đã set permissions
- [ ] Đã test truy cập `https://websi.vn`


