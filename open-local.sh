#!/bin/bash

echo "🍞 Đang mở dự án Banhmi Local..."
echo ""

# Màu sắc cho output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Lấy đường dẫn gốc
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Kiểm tra và setup API
echo -e "${YELLOW}📦 Kiểm tra API Backend...${NC}"
cd "$PROJECT_DIR/api"

if [ ! -f .env ]; then
    echo "⚠️  File .env chưa tồn tại. Đang tạo từ .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        php artisan key:generate
    else
        echo "❌ Không tìm thấy .env.example"
        exit 1
    fi
fi

# Kiểm tra và setup Web
echo -e "${YELLOW}🌐 Kiểm tra Web Frontend...${NC}"
cd "$PROJECT_DIR/web"

if [ ! -f .env.local ]; then
    echo "⚠️  File .env.local chưa tồn tại. Đang tạo..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
    echo "✅ Đã tạo .env.local"
fi

echo ""
echo -e "${GREEN}✅ Dự án đã sẵn sàng!${NC}"
echo ""
echo "📋 Để chạy dự án, mở 2 terminal và chạy:"
echo ""
echo -e "${YELLOW}Terminal 1 - API Backend:${NC}"
echo "  cd $PROJECT_DIR/api"
echo "  php artisan serve"
echo ""
echo -e "${YELLOW}Terminal 2 - Web Frontend:${NC}"
echo "  cd $PROJECT_DIR/web"
echo "  npm run dev"
echo ""
echo "🌐 Sau khi chạy:"
echo "  - API: http://localhost:8000"
echo "  - Web: http://localhost:3000"
echo ""
echo "🔑 Tài khoản mặc định:"
echo "  - Admin: admin@banhmi.com / admin123"
echo "  - Đại lý 1: agent1@banhmi.com / agent123"
echo "  - Đại lý 2: agent2@banhmi.com / agent123"
echo ""
