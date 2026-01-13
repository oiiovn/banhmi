# 📋 Hướng Dẫn Di Chuyển Nội Dung - Chi Tiết Từng Bước

## 🎯 Mục tiêu

Di chuyển tất cả files và folders từ `public_html/web/` ra ngoài `public_html/`

## 📍 Tình trạng hiện tại

```
public_html/
├── web/                    ← Nội dung Next.js đang ở đây (SAI)
│   ├── index.html
│   ├── _next/
│   ├── admin/
│   └── ...
├── index.html              ← File cũ (có thể xóa)
├── _MACOSX/                ← Xóa
└── web 2.zip               ← Có thể xóa
```

## ✅ Cần đạt được

```
public_html/
├── index.html              ← File chính (từ web/)
├── _next/                  ← Thư mục (từ web/)
├── admin/                  ← Thư mục (từ web/)
├── agent/                  ← Thư mục (từ web/)
└── ... (tất cả từ web/)
```

## 🔧 Các Bước Chi Tiết

### Bước 1: Vào thư mục `web/`

1. Trong File Manager, bạn đang ở `public_html/`
2. **Click vào thư mục `web/`** để vào bên trong
3. Bây giờ bạn sẽ thấy các files và folders như:
   - `index.html`
   - `_next/`
   - `admin/`
   - `agent/`
   - `payments/`
   - ... (và các thư mục/files khác)

### Bước 2: Chọn tất cả files và folders

**Cách 1: Chọn từng cái**
- Click checkbox bên cạnh mỗi file/folder
- Chọn tất cả

**Cách 2: Chọn tất cả cùng lúc**
- Nếu có nút "Select All" hoặc "Chọn tất cả", click vào đó
- Hoặc dùng phím tắt (nếu có)

**Kết quả:** Tất cả files và folders trong `web/` sẽ được chọn (highlighted)

### Bước 3: Di chuyển (Move/Cut)

**Tìm nút "Move" hoặc "Cut":**
- Trên thanh công cụ phía trên danh sách files
- Hoặc click chuột phải → chọn "Move" hoặc "Cut"
- Hoặc dùng icon có hình mũi tên (→)

**Sau khi click "Move":**
- Files/folders sẽ được đánh dấu là "đã chọn để di chuyển"
- Có thể có thông báo "X items selected" hoặc tương tự

### Bước 4: Quay lại `public_html/`

**Quan trọng:** Phải quay lại `public_html/`, KHÔNG ở trong `web/`

**Cách quay lại:**
1. Click vào breadcrumb (đường dẫn) phía trên:
   - `Home > domains > websi.vn > public_html`
   - Click vào `public_html` để quay lại
2. Hoặc click nút "Up" hoặc "Parent Directory" (↑)
3. Hoặc click vào `..` (dấu hai chấm) nếu có

**Kiểm tra:** Bạn phải thấy:
- Thư mục `web/` trong danh sách
- Thư mục `cgi-bin/` trong danh sách
- File `index.html` cũ (nếu còn)
- File `web 2.zip` (nếu còn)

### Bước 5: Paste (Dán)

**Sau khi đã ở trong `public_html/`:**
1. Click nút **"Paste"** hoặc **"Dán"**
2. Hoặc click chuột phải → chọn "Paste"
3. Hoặc dùng phím tắt (thường là Ctrl+V)

**Kết quả:**
- Tất cả files và folders từ `web/` sẽ xuất hiện trực tiếp trong `public_html/`
- Bạn sẽ thấy: `index.html`, `_next/`, `admin/`, `agent/`, ... ngay trong `public_html/`

### Bước 6: Xóa thư mục `web/` rỗng

**Sau khi đã di chuyển xong:**
1. Thư mục `web/` sẽ trống (hoặc chỉ còn vài file không quan trọng)
2. **Click vào thư mục `web/`** (để chọn)
3. Click nút **"Remove"** hoặc **"Delete"** hoặc **"Xóa"**
4. Xác nhận xóa

**Kết quả:** Thư mục `web/` sẽ biến mất

## 🎯 Kiểm tra kết quả

**Sau khi hoàn thành, trong `public_html/` phải có:**

```
✅ index.html          (file chính)
✅ _next/              (thư mục)
✅ admin/              (thư mục)
✅ agent/              (thư mục)
✅ payments/           (thư mục)
✅ login/              (thư mục)
✅ register/           (thư mục)
✅ ... (các thư mục/files khác)
❌ web/                (KHÔNG còn)
```

## ⚠️ Lưu ý quan trọng

1. **KHÔNG** để files trong `public_html/web/`
2. **PHẢI** để files trực tiếp trong `public_html/`
3. File `index.html` phải ở ngay trong `public_html/`, không phải trong `public_html/web/index.html`

## 🆘 Nếu gặp khó khăn

**Nếu không tìm thấy nút "Move":**
- Thử click chuột phải vào files đã chọn
- Hoặc tìm icon có hình mũi tên (→) hoặc kéo thả

**Nếu không thể di chuyển:**
- Có thể dùng cách khác: Download tất cả từ `web/`, rồi upload lại vào `public_html/`
- Hoặc giải nén file `web 2.zip` (nếu chứa nội dung đúng) và upload vào `public_html/`

## 📝 Tóm tắt ngắn gọn

1. Vào `web/` → Chọn tất cả → Move
2. Quay lại `public_html/` → Paste
3. Xóa thư mục `web/` rỗng

