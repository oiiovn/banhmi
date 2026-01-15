# 🔍 Giải Quyết Lỗi "Repository not found"

## ❌ Lỗi

```
remote: Repository not found.
fatal: repository 'https://github.com/oiiovn/banhmi-api.git/' not found
```

## 🔍 Nguyên nhân

**Tên repo có thể sai!** Từ hình ảnh trước, repo tên là `oiiovn/banhmi` chứ không phải `banhmi-api`.

## ✅ Giải pháp

### Bước 1: Kiểm tra tên repo thực tế

**Vào GitHub và kiểm tra:**
- Repo có tên là `banhmi` hay `banhmi-api`?
- Repo có phải private không?

### Bước 2: Sửa remote URL

**Nếu repo tên là `banhmi`:**

```bash
# Xóa remote cũ
git remote remove origin

# Thêm remote mới với tên đúng
git remote add origin https://github.com/oiiovn/banhmi.git

# Pull
git pull origin main
```

**Nếu repo tên là `banhmi-api`:**

```bash
# Kiểm tra repo có tồn tại không
# Vào: https://github.com/oiiovn/banhmi-api
```

### Bước 3: Kiểm tra token có quyền chưa

**Nếu repo là private:**
- Token phải có quyền `repo`
- Kiểm tra lại token đã chọn đúng quyền chưa

### Bước 4: Dùng token trong URL

**Lưu token trong URL để không phải nhập lại:**

```bash
# Xóa remote cũ
git remote remove origin

# Thêm remote mới với token
git remote add origin https://oiiovn:YOUR_TOKEN_HERE@github.com/oiiovn/banhmi.git

# Pull
git pull origin main
```

## 🎯 Khả năng cao nhất

**Repo tên là `banhmi` (không phải `banhmi-api`)!**

**Sửa ngay:**

```bash
git remote remove origin
git remote add origin https://oiiovn:YOUR_TOKEN_HERE@github.com/oiiovn/banhmi.git
git pull origin main
```

## 📋 Checklist

- [ ] Đã kiểm tra tên repo thực tế trên GitHub
- [ ] Đã sửa remote URL đúng tên repo
- [ ] Đã thêm token vào URL (nếu repo private)
- [ ] Đã pull code thành công
- [ ] Đã kiểm tra có thư mục `api/` chưa

## 💡 Lưu ý

1. **Token đã được lưu trong URL** → Không cần nhập lại
2. **Nếu repo có cả `api/` và `web/`** → Pull về rồi copy vào đúng nơi
3. **Nếu là 2 repo riêng** → Cần clone riêng từng repo


