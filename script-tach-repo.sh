#!/bin/bash
# Script để tách repo thành 2 repo riêng
# Chạy trên máy local

echo "🔀 Bắt đầu tách repo thành 2 repo riêng..."
echo ""

# Kiểm tra đang ở đúng thư mục
if [ ! -d "api" ] || [ ! -d "web" ]; then
    echo "❌ Không tìm thấy thư mục api/ hoặc web/"
    echo "   Vui lòng chạy script này trong thư mục banhmi/"
    exit 1
fi

# ============================================
# TẠO REPO API
# ============================================

echo "📦 Tạo repo API..."
mkdir -p ../banhmi-api
cd ../banhmi-api

# Xóa nếu đã có
rm -rf .git api

# Init Git
git init

# Copy api/
echo "Copying api/..."
cp -r ../banhmi/api .

# Copy .gitignore (nếu có)
if [ -f "../banhmi/.gitignore" ]; then
    cp ../banhmi/.gitignore .
    # Sửa .gitignore để chỉ ignore files của API
    echo "" >> .gitignore
    echo "# Ignore web và mobile" >> .gitignore
    echo "web/" >> .gitignore
    echo "mobile/" >> .gitignore
fi

# Commit
git add .
git commit -m "Initial commit: API only"

echo "✅ Repo API đã được tạo tại: $(pwd)"
echo ""
echo "📝 Bước tiếp theo:"
echo "   1. Tạo repo mới trên GitHub: banhmi-api"
echo "   2. git remote add origin https://github.com/oiiovn/banhmi-api.git"
echo "   3. git branch -M main"
echo "   4. git push -u origin main"
echo ""

# ============================================
# TẠO REPO WEB
# ============================================

echo "📦 Tạo repo Web..."
cd ..
mkdir -p banhmi-web
cd banhmi-web

# Xóa nếu đã có
rm -rf .git web

# Init Git
git init

# Copy web/
echo "Copying web/..."
cp -r ../banhmi/web .

# Copy .gitignore (nếu có)
if [ -f "../banhmi/.gitignore" ]; then
    cp ../banhmi/.gitignore .
    # Sửa .gitignore để chỉ ignore files của Web
    echo "" >> .gitignore
    echo "# Ignore api và mobile" >> .gitignore
    echo "api/" >> .gitignore
    echo "mobile/" >> .gitignore
fi

# Commit
git add .
git commit -m "Initial commit: Web only"

echo "✅ Repo Web đã được tạo tại: $(pwd)"
echo ""
echo "📝 Bước tiếp theo:"
echo "   1. Tạo repo mới trên GitHub: banhmi-web"
echo "   2. git remote add origin https://github.com/oiiovn/banhmi-web.git"
echo "   3. git branch -M main"
echo "   4. git push -u origin main"
echo ""

echo "✅ Hoàn thành!"
echo ""
echo "📋 Checklist:"
echo "   - [ ] Đã tạo repo banhmi-api trên GitHub"
echo "   - [ ] Đã push banhmi-api lên GitHub"
echo "   - [ ] Đã tạo repo banhmi-web trên GitHub"
echo "   - [ ] Đã push banhmi-web lên GitHub"
echo "   - [ ] Đã setup trên hosting"


