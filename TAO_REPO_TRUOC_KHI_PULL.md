# ⚠️ Repo Chưa Được Tạo Trên GitHub

## ❌ Lỗi

```
remote: Repository not found.
fatal: repository 'https://github.com/oiiovn/banhmi-api.git/' not found
```

**Nguyên nhân:** Repo `banhmi-api` chưa được tạo trên GitHub.

## ✅ Giải pháp

### Bước 1: Tạo repo trên GitHub

1. **Vào:** https://github.com/new
2. **Repository name:** `banhmi-api`
3. **Description:** `API Backend cho dự án Banhmi (Laravel)`
4. **Visibility:** Chọn Private hoặc Public
5. **KHÔNG** check "Add a README file"
6. **KHÔNG** check "Add .gitignore"
7. **KHÔNG** check "Choose a license"
8. **Click** "Create repository"

### Bước 2: Push code từ máy local

**Trên máy local của bạn:**

```bash
# Vào thư mục banhmi-api
cd ~/banhmi-api

# Thêm remote (nếu chưa có)
git remote remove origin 2>/dev/null
git remote add origin https://oiiovn:YOUR_TOKEN_HERE@github.com/oiiovn/banhmi-api.git

# Push code
git push -u origin main
```

**Hoặc chạy script:**
```bash
cd ~/banhmi
./push-to-github.sh
```

### Bước 3: Pull trên hosting (sau khi push xong)

**Quay lại SSH trên hosting:**

```bash
# Vào thư mục API
cd /home/dro94744/domains/api.websi.vn

# Pull code
git pull origin main

# Kiểm tra
ls -la api/
# Phải thấy: app/, config/, routes/, ...
```

## 📋 Checklist

- [ ] Đã tạo repo `banhmi-api` trên GitHub
- [ ] Đã push code từ máy local lên GitHub
- [ ] Đã pull code trên hosting
- [ ] Đã kiểm tra có thư mục `api/` chưa

## 💡 Lưu ý

1. **Phải tạo repo trên GitHub trước** → Không thể pull nếu repo chưa tồn tại
2. **Phải push từ máy local trước** → Để có code trên GitHub
3. **Sau đó mới pull trên hosting** → Để lấy code về hosting


