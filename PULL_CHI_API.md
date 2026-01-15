# 📦 Pull Chỉ Thư Mục API từ Git

## 🎯 Mục tiêu

**Chỉ lấy thư mục `api/` từ Git repo vào `domains/api.websi.vn/api/`**

## ⚠️ Lưu ý

**Git không thể pull chỉ 1 thư mục**, phải pull toàn bộ repo rồi chỉ giữ lại `api/`.

## ✅ Giải pháp

### Cách 1: Pull toàn bộ rồi chỉ giữ api/ (Khuyến nghị)

```bash
# Đang ở: /home/dro94744/domains/api.websi.vn

# 1. Xóa các files conflict
rm -f deploy-webhook.php deploy-webhook.sh

# 2. Pull toàn bộ repo
git pull origin main

# 3. Di chuyển api/ vào đúng vị trí (nếu chưa có)
if [ ! -d "api" ]; then
    # Nếu api/ chưa có, có thể đã có sẵn từ pull
    echo "api/ đã có từ Git"
else
    echo "api/ đã tồn tại"
fi

# 4. Xóa các thư mục không cần (nếu muốn)
# rm -rf web mobile  # Chỉ xóa nếu chắc chắn không cần
```

### Cách 2: Clone vào thư mục tạm rồi copy api/

```bash
# Vào thư mục cha
cd /home/dro94744/domains

# Clone vào thư mục tạm
git clone https://oiiovn:YOUR_TOKEN_HERE@github.com/oiiovn/banhmi.git banhmi-temp

# Copy chỉ api/ vào đúng nơi
cp -r banhmi-temp/api api.websi.vn/

# Xóa thư mục tạm
rm -rf banhmi-temp

# Vào thư mục chính
cd api.websi.vn

# Init Git trong api/ (nếu muốn track riêng)
cd api
git init
git remote add origin https://oiiovn:YOUR_TOKEN_HERE@github.com/oiiovn/banhmi.git
```

### Cách 3: Sparse Checkout (Chỉ checkout api/)

```bash
# Đang ở: /home/dro94744/domains/api.websi.vn

# Enable sparse checkout
git config core.sparseCheckout true

# Chỉ checkout thư mục api/
echo "api/*" > .git/info/sparse-checkout

# Pull
git pull origin main
```

## 🎯 Khuyến nghị

**Dùng Cách 1** (đơn giản nhất):
- Pull toàn bộ repo
- Chỉ dùng thư mục `api/`
- Giữ lại các thư mục khác (không xóa) để sau này có thể dùng

## 📋 Sau khi pull xong

```bash
# Kiểm tra có api/ chưa
ls -la api/

# Phải thấy:
# - api/app/
# - api/config/
# - api/routes/
# - ...
```

## 🔄 Cấu trúc cuối cùng

```
domains/api.websi.vn/
├── api/                   ← Laravel API (từ Git)
│   ├── app/
│   ├── config/
│   └── ...
├── web/                   ← Có thể có (không dùng)
├── mobile/                ← Có thể có (không dùng)
├── .git/                  ← Git repo
└── deploy-webhook.sh      ← Script deploy (nếu có)
```

## 💡 Lưu ý

1. **Git pull toàn bộ repo** → Có cả `api/`, `web/`, `mobile/`
2. **Chỉ dùng `api/`** → Các thư mục khác không ảnh hưởng
3. **Có thể xóa `web/` và `mobile/`** nếu muốn tiết kiệm dung lượng
4. **Script deploy sẽ chỉ xử lý `api/`** → Không ảnh hưởng


