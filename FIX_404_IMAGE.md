# Hướng dẫn sửa lỗi 404 ảnh sản phẩm

## Vấn đề:
URL ảnh: `https://api.websi.vn/storage/products/1768465011_6968a273dc39b.jpeg` trả về **404 NOT FOUND**

## Nguyên nhân:
1. **Symlink storage chưa được tạo** - Laravel cần symlink để truy cập file từ `storage/app/public`
2. **File ảnh chưa được upload lên hosting** - File chỉ tồn tại trên local
3. **Quyền truy cập file** - File không có quyền đọc

---

## Cách sửa:

### Bước 1: Tạo symlink storage trên hosting

**Qua SSH:**
```bash
cd /path/to/api  # Vào thư mục Laravel API
php artisan storage:link
```

**Qua cPanel File Manager:**
1. Đăng nhập **cPanel** → **File Manager**
2. Vào thư mục `public/` (hoặc `public_html/api/`)
3. Tạo symlink:
   - Click **Symbolic Link** (nếu có)
   - Hoặc dùng terminal trong cPanel
   - Hoặc chạy lệnh: `ln -s ../storage/app/public storage`

**Kiểm tra:**
- Vào: `https://api.websi.vn/storage/`
- Nếu thấy thư mục `products/` → ✅ Đã tạo symlink thành công
- Nếu 404 → ❌ Chưa tạo symlink

---

### Bước 2: Upload file ảnh lên hosting

**Cách 1: Qua SSH/File Manager**
1. Vào thư mục: `storage/app/public/products/`
2. Upload các file ảnh từ local lên hosting
3. Đảm bảo quyền file: `chmod 644` (hoặc `755` cho thư mục)

**Cách 2: Tạo sản phẩm mới trên hosting**
- Upload ảnh mới qua form tạo sản phẩm
- File sẽ tự động được lưu vào `storage/app/public/products/`

**Kiểm tra:**
```bash
# Qua SSH
ls -la storage/app/public/products/
# Phải thấy file: 1768465011_6968a273dc39b.jpeg
```

---

### Bước 3: Kiểm tra quyền truy cập

**Qua SSH:**
```bash
cd /path/to/api
chmod -R 755 storage/
chmod -R 755 public/storage
chown -R www-data:www-data storage/  # Hoặc user của web server
chown -R www-data:www-data public/storage
```

---

### Bước 4: Kiểm tra cấu hình Laravel

**File: `api/.env`**
```env
APP_URL=https://api.websi.vn
FILESYSTEM_DISK=public
```

**File: `api/config/filesystems.php`**
```php
'public' => [
    'driver' => 'local',
    'root' => storage_path('app/public'),
    'url' => env('APP_URL').'/storage',  // Phải là: https://api.websi.vn/storage
    'visibility' => 'public',
],
```

---

### Bước 5: Clear cache Laravel

**Qua SSH:**
```bash
cd /path/to/api
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

---

## Kiểm tra sau khi sửa:

1. **Kiểm tra symlink:**
   ```
   https://api.websi.vn/storage/
   ```
   → Phải thấy thư mục `products/`

2. **Kiểm tra file ảnh:**
   ```
   https://api.websi.vn/storage/products/1768465011_6968a273dc39b.jpeg
   ```
   → Phải hiển thị ảnh (không phải 404)

3. **Kiểm tra trên website:**
   - Mở: `https://websi.vn`
   - Xem ảnh sản phẩm có hiển thị không

---

## Troubleshooting:

### Nếu vẫn 404 sau khi tạo symlink:

1. **Kiểm tra đường dẫn symlink:**
   ```bash
   ls -la public/storage
   # Phải thấy: public/storage -> ../storage/app/public
   ```

2. **Kiểm tra file có tồn tại:**
   ```bash
   ls -la storage/app/public/products/
   # Phải thấy file ảnh
   ```

3. **Kiểm tra .htaccess:**
   - File `public/.htaccess` phải có rule cho phép truy cập file
   - Hoặc kiểm tra cấu hình web server (Apache/Nginx)

4. **Kiểm tra APP_URL:**
   ```bash
   php artisan tinker
   >>> config('app.url')
   # Phải trả về: https://api.websi.vn
   ```

---

## Lưu ý:

- ⚠️ **File ảnh trên local KHÔNG tự động sync lên hosting**
- ✅ **Cần upload file ảnh lên hosting** hoặc tạo sản phẩm mới trên hosting
- ✅ **Symlink chỉ cần tạo 1 lần**, không cần tạo lại mỗi lần upload ảnh
- ✅ **Sau khi tạo symlink, file ảnh mới upload sẽ tự động accessible**

---

## Tóm tắt nhanh:

```bash
# 1. Tạo symlink
cd /path/to/api
php artisan storage:link

# 2. Upload file ảnh (nếu cần)
# Qua File Manager hoặc SSH

# 3. Set quyền
chmod -R 755 storage/
chmod -R 755 public/storage

# 4. Clear cache
php artisan config:clear
php artisan cache:clear

# 5. Kiểm tra
# Mở: https://api.websi.vn/storage/products/[tên-file]
```
