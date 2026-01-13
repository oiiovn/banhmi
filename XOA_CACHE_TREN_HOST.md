# 🗑️ Xóa Cache Trên Host - Có Cần Không?

## ❓ Câu trả lời ngắn gọn

**Với Next.js static export: KHÔNG CẦN xóa cache trên host.**

Chỉ cần:
1. ✅ Upload lại files mới
2. ✅ Xóa cache browser (client-side)

## 📋 Giải thích chi tiết

### Vì sao không cần xóa cache trên host?

**Next.js static export tạo ra:**
- Static files (HTML, CSS, JS)
- Không có server-side rendering
- Không có PHP cache
- Files được serve trực tiếp từ disk

**Khi upload files mới:**
- Files cũ sẽ bị ghi đè
- Server sẽ serve files mới ngay lập tức
- Không cần clear cache

### Cache nào có thể ảnh hưởng?

#### 1. Browser Cache (Client-side) ⚠️ QUAN TRỌNG

**Cần xóa:**
- Browser đang cache files cũ (HTML, CSS, JS)
- Hard refresh: `Ctrl + Shift + R` (Windows) hoặc `Cmd + Shift + R` (Mac)
- Hoặc xóa cache browser hoàn toàn
- Hoặc dùng Incognito/Private mode

#### 2. LiteSpeed Cache (Nếu có)

**Kiểm tra:**
- Nếu hosting có LiteSpeed Cache plugin
- Có thể cần clear cache trong cPanel
- Nhưng thường không cần với static files

#### 3. CDN Cache (Nếu có)

**Nếu dùng CDN:**
- Có thể cần purge cache trên CDN
- Nhưng thường không có với shared hosting

## ✅ Checklist

### Trên Host:
- [ ] Đã upload lại files mới từ `web/out/`
- [ ] Files mới đã thay thế files cũ
- [ ] Không cần xóa cache trên host (với static files)

### Trên Browser (Client):
- [ ] Đã hard refresh: `Ctrl + Shift + R`
- [ ] Hoặc đã xóa cache browser
- [ ] Hoặc đã test bằng Incognito mode

## 🔍 Cách kiểm tra files mới đã được serve chưa

### Cách 1: Xem "Last modified"

**Qua File Manager:**
1. Vào `public_html/_next/static/chunks/`
2. Xem "Last modified" của các file `.js`
3. Phải là thời gian mới nhất (sau khi build lại)

### Cách 2: Xem Network tab

**Trong Console (F12):**
1. Tab "Network"
2. Reload page
3. Xem các file `.js` được load
4. Check "Size" và "Time" - phải là files mới

### Cách 3: Thêm version query

**Nếu vẫn bị cache, có thể thêm version:**
- File: `index.html`
- Thêm: `?v=2` vào các link CSS/JS (nhưng không cần với Next.js)

## 🆘 Nếu vẫn không hoạt động

### Kiểm tra 1: Files đã upload đúng chưa?

- Xem "Last modified" của files
- Phải là thời gian mới nhất

### Kiểm tra 2: Browser cache

- Test bằng Incognito mode
- Hoặc xóa cache hoàn toàn
- Hoặc dùng browser khác

### Kiểm tra 3: LiteSpeed Cache (Nếu có)

**Trong cPanel:**
1. Tìm "LiteSpeed Cache" hoặc "Cache"
2. Click "Purge All" hoặc "Clear Cache"
3. Test lại

## 📝 Tóm tắt

**Với Next.js static export:**
- ✅ KHÔNG cần xóa cache trên host
- ✅ CHỈ cần upload files mới
- ✅ CHỈ cần xóa cache browser (client-side)

**Các bước:**
1. Upload lại files mới từ `web/out/`
2. Xóa cache browser (hard refresh)
3. Test lại

## 💡 Lưu ý

Nếu hosting có LiteSpeed Cache hoặc caching plugin:
- Có thể cần clear cache trong cPanel
- Nhưng thường không cần với static files
- Chỉ cần upload files mới là đủ

