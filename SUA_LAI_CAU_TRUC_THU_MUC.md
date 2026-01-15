# 🔧 Sửa Lại Cấu Trúc Thư Mục

## ❌ Vấn đề hiện tại

Bạn đã upload vào thư mục `web/` thay vì upload trực tiếp vào `public_html/`

**Cấu trúc hiện tại:**
```
public_html/
├── web/              ← Nội dung Next.js ở đây (SAI)
├── index.html        ← File cũ
├── web 2.zip         ← File zip chưa giải nén
└── _MACOSX/          ← Thư mục không cần thiết
```

**Cấu trúc đúng:**
```
public_html/
├── index.html        ← File chính
├── _next/            ← Thư mục Next.js
├── admin/            ← Routes
├── agent/            ← Routes
├── payments/         ← Routes
└── ... (các file khác)
```

## ✅ Cách sửa

### Option 1: Di chuyển nội dung từ `web/` ra `public_html/` (Khuyến nghị)

**Qua File Manager:**

1. **Vào thư mục `web/`**
2. **Chọn tất cả files và folders** trong `web/`
3. **Click "Move"** (hoặc "Cut")
4. **Di chuyển lên** `public_html/` (không vào thư mục con nào)
5. **Xóa thư mục `web/`** (sau khi đã di chuyển xong)

### Option 2: Giải nén file zip và upload lại

**Nếu file `web 2.zip` chứa nội dung đúng:**

1. **Giải nén file `web 2.zip`**
2. **Xóa tất cả files/folders cũ** trong `public_html/`:
   - Xóa `web/`
   - Xóa `index.html` (file cũ)
   - Xóa `_MACOSX/`
3. **Upload toàn bộ nội dung** từ thư mục đã giải nén vào `public_html/`

### Option 3: Upload lại từ local

1. **Xóa tất cả** trong `public_html/` (trừ `cgi-bin/`)
2. **Upload toàn bộ nội dung** từ `web/out/` (trên máy local) lên `public_html/`

## 🗑️ Xóa các file không cần thiết

**Xóa:**
- `_MACOSX/` - Thư mục không cần thiết (từ macOS)
- `web/` - Sau khi đã di chuyển nội dung ra ngoài
- `web 2.zip` - Sau khi đã giải nén (nếu cần)
- `index.html` cũ - Nếu không phải từ Next.js build

## 📋 Checklist sau khi sửa

- [ ] Nội dung đã ở trong `public_html/` (không phải trong `web/`)
- [ ] Có file `index.html` trong `public_html/`
- [ ] Có thư mục `_next/` trong `public_html/`
- [ ] Đã xóa thư mục `_MACOSX/`
- [ ] Đã xóa thư mục `web/` (nếu đã di chuyển xong)
- [ ] Đã tạo file `.htaccess`
- [ ] Permissions: Files `644`, Folders `755`

## 🔍 Kiểm tra cấu trúc đúng

**Sau khi sửa, trong `public_html/` phải có:**

```
public_html/
├── .htaccess         ← File này (tạo mới)
├── index.html        ← File chính (từ Next.js)
├── _next/            ← Thư mục Next.js
│   └── static/
├── admin/            ← Route admin
├── agent/            ← Route agent
├── payments/          ← Route payments
├── login/            ← Route login
├── register/         ← Route register
└── ... (các routes khác)
```

## ⚠️ Lưu ý

- **KHÔNG** để nội dung trong `public_html/web/`
- **PHẢI** để nội dung trực tiếp trong `public_html/`
- File `index.html` phải ở ngay trong `public_html/`, không phải trong `public_html/web/`


