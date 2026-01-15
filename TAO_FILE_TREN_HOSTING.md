# 📝 Tạo File Trên Hosting (Không có nano)

## ✅ Cách 1: Dùng vi (thường có sẵn)

```bash
# Vào thư mục API
cd /home/dro94744/domains/api.websi.vn

# Tạo file
vi deploy-webhook-v2.sh
```

**Cách dùng vi:**
1. Nhấn `i` để vào chế độ insert
2. Paste nội dung file (hoặc gõ từng dòng)
3. Nhấn `Esc` để thoát chế độ insert
4. Gõ `:wq` và nhấn `Enter` để lưu và thoát

## ✅ Cách 2: Dùng cat với heredoc (Dễ nhất)

**Copy toàn bộ nội dung file `deploy-webhook-v2.sh` từ máy local, sau đó chạy:**

```bash
cd /home/dro94744/domains/api.websi.vn

cat > deploy-webhook-v2.sh << 'SCRIPT_END'
# Paste toàn bộ nội dung file deploy-webhook-v2.sh ở đây
SCRIPT_END

chmod +x deploy-webhook-v2.sh
```

## ✅ Cách 3: Upload qua File Manager (Khuyến nghị)

1. **Mở File Manager** trong cPanel
2. **Vào** `domains/api.websi.vn/`
3. **Click "Upload"**
4. **Chọn file** `deploy-webhook-v2.sh` từ máy local
5. **Set permissions:** Click chuột phải → Permissions → `755`

## ✅ Cách 4: Dùng echo (cho file nhỏ)

```bash
# Tạo file từng phần (không khuyến nghị cho file lớn)
echo '#!/bin/bash' > deploy-webhook-v2.sh
echo '# Auto-deploy script...' >> deploy-webhook-v2.sh
# ... tiếp tục
```

## 🎯 Khuyến nghị

**Dùng Cách 3 (File Manager)** - Dễ nhất và nhanh nhất!


