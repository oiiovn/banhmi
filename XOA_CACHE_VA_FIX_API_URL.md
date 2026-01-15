# 🔧 Xóa cache và sửa lỗi API URL

## ❌ Vấn đề

Website vẫn đang kết nối đến `http://localhost:8000/api` thay vì API URL thực tế trên hosting.

## 🔍 Nguyên nhân có thể

1. **Browser cache** - Browser đang cache code JavaScript cũ
2. **Service Worker cache** - PWA đang cache code cũ
3. **Code mới chưa được upload** - Thư mục `out/` mới chưa được upload lên hosting
4. **Logic detect chưa đúng** - Cần cấu hình thủ công API URL

## ✅ Giải pháp

### Bước 1: Xóa cache trên Browser

1. **Mở DevTools** (F12)
2. **Vào tab Application** (hoặc Storage)
3. **Clear Storage**:
   - Click "Clear site data"
   - Hoặc xóa từng phần:
     - **Local Storage** → Clear all
     - **Session Storage** → Clear all
     - **Service Workers** → Unregister
     - **Cache Storage** → Delete all
4. **Hard refresh**:
   - Windows/Linux: `Ctrl + Shift + R` hoặc `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

### Bước 2: Xóa cache trên Hosting (nếu có)

Nếu hosting có cache (LiteSpeed Cache, Cloudflare, v.v.):

1. **Xóa cache trong cPanel**:
   - Vào cPanel → LiteSpeed Cache → Purge All
   - Hoặc vào Cache Settings → Clear Cache

2. **Xóa file cache thủ công** (nếu có):
   ```bash
   # SSH vào hosting
   cd /home/username/domains/websi.vn/public_html
   rm -rf _next/static/cache/*
   ```

### Bước 3: Upload lại code mới

1. **Build lại** (nếu chưa build với code mới):
   ```bash
   cd banhmi/web
   npm run build
   ```

2. **Upload lại** toàn bộ nội dung trong `banhmi/web/out/` lên `public_html/`

3. **Xóa Service Worker cũ** (nếu có):
   - Xóa file `sw.js` trong `public_html/`
   - Hoặc upload file `sw.js` mới từ build

### Bước 4: Cấu hình API URL thủ công (nếu cần)

Nếu vẫn không hoạt động, cần cấu hình thủ công:

1. **Xác định API URL thực tế**:
   - Thử truy cập: `https://api.websi.vn/api/categories`
   - Hoặc: `https://websi.vn/api/categories`
   - Xem URL nào trả về dữ liệu JSON

2. **Tạo file `.env.production`**:
   ```bash
   cd banhmi/web
   echo "NEXT_PUBLIC_API_URL=https://api.websi.vn/api" > .env.production
   # Hoặc nếu API ở cùng domain:
   # echo "NEXT_PUBLIC_API_URL=https://websi.vn/api" > .env.production
   ```

3. **Build lại**:
   ```bash
   npm run build
   ```

4. **Upload lại** thư mục `out/` lên hosting

## 🧪 Kiểm tra sau khi sửa

1. **Mở website**: `https://websi.vn`
2. **Mở Console** (F12 → Console)
3. **Xem log**: Sẽ có dòng `🌐 API URL đang dùng: https://api.websi.vn/api`
4. **Thử đăng nhập**: Không còn lỗi `localhost:8000`

## 📝 Checklist

- [ ] Đã xóa cache browser (Local Storage, Service Workers, Cache)
- [ ] Đã hard refresh (Ctrl+Shift+R)
- [ ] Đã xóa cache trên hosting (nếu có)
- [ ] Đã upload lại code mới từ `out/`
- [ ] Đã xác định API URL thực tế
- [ ] Đã cấu hình `.env.production` nếu cần
- [ ] Đã build lại và upload lại
- [ ] Đã kiểm tra Console và thấy API URL đúng

## 🐛 Nếu vẫn lỗi

1. **Kiểm tra Console**:
   - Xem API URL đang được dùng là gì
   - Xem có lỗi gì khác không

2. **Kiểm tra Network tab**:
   - Xem request đang gửi đến URL nào
   - Xem response là gì

3. **Kiểm tra API trực tiếp**:
   - Truy cập API URL trong browser
   - Xem có trả về dữ liệu không

4. **Gửi thông tin**:
   - API URL đang được dùng (từ Console)
   - API URL thực tế (từ test trực tiếp)
   - Lỗi cụ thể (từ Console/Network)
