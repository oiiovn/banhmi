#!/bin/bash

echo "🚀 Bắt đầu deploy dự án Banhmi lên host..."
echo ""

# Màu sắc cho output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Kiểm tra các lệnh cần thiết
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 chưa được cài đặt${NC}"
        exit 1
    fi
}

echo "📋 Kiểm tra các lệnh cần thiết..."
check_command php
check_command composer
check_command node
check_command npm

echo -e "${GREEN}✅ Tất cả lệnh đã sẵn sàng${NC}"
echo ""

# Hỏi thông tin
read -p "Nhập domain API (ví dụ: api.banhmi.com): " API_DOMAIN
read -p "Nhập domain Web (ví dụ: banhmi.com): " WEB_DOMAIN
read -p "Nhập tên database: " DB_NAME
read -p "Nhập username database: " DB_USER
read -s -p "Nhập password database: " DB_PASS
echo ""

# Setup API
echo ""
echo "🔧 Đang setup API Backend..."
cd api

if [ ! -f .env ]; then
    echo "📝 Tạo file .env..."
    if [ -f .env.example ]; then
        cp .env.example .env
    else
        echo "⚠️  Không tìm thấy .env.example, tạo file .env mới..."
        cat > .env << EOF
APP_NAME=Banhmi
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://${API_DOMAIN}

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=${DB_NAME}
DB_USERNAME=${DB_USER}
DB_PASSWORD=${DB_PASS}

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

CORS_ALLOWED_ORIGINS=https://${WEB_DOMAIN},https://www.${WEB_DOMAIN}
EOF
    fi
fi

# Cập nhật CORS trong .env
if grep -q "CORS_ALLOWED_ORIGINS" .env; then
    sed -i.bak "s|CORS_ALLOWED_ORIGINS=.*|CORS_ALLOWED_ORIGINS=https://${WEB_DOMAIN},https://www.${WEB_DOMAIN}|" .env
else
    echo "CORS_ALLOWED_ORIGINS=https://${WEB_DOMAIN},https://www.${WEB_DOMAIN}" >> .env
fi

# Cập nhật APP_URL
sed -i.bak "s|APP_URL=.*|APP_URL=https://${API_DOMAIN}|" .env

# Cập nhật database
sed -i.bak "s|DB_DATABASE=.*|DB_DATABASE=${DB_NAME}|" .env
sed -i.bak "s|DB_USERNAME=.*|DB_USERNAME=${DB_USER}|" .env
sed -i.bak "s|DB_PASSWORD=.*|DB_PASSWORD=${DB_PASS}|" .env

# Set production
sed -i.bak "s|APP_ENV=.*|APP_ENV=production|" .env
sed -i.bak "s|APP_DEBUG=.*|APP_DEBUG=false|" .env

echo "📦 Đang cài đặt dependencies..."
composer install --optimize-autoloader --no-dev

echo "🔑 Đang generate app key..."
php artisan key:generate --force

echo "🗄️  Đang chạy migrations..."
php artisan migrate --force

echo "🔗 Đang tạo storage link..."
php artisan storage:link

echo "⚡ Đang cache config..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo -e "${GREEN}✅ API Backend đã được setup${NC}"
echo ""

# Setup Web
echo "🌐 Đang setup Web Frontend..."
cd ../web

if [ ! -f .env.production ]; then
    echo "📝 Tạo file .env.production..."
    echo "NEXT_PUBLIC_API_URL=https://${API_DOMAIN}/api" > .env.production
    echo "NEXT_PUBLIC_IMAGE_DOMAINS=${API_DOMAIN},${WEB_DOMAIN}" >> .env.production
else
    # Cập nhật API URL
    sed -i.bak "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=https://${API_DOMAIN}/api|" .env.production
fi

echo "📦 Đang cài đặt dependencies..."
npm install

echo "🏗️  Đang build production..."
npm run build

echo -e "${GREEN}✅ Web Frontend đã được setup${NC}"
echo ""

# Set permissions
echo "🔐 Đang set permissions..."
cd ../api
chmod -R 775 storage bootstrap/cache

echo ""
echo -e "${GREEN}🎉 Deploy hoàn tất!${NC}"
echo ""
echo "📋 Thông tin đã cấu hình:"
echo "   - API URL: https://${API_DOMAIN}"
echo "   - Web URL: https://${WEB_DOMAIN}"
echo "   - Database: ${DB_NAME}"
echo ""
echo "⚠️  Lưu ý:"
echo "   1. Đảm bảo đã cấu hình Nginx/Apache cho cả API và Web"
echo "   2. Đảm bảo đã cài đặt SSL certificate"
echo "   3. Kiểm tra permissions cho storage và bootstrap/cache"
echo "   4. Test API: curl https://${API_DOMAIN}/api/categories"
echo "   5. Test Web: truy cập https://${WEB_DOMAIN}"
echo ""


