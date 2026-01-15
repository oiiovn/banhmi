# ✅ Bước Tiếp Theo Sau Khi Init Git

## ✅ Đã hoàn thành

- ✅ Đã init Git: `Initialized empty Git repository`

## 🔧 Bước tiếp theo

### 1. Thêm remote origin

```bash
git remote add origin https://github.com/oiiovn/banhmi-api.git
```

### 2. Kiểm tra remote

```bash
git remote -v
```

**Kết quả phải thấy:**
```
origin  https://github.com/oiiovn/banhmi-api.git (fetch)
origin  https://github.com/oiiovn/banhmi-api.git (push)
```

### 3. Pull code từ GitHub

**Nếu repo dùng branch `main`:**
```bash
git pull origin main
```

**Nếu repo dùng branch `master`:**
```bash
git pull origin master
```

**Hoặc fetch trước để xem branch nào:**
```bash
git fetch origin
git branch -r  # Xem các branch remote
```

### 4. Đổi branch nếu cần

**Nếu repo dùng `main` nhưng local đang `master`:**
```bash
git branch -m master main
git pull origin main
```

## 🔍 Kiểm tra sau khi pull

```bash
# Kiểm tra có thư mục api/ chưa
ls -la api/

# Kiểm tra Git status
git status

# Kiểm tra branch
git branch
```

## 📋 Nếu gặp lỗi

### Lỗi: "refusing to merge unrelated histories"

**Giải pháp:**
```bash
git pull origin main --allow-unrelated-histories
```

### Lỗi: "fatal: couldn't find remote ref main"

**Nguyên nhân:** Repo dùng branch `master` thay vì `main`

**Giải pháp:**
```bash
git pull origin master
```

## ✅ Sau khi pull thành công

**Phải thấy:**
- ✅ Thư mục `api/` với code Laravel
- ✅ Các files khác từ repo

**Sau đó setup Web tương tự:**
```bash
cd /home/dro94744/domains/websi.vn
git init
git remote add origin https://github.com/oiiovn/banhmi-web.git
git pull origin main
```


