# 🧪 Test Document Root

## ❌ Vấn đề

**Bạn đã sửa Document Root thành:**
```
/domains/api.websi.vn/api/public
```

**Nhưng file `index.html` đang ở:**
```
/domains/api.websi.vn/public_html/index.html
```

→ **Kết quả:** Không thể truy cập `index.html` vì Document Root đã trỏ sang `api/public/` rồi!

## ✅ Giải pháp: Test Document Root đúng cách

### Cách 1: Test với file trong `api/public/` (Khuyến nghị)

**Qua SSH hoặc File Manager:**

1. **Vào** `domains/api.websi.vn/api/public/`
2. **Tạo file test:**
   ```bash
   # Qua SSH
   cd /home/dro94744/domains/api.websi.vn/api/public
   echo "API Document Root OK!" > test.html
   ```

3. **Test:**
   ```
   https://api.websi.vn/test.html
   ```
   → Phải thấy "API Document Root OK!"

### Cách 2: Test với Laravel index.php

**Test trực tiếp:**
```
https://api.websi.vn/index.php
```

**Hoặc test route:**
```
https://api.websi.vn/api/test
```

→ Phải thấy JSON response hoặc Laravel welcome page

### Cách 3: Tạm thời test với public_html (KHÔNG khuyến nghị)

**Nếu muốn test `index.html` trong `public_html`:**

1. **Tạm thời sửa Document Root về:**
   ```
   /domains/api.websi.vn/public_html
   ```

2. **Test:**
   ```
   https://api.websi.vn/index.html
   ```

3. **Sau đó sửa lại về:**
   ```
   /domains/api.websi.vn/api/public
   ```

⚠️ **Lưu ý:** Cách này chỉ để test, sau đó phải sửa lại về `api/public` để API hoạt động!

## 🧪 Test đầy đủ sau khi sửa Document Root

### Bước 1: Test file tĩnh

```bash
# Tạo file test
cd /home/dro94744/domains/api.websi.vn/api/public
echo "Test OK!" > test.html
```

**Truy cập:** `https://api.websi.vn/test.html`
→ Phải thấy "Test OK!"

### Bước 2: Test Laravel index.php

**Truy cập:** `https://api.websi.vn/index.php`
→ Phải thấy Laravel welcome page hoặc JSON response

### Bước 3: Test API route

**Truy cập:** `https://api.websi.vn/api/test`
→ Phải thấy JSON:
```json
{
  "status": "success",
  "message": "API đang hoạt động! Auto-deploy thành công!",
  ...
}
```

## 📋 Checklist

- [ ] Document Root đã sửa thành `/domains/api.websi.vn/api/public`
- [ ] Đã test file tĩnh trong `api/public/` → OK
- [ ] Đã test `index.php` → OK
- [ ] Đã test route `/api/test` → OK

## 🆘 Nếu vẫn 404

### Kiểm tra Document Root đã đúng chưa:

**Qua cPanel:**
- Vào **Subdomain Management** → **api.websi.vn**
- Kiểm tra **Docroot** phải là: `/domains/api.websi.vn/api/public`

### Kiểm tra file có tồn tại không:

```bash
# Kiểm tra api/public/index.php
ls -la /home/dro94744/domains/api.websi.vn/api/public/index.php

# Kiểm tra api/public/.htaccess
ls -la /home/dro94744/domains/api.websi.vn/api/public/.htaccess
```

### Kiểm tra permissions:

```bash
cd /home/dro94744/domains/api.websi.vn/api
chmod -R 755 public storage bootstrap/cache
```


