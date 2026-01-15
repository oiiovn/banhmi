# 🔧 Sửa Lại - Chỉ Giữ Nội Dung Từ `out/`

## ❌ Vấn đề hiện tại

Bạn đã upload toàn bộ thư mục `web/` (source code) lên `public_html/`

**Hiện tại trong `public_html/`:**
```
public_html/
├── out/              ← ✅ ĐÂY MỚI LÀ THỨ CẦN THIẾT!
├── .next/            ← ❌ Xóa (source code)
├── app/              ← ❌ Xóa (source code)
├── components/       ← ❌ Xóa (source code)
├── lib/              ← ❌ Xóa (source code)
├── node_modules/     ← ❌ Xóa (rất nặng, không cần)
├── public/           ← ❌ Xóa (source code)
├── scripts/          ← ❌ Xóa (source code)
├── .env.local        ← ❌ Xóa (config file)
├── next.config.js    ← ❌ Xóa (config file)
├── package.json       ← ❌ Xóa (config file)
└── ... (các file khác) ← ❌ Xóa
```

## ✅ Cần đạt được

**Sau khi sửa, trong `public_html/` chỉ cần:**
```
public_html/
├── .htaccess         ← Tạo mới
├── index.html        ← Từ out/
├── _next/            ← Từ out/
├── admin/            ← Từ out/
├── agent/            ← Từ out/
├── payments/         ← Từ out/
└── ... (tất cả từ out/)
```

## 🔧 Các Bước Sửa

### Bước 1: Vào thư mục `out/`

1. Trong File Manager, bạn đang ở `public_html/`
2. **Click vào thư mục `out/`** để vào bên trong
3. Bạn sẽ thấy các files và folders như:
   - `index.html`
   - `_next/`
   - `admin/`
   - `agent/`
   - `payments/`
   - `login/`
   - `register/`
   - ... (và các thư mục/files khác)

### Bước 2: Chọn tất cả trong `out/`

1. **Chọn tất cả** files và folders trong `out/`
2. Click nút **"Move"** (hoặc "Cut")

### Bước 3: Quay lại `public_html/` và Paste

1. **Quay lại** `public_html/` (click vào breadcrumb `public_html`)
2. Click nút **"Paste"** để dán tất cả ra ngoài

### Bước 4: Xóa tất cả thư mục/file không cần thiết

**Xóa các thư mục:**
- `.next/`
- `app/`
- `components/`
- `lib/`
- `node_modules/` (rất nặng!)
- `public/`
- `scripts/`
- `out/` (sau khi đã di chuyển xong)

**Xóa các files:**
- `.env.local`
- `.env.production`
- `.eslintrc.json`
- `.gitignore`
- `build-for-hosting.sh`
- `next-env.d.ts`
- `next.config.js`
- `next.config.static.js`
- `package-lock.json`
- `package.json`
- ... (tất cả file config khác)

**Cách xóa:**
1. Chọn các thư mục/files cần xóa
2. Click nút **"Remove"** hoặc **"Delete"**
3. Xác nhận xóa

## ✅ Kiểm tra kết quả

**Sau khi xong, trong `public_html/` chỉ còn:**
```
✅ index.html          (file chính)
✅ _next/              (thư mục)
✅ admin/              (thư mục)
✅ agent/              (thư mục)
✅ payments/           (thư mục)
✅ login/              (thư mục)
✅ register/           (thư mục)
✅ ... (các routes khác)
✅ cgi-bin/            (giữ lại - thư mục mặc định)
❌ out/                (KHÔNG còn)
❌ .next/              (KHÔNG còn)
❌ app/                (KHÔNG còn)
❌ node_modules/       (KHÔNG còn)
```

## 📝 Tóm tắt

1. Vào `out/` → Chọn tất cả → Move
2. Quay lại `public_html/` → Paste
3. Xóa tất cả thư mục/file không cần thiết (giữ lại `cgi-bin/`)

## ⚠️ Lưu ý

- **KHÔNG** xóa thư mục `cgi-bin/` (thư mục mặc định của hosting)
- **CHỈ** giữ lại nội dung từ `out/`
- **XÓA** tất cả source code và config files


