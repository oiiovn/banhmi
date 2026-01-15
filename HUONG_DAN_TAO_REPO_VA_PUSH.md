# 📤 Hướng Dẫn Tạo Repo và Push Code

## ⚠️ Repo chưa được tạo trên GitHub

Cần tạo 2 repo trên GitHub trước khi push.

## 🔧 Bước 1: Tạo Repo trên GitHub

### 1.1. Tạo banhmi-api

1. **Vào:** https://github.com/new
2. **Repository name:** `banhmi-api`
3. **Description:** `API Backend cho dự án Banhmi (Laravel)`
4. **Visibility:** Chọn Private hoặc Public
5. **KHÔNG** check "Add a README file"
6. **KHÔNG** check "Add .gitignore"
7. **KHÔNG** check "Choose a license"
8. **Click** "Create repository"

### 1.2. Tạo banhmi-web

1. **Vào:** https://github.com/new
2. **Repository name:** `banhmi-web`
3. **Description:** `Web Frontend cho dự án Banhmi (Next.js)`
4. **Visibility:** Chọn Private hoặc Public
5. **KHÔNG** check các options
6. **Click** "Create repository"

## 📤 Bước 2: Push Code Lên GitHub

### 2.1. Push banhmi-api

```bash
cd ~/banhmi-api
git remote add origin https://oiiovn:YOUR_TOKEN_HERE@github.com/oiiovn/banhmi-api.git
git push -u origin main
```

### 2.2. Push banhmi-web

```bash
cd ~/banhmi-web
git remote add origin https://oiiovn:YOUR_TOKEN_HERE@github.com/oiiovn/banhmi-web.git
git push -u origin main
```

## ✅ Sau khi push thành công

Bạn sẽ thấy code trên GitHub:
- https://github.com/oiiovn/banhmi-api
- https://github.com/oiiovn/banhmi-web

## 🖥️ Bước 3: Pull Trên Hosting

Sau khi push xong, làm theo hướng dẫn trong file `HUONG_DAN_HOSTING_NGAN_GON.md`


