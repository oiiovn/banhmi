# 🔐 Hướng Dẫn Tạo Personal Access Token (PAT) trên GitHub

## 📍 Bạn đang ở đâu

Bạn đang ở: **Repo Settings** (`oiiovn/banhmi`)

## 🎯 Cần vào đâu

**Personal Access Token nằm ở User Settings, không phải Repo Settings!**

## 🔧 Cách tạo PAT

### Bước 1: Vào User Settings

1. **Click vào avatar** ở góc trên bên phải (cạnh icon notifications)
2. **Chọn "Settings"** (User Settings, không phải Repo Settings)

### Bước 2: Vào Developer Settings

1. **Scroll xuống** menu bên trái
2. **Tìm và click** → **Developer settings** (ở cuối menu)

### Bước 3: Vào Personal Access Tokens

1. **Click** → **Personal access tokens**
2. **Click** → **Tokens (classic)**
3. **Click** → **Generate new token** → **Generate new token (classic)**

### Bước 4: Tạo token

1. **Note:** Đặt tên `banhmi-deploy` (hoặc tên bất kỳ)
2. **Expiration:** Chọn thời hạn (30 days, 90 days, hoặc No expiration)
3. **Select scopes:** Chọn quyền:
   - ✅ **`repo`** (Full control of private repositories)
     - ✅ repo:status
     - ✅ repo_deployment
     - ✅ public_repo
     - ✅ repo:invite
     - ✅ security_events
4. **Click** → **Generate token**

### Bước 5: Copy token

**⚠️ QUAN TRỌNG:** Token chỉ hiện 1 lần, copy ngay!

```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🔄 Cách dùng token

### Trên hosting (SSH):

```bash
# Pull code và nhập token
git pull origin main
# Username: oiiovn
# Password: <dán token vừa tạo>
```

### Hoặc lưu token trong URL:

```bash
# Xóa remote cũ
git remote remove origin

# Thêm remote mới với token
git remote add origin https://oiiovn:YOUR_TOKEN@github.com/oiiovn/banhmi-api.git

# Pull
git pull origin main
```

## 📋 Checklist

- [ ] Đã vào User Settings (không phải Repo Settings)
- [ ] Đã vào Developer settings
- [ ] Đã tạo Personal Access Token
- [ ] Đã copy token (lưu lại!)
- [ ] Đã chọn quyền `repo`
- [ ] Đã dùng token để pull code

## 💡 Lưu ý

1. **Token chỉ hiện 1 lần** → Copy và lưu ngay!
2. **Token có thể revoke** → Tạo lại nếu cần
3. **Không share token** → Bảo mật như password
4. **Có thể set expiration** → Tạo lại khi hết hạn

## 🆘 Nếu không thấy Developer settings

**Kiểm tra:**
- Đang ở **User Settings** (click avatar → Settings)
- Không phải **Repo Settings** (Settings tab trong repo)

**Nếu vẫn không thấy:**
- Scroll xuống menu bên trái
- Developer settings ở cuối menu


