#!/bin/bash
# Script để build và deploy web lần đầu
# Chạy trên máy local, sau đó upload files lên hosting

echo "🚀 Bắt đầu build Next.js cho hosting..."
echo ""

# Kiểm tra đang ở đúng thư mục
if [ ! -f "package.json" ]; then
    echo "❌ Không tìm thấy package.json"
    echo "   Vui lòng chạy script này trong thư mục web/"
    exit 1
fi

# Tạo .env.production
if [ ! -f .env.production ]; then
    echo "📝 Tạo file .env.production..."
    cat > .env.production << EOF
NEXT_PUBLIC_API_URL=https://api.websi.vn/api
NEXT_PUBLIC_IMAGE_DOMAINS=api.websi.vn,websi.vn
EOF
    echo "✅ Đã tạo .env.production"
else
    echo "ℹ️  File .env.production đã tồn tại"
fi

# Cài dependencies nếu chưa có
if [ ! -d "node_modules" ]; then
    echo "📦 Đang cài dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Cài dependencies thất bại!"
        exit 1
    fi
else
    echo "ℹ️  Dependencies đã được cài đặt"
fi

# Build
echo "🏗️  Đang build Next.js..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build thành công!"
    echo ""
    
    # Kiểm tra thư mục out/
    if [ ! -d "out" ]; then
        echo "❌ Không tìm thấy thư mục out/"
        echo "   Kiểm tra next.config.js có 'output: export' chưa"
        exit 1
    fi
    
    # Đếm số files
    FILE_COUNT=$(find out -type f | wc -l)
    DIR_COUNT=$(find out -type d | wc -l)
    
    echo "📁 Thông tin build:"
    echo "   - Thư mục: $(pwd)/out/"
    echo "   - Số files: $FILE_COUNT"
    echo "   - Số thư mục: $DIR_COUNT"
    echo ""
    
    # Tính kích thước
    SIZE=$(du -sh out | cut -f1)
    echo "   - Kích thước: $SIZE"
    echo ""
    
    echo "📤 Các bước tiếp theo:"
    echo ""
    echo "1️⃣  Upload toàn bộ nội dung trong thư mục 'out/' lên:"
    echo "   domains/websi.vn/public_html/"
    echo ""
    echo "2️⃣  Tạo file .htaccess trong public_html/ với nội dung:"
    echo ""
    echo "   RewriteEngine On"
    echo "   RewriteBase /"
    echo "   RewriteRule ^index\.html$ - [L]"
    echo "   RewriteCond %{REQUEST_FILENAME} !-f"
    echo "   RewriteCond %{REQUEST_FILENAME} !-d"
    echo "   RewriteRule . /index.html [L]"
    echo ""
    echo "3️⃣  Set permissions: chmod -R 755 public_html/"
    echo ""
    echo "4️⃣  Truy cập: https://websi.vn"
    echo ""
    
    # Tạo file .htaccess mẫu
    if [ ! -f "out/.htaccess" ]; then
        echo "📝 Tạo file .htaccess mẫu..."
        cat > out/.htaccess << 'HTACCESS'
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
HTACCESS
        echo "✅ Đã tạo .htaccess mẫu trong out/"
    fi
    
    echo ""
    echo "💡 Tip: Có thể nén thư mục out/ để upload nhanh hơn:"
    echo "   cd out && zip -r ../web-build.zip . && cd .."
    echo ""
    
else
    echo "❌ Build thất bại! Kiểm tra lỗi ở trên."
    exit 1
fi


