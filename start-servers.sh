#!/bin/bash

# Script để chạy cả API và Web server cùng lúc
# Sử dụng: ./start-servers.sh

echo "🍞 Đang khởi động dự án Banhmi..."
echo ""

# Màu sắc
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Lấy đường dẫn gốc
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Function để cleanup khi thoát
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Đang dừng các server...${NC}"
    kill $API_PID $WEB_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Chạy API server
echo -e "${YELLOW}🚀 Đang khởi động API Backend...${NC}"
cd "$PROJECT_DIR/api"
php artisan serve > /tmp/banhmi-api.log 2>&1 &
API_PID=$!

# Đợi một chút để API khởi động
sleep 2

# Chạy Web server
echo -e "${YELLOW}🌐 Đang khởi động Web Frontend...${NC}"
cd "$PROJECT_DIR/web"
npm run dev > /tmp/banhmi-web.log 2>&1 &
WEB_PID=$!

# Đợi một chút để Web khởi động
sleep 3

echo ""
echo -e "${GREEN}✅ Các server đã khởi động!${NC}"
echo ""
echo "📊 Logs:"
echo "  - API: tail -f /tmp/banhmi-api.log"
echo "  - Web: tail -f /tmp/banhmi-web.log"
echo ""
echo "🌐 Truy cập:"
echo "  - API: http://localhost:8000"
echo "  - Web: http://localhost:3000"
echo ""
echo "🔑 Tài khoản mặc định:"
echo "  - Admin: admin@banhmi.com / admin123"
echo "  - Đại lý 1: agent1@banhmi.com / agent123"
echo "  - Đại lý 2: agent2@banhmi.com / agent123"
echo ""
echo -e "${YELLOW}Nhấn Ctrl+C để dừng tất cả server${NC}"
echo ""

# Đợi cho đến khi nhận tín hiệu dừng
wait
