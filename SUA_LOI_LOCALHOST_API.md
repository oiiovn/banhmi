# 🔧 Sửa lỗi: Web kết nối đến localhost:8000

## ❌ Vấn đề

Web đang hiển thị lỗi:
```
Không thể kết nối đến server. Vui lòng kiểm tra API đang chạy tại http://localhost:8000
```

## ✅ Đã sửa

Đã cải thiện logic detect API URL trong:
- `web/lib/config.ts` - Logic detect API URL
- `web/lib/api.ts` - Axios interceptor để luôn set đúng baseURL

**Thay đổi:**
- Ưu tiên check domain `websi.vn` trước
- Cải thiện logic detect production
- Đảm bảo baseURL luôn được set đúng trong mỗi request

## 🚀 Các bước deploy lại

### Bước 1: Pull code mới trên hosting

**Qua SSH:**
```bash
cd /home/dro94744/domains/websi.vn/web
git pull origin main
```

### Bước 2: Build lại Next.js

```bash
cd /home/dro94744/domains/websi.vn/web
npm install
npm run build
```

### Bước 3: Copy files vào public_html

```bash
# Kiểm tra thư mục out/ đã có chưa
ls -la out/

# Copy files
cp -r out/* /home/dro94744/domains/websi.vn/public_html/
```

### Bước 4: Test

Truy cập: `https://websi.vn/login`

**Kỳ vọng:**
- Không còn lỗi "localhost:8000"
- Web kết nối đến `https://api.websi.vn/api`
- Có thể đăng nhập thành công

## 🔍 Kiểm tra API URL

**Mở Console trong trình duyệt (F12):**

1. Vào tab **Network**
2. Thử đăng nhập
3. Xem request đến API
4. **URL phải là:** `https://api.websi.vn/api/login`

**Nếu vẫn thấy `localhost:8000`:**
- Xóa cache trình duyệt (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)
- Kiểm tra lại file đã được copy đúng chưa

## 📋 Checklist

- [ ] Đã pull code mới từ Git
- [ ] Đã build lại Next.js (`npm run build`)
- [ ] Đã copy files vào `public_html/`
- [ ] Đã test và không còn lỗi localhost
- [ ] API requests đang đến `https://api.websi.vn/api`

## 🆘 Nếu vẫn lỗi

### Kiểm tra file đã được build đúng chưa:

```bash
# Kiểm tra file config trong out/
grep -r "localhost:8000" /home/dro94744/domains/websi.vn/public_html/_next/static/
```

**Nếu vẫn thấy localhost:8000 trong file build:**
- Xóa cache build: `rm -rf .next out`
- Build lại: `npm run build`
- Copy lại: `cp -r out/* public_html/`

### Kiểm tra API có hoạt động không:

```bash
curl https://api.websi.vn/api/test
```

**Phải thấy JSON response:**
```json
{
  "status": "success",
  "message": "API đang hoạt động! Auto-deploy thành công!",
  ...
}
```

### Clear cache trình duyệt:

1. Mở DevTools (F12)
2. Right-click vào nút Refresh
3. Chọn **Empty Cache and Hard Reload**
