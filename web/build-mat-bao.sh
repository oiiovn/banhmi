#!/bin/bash

echo "🌐 Build Next.js cho hosting Mắt Bão..."
echo ""

cd "$(dirname "$0")"

# Màu sắc
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Hỏi domain
echo -e "${YELLOW}📝 Nhập thông tin domain:${NC}"
read -p "Domain của web (ví dụ: example.com): " WEB_DOMAIN

if [ -z "$WEB_DOMAIN" ]; then
    echo -e "${RED}❌ Domain không được để trống!${NC}"
    exit 1
fi

# Hỏi cấu trúc API
echo ""
echo -e "${YELLOW}🔧 Chọn cấu trúc API:${NC}"
echo "1. API ở subdomain api.${WEB_DOMAIN} (tự động detect - khuyến nghị)"
echo "2. API ở cùng domain ${WEB_DOMAIN}/api"
echo "3. API ở domain khác"
read -p "Chọn (1/2/3): " API_CHOICE

case $API_CHOICE in
    1)
        API_URL=""
        echo -e "${GREEN}✅ Sẽ tự động detect API URL: https://api.${WEB_DOMAIN}/api${NC}"
        ;;
    2)
        API_URL="https://${WEB_DOMAIN}/api"
        echo -e "${GREEN}✅ API URL: ${API_URL}${NC}"
        ;;
    3)
        read -p "Nhập URL API đầy đủ (ví dụ: https://api-different.com/api): " API_URL
        if [ -z "$API_URL" ]; then
            echo -e "${RED}❌ API URL không được để trống!${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ API URL: ${API_URL}${NC}"
        ;;
    *)
        echo -e "${RED}❌ Lựa chọn không hợp lệ!${NC}"
        exit 1
        ;;
esac

# Tạo .env.production nếu cần
if [ -n "$API_URL" ]; then
    echo ""
    echo -e "${YELLOW}📝 Đang tạo file .env.production...${NC}"
    cat > .env.production << EOF
NEXT_PUBLIC_API_URL=${API_URL}
NEXT_PUBLIC_IMAGE_DOMAINS=${WEB_DOMAIN},api.${WEB_DOMAIN}
EOF
    echo -e "${GREEN}✅ Đã tạo .env.production${NC}"
else
    # Xóa .env.production nếu có để dùng auto-detect
    if [ -f .env.production ]; then
        echo ""
        echo -e "${YELLOW}⚠️  Xóa .env.production để dùng auto-detect...${NC}"
        rm .env.production
    fi
fi

# Cài dependencies nếu chưa có
if [ ! -d "node_modules" ]; then
    echo ""
    echo -e "${YELLOW}📦 Đang cài dependencies...${NC}"
    npm install
fi

# Build
echo ""
echo -e "${YELLOW}🏗️  Đang build Next.js...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Build thành công!${NC}"
    echo ""
    echo -e "${YELLOW}📁 File đã được tạo trong thư mục: web/out/${NC}"
    echo ""
    echo -e "${YELLOW}📤 Các bước tiếp theo:${NC}"
    echo "   1. Vào File Manager trên hosting Mắt Bão"
    echo "   2. Tìm thư mục: public_html/ hoặc domains/${WEB_DOMAIN}/public_html/"
    echo "   3. Upload toàn bộ nội dung trong thư mục 'out/' lên public_html/"
    echo "   4. Tạo file .htaccess trong public_html/ với nội dung:"
    echo ""
    echo "      RewriteEngine On"
    echo "      RewriteBase /"
    echo "      RewriteRule ^index\.html$ - [L]"
    echo "      RewriteCond %{REQUEST_FILENAME} !-f"
    echo "      RewriteCond %{REQUEST_FILENAME} !-d"
    echo "      RewriteRule . /index.html [L]"
    echo ""
    echo "   5. Set permissions: chmod -R 755 public_html/"
    echo ""
    if [ -z "$API_URL" ]; then
        echo -e "${GREEN}💡 API URL sẽ tự động detect: https://api.${WEB_DOMAIN}/api${NC}"
    else
        echo -e "${GREEN}💡 API URL đã được cấu hình: ${API_URL}${NC}"
    fi
    echo ""
else
    echo -e "${RED}❌ Build thất bại! Kiểm tra lỗi ở trên.${NC}"
    exit 1
fi
