# 🔧 Tạo Repo Bằng GitHub CLI (Nếu có)

## ⚠️ Repo chưa được tạo

Tôi không thể tự động tạo repo trên GitHub mà không có quyền API. Có 2 cách:

## 🔧 Cách 1: Tạo thủ công trên GitHub (Khuyến nghị)

1. **Vào:** https://github.com/new
2. **Repository name:** `banhmi-api`
3. **KHÔNG** check "Add a README file"
4. **Click** "Create repository"
5. **Làm tương tự cho** `banhmi-web`

## 🔧 Cách 2: Dùng GitHub CLI (Nếu đã cài)

### Cài GitHub CLI (nếu chưa có):

```bash
# macOS
brew install gh

# Sau đó login
gh auth login
```

### Tạo repo bằng CLI:

```bash
# Tạo banhmi-api
gh repo create oiiovn/banhmi-api --private --source=~/banhmi-api --remote=origin --push

# Tạo banhmi-web
gh repo create oiiovn/banhmi-web --private --source=~/banhmi-web --remote=origin --push
```

## 📤 Sau khi tạo repo

**Chạy script push:**
```bash
cd ~/banhmi
./push-to-github.sh
```

**Hoặc push thủ công:**
```bash
cd ~/banhmi-api
git push -u origin main

cd ~/banhmi-web
git push -u origin main
```


