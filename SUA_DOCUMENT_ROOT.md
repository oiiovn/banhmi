# 🔧 Sửa Document Root cho API

## ❌ Vấn đề hiện tại

**Từ hình ảnh:**
- Document Root đang trỏ đến: `domains/api.websi.vn/public_html`
- Trong `public_html/` có thư mục `api/`
- Browser truy cập `https://api.websi.vn/index.html` → 404

**Vấn đề:** Document Root sai! Phải trỏ đến `api/public/` chứ không phải `public_html/`

## ✅ Giải pháp

### Cách 1: Sửa Document Root (Khuyến nghị)

**Qua cPanel:**

1. **Vào** cPanel → **Domains** → **api.websi.vn**
2. **Tìm** Document Root (hoặc Document Root Path)
3. **Sửa** từ:
   - `domains/api.websi.vn/public_html`
4. **Thành:**
   - `domains/api.websi.vn/api/public`
5. **Save** hoặc **Update**

### Cách 2: Di chuyển cấu trúc (Nếu không sửa được Document Root)

**Nếu không thể sửa Document Root, di chuyển files:**

```bash
# Vào thư mục API
cd /home/dro94744/domains/api.websi.vn

# Di chuyển nội dung api/public/ vào public_html/
cp -r api/public/* public_html/

# Hoặc tạo symlink (nếu hosting hỗ trợ)
# ln -s /home/dro94744/domains/api.websi.vn/api/public /home/dro94744/domains/api.websi.vn/public_html
```

## 🔍 Kiểm tra cấu trúc đúng

**Sau khi sửa Document Root:**

```
domains/api.websi.vn/
├── api/
│   ├── app/
│   ├── config/
│   ├── public/          ← Document Root phải trỏ đến đây
│   │   ├── index.php
│   │   └── .htaccess
│   └── ...
├── public_html/         ← Không dùng cho API
└── ...
```

## 📋 Checklist

- [ ] Đã sửa Document Root thành `domains/api.websi.vn/api/public`
- [ ] Đã kiểm tra có file `api/public/index.php`
- [ ] Đã kiểm tra có file `api/public/.htaccess`
- [ ] Đã test: `curl https://api.websi.vn/api/test`

## 🧪 Test sau khi sửa

```bash
# Test route
curl https://api.websi.vn/api/test

# Phải thấy JSON response:
# {
#   "status": "success",
#   "message": "API đang hoạt động! Auto-deploy thành công!",
#   ...
# }
```

## 🆘 Nếu vẫn lỗi

### Kiểm tra Document Root đã đúng chưa:

**Qua SSH:**
```bash
# Xem Document Root thực tế
grep -r "DocumentRoot" /etc/apache2/sites-enabled/api.websi.vn* 2>/dev/null
# Hoặc
grep -r "DocumentRoot" /etc/httpd/conf.d/api.websi.vn* 2>/dev/null
```

**Hoặc test trực tiếp:**
```bash
# Test index.php
curl https://api.websi.vn/index.php/api/test
```


