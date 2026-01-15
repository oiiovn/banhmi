# 🔐 Giải Quyết Lỗi GitHub Authentication

## ❌ Lỗi

```
Password authentication is not supported for Git operations.
fatal: Authentication failed
```

**Nguyên nhân:** GitHub không còn hỗ trợ password authentication, cần dùng **Personal Access Token (PAT)** hoặc **SSH key**.

## ✅ Giải pháp

### Cách 1: Dùng Personal Access Token (PAT) - Dễ nhất

#### Bước 1: Tạo Personal Access Token trên GitHub

1. **Đăng nhập GitHub** → Click avatar → **Settings**
2. **Vào** → **Developer settings** (ở cuối menu bên trái)
3. **Vào** → **Personal access tokens** → **Tokens (classic)**
4. **Click** → **Generate new token** → **Generate new token (classic)**
5. **Đặt tên:** `banhmi-deploy` (hoặc tên bất kỳ)
6. **Chọn quyền:**
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (nếu cần)
7. **Click** → **Generate token**
8. **Copy token** (chỉ hiện 1 lần, lưu lại!)

#### Bước 2: Dùng token khi pull

**Cách 1: Nhập token thay password**
```bash
git pull origin main
# Username: oiiovn
# Password: <dán token vừa tạo>
```

**Cách 2: Lưu token trong URL (tiện hơn)**
```bash
# Xóa remote cũ
git remote remove origin

# Thêm remote mới với token
git remote add origin https://oiiovn:YOUR_TOKEN@github.com/oiiovn/banhmi-api.git

# Pull
git pull origin main
```

**Cách 3: Lưu token trong Git credential helper**
```bash
# Pull và nhập token 1 lần
git pull origin main
# Username: oiiovn
# Password: <dán token>

# Lưu credential (nếu chưa có)
git config --global credential.helper store
```

### Cách 2: Dùng SSH Key (Bảo mật hơn)

#### Bước 1: Tạo SSH key trên hosting

```bash
# Tạo SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Nhấn Enter để dùng mặc định
# Nhấn Enter để không đặt passphrase (hoặc đặt nếu muốn)

# Xem public key
cat ~/.ssh/id_ed25519.pub
```

#### Bước 2: Thêm SSH key vào GitHub

1. **Copy public key** (từ lệnh trên)
2. **Vào GitHub** → Settings → **SSH and GPG keys**
3. **Click** → **New SSH key**
4. **Title:** `banhmi-hosting` (hoặc tên bất kỳ)
5. **Key:** Dán public key
6. **Click** → **Add SSH key**

#### Bước 3: Đổi remote sang SSH

```bash
# Xóa remote cũ
git remote remove origin

# Thêm remote mới dùng SSH
git remote add origin git@github.com:oiiovn/banhmi-api.git

# Pull
git pull origin main
```

## 🎯 Khuyến nghị

**Dùng Cách 1 (PAT)** nếu:
- ✅ Cần setup nhanh
- ✅ Không muốn setup SSH

**Dùng Cách 2 (SSH)** nếu:
- ✅ Muốn bảo mật hơn
- ✅ Không muốn nhập token mỗi lần
- ✅ Có nhiều repo cần quản lý

## 📋 Checklist

- [ ] Đã tạo Personal Access Token (nếu dùng PAT)
- [ ] Đã thêm SSH key vào GitHub (nếu dùng SSH)
- [ ] Đã đổi remote URL (nếu cần)
- [ ] Đã pull code thành công
- [ ] Đã kiểm tra có thư mục `api/` chưa

## 🆘 Troubleshooting

### Lỗi: "Permission denied (publickey)"

**Nguyên nhân:** SSH key chưa được thêm vào GitHub hoặc sai key

**Giải pháp:**
```bash
# Kiểm tra SSH key
ssh -T git@github.com

# Nếu lỗi, thêm SSH key vào ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### Lỗi: "Invalid username or token"

**Nguyên nhân:** Token sai hoặc hết hạn

**Giải pháp:**
- Tạo token mới
- Kiểm tra token có quyền `repo` chưa

## 💡 Lưu ý

1. **Token chỉ hiện 1 lần** → Lưu lại ngay!
2. **Token có thể revoke** → Tạo lại nếu cần
3. **SSH key an toàn hơn** → Không cần nhập mỗi lần
4. **Có thể dùng cả 2 cách** → Tùy nhu cầu


