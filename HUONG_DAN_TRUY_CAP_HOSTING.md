# 🔧 Hướng Dẫn Truy Cập Hosting Để Thực Hiện Git

## 🎯 Các lệnh Git phải thực hiện TRÊN HOSTING

**KHÔNG thể làm trên máy local** vì cần clone vào đúng thư mục trên hosting:
- `domains/api.websi.vn/`
- `domains/websi.vn/`

## 🔐 Cách 1: Qua SSH (Khuyến nghị)

### Bước 1: Kết nối SSH

**Trên máy của bạn (Terminal/Mac/Linux):**

```bash
ssh dro94744@s2d84.your-server.com
```

**Hoặc nếu có IP:**
```bash
ssh dro94744@IP_ADDRESS
```

**Thông tin SSH thường có trong:**
- Email từ hosting provider
- cPanel → SSH Access
- Hoặc hỏi support hosting

### Bước 2: Thực hiện lệnh Git

```bash
# Vào thư mục API
cd /home/dro94744/domains/api.websi.vn

# Kiểm tra xem đã có Git chưa
ls -la | grep .git

# Nếu chưa có, init Git
git init
git remote add origin https://github.com/oiiovn/banhmi-api.git
git pull origin main

# Hoặc nếu đã có, chỉ cần pull
git pull origin main
```

## 🖥️ Cách 2: Qua Terminal trong cPanel

### Bước 1: Đăng nhập cPanel

1. **Truy cập:** `https://your-domain.com:2083` hoặc `https://cpanel.your-domain.com`
2. **Đăng nhập** với username và password

### Bước 2: Mở Terminal

1. **Tìm mục "Terminal"** hoặc **"Advanced" → "Terminal"**
2. **Click vào** để mở terminal trong browser

### Bước 3: Thực hiện lệnh Git

```bash
# Vào thư mục API
cd domains/api.websi.vn

# Kiểm tra xem đã có Git chưa
ls -la | grep .git

# Nếu chưa có, init Git
git init
git remote add origin https://github.com/oiiovn/banhmi-api.git
git pull origin main
```

## 📁 Cách 3: Qua File Manager + Terminal

### Bước 1: Mở File Manager

1. **Vào cPanel** → **File Manager**
2. **Vào thư mục** `domains/api.websi.vn/`

### Bước 2: Mở Terminal

1. **Click chuột phải** vào thư mục
2. **Chọn "Open Terminal Here"** hoặc tương tự
3. **Terminal sẽ mở** với đường dẫn đúng

### Bước 3: Thực hiện lệnh Git

```bash
# Kiểm tra xem đã có Git chưa
ls -la | grep .git

# Nếu chưa có, init Git
git init
git remote add origin https://github.com/oiiovn/banhmi-api.git
git pull origin main
```

## 🔍 Kiểm tra sau khi setup

```bash
# Kiểm tra Git
git status
git remote -v

# Kiểm tra có api/ chưa
ls -la api/

# Kiểm tra có deploy scripts chưa
ls -la deploy-webhook.*
```

## 📋 Checklist

- [ ] Đã truy cập hosting qua SSH hoặc Terminal
- [ ] Đã vào đúng thư mục `domains/api.websi.vn/`
- [ ] Đã init Git hoặc pull code
- [ ] Đã kiểm tra có thư mục `api/` chưa
- [ ] Đã kiểm tra `git remote -v` đúng chưa

## 🆘 Nếu không có SSH

**Liên hệ support hosting để:**
1. Kích hoạt SSH access
2. Hoặc hỏi cách truy cập terminal

**Hoặc dùng cách khác:**
- Upload code qua File Manager
- Dùng Git trong cPanel (nếu có)

## 💡 Lưu ý

1. **Tất cả lệnh Git phải chạy trên hosting**
2. **Không thể clone từ máy local** vào thư mục trên hosting
3. **Có thể dùng SSH hoặc Terminal trong cPanel**
4. **Sau khi clone, script deploy sẽ tự động pull từ Git**


