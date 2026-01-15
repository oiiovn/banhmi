#!/bin/bash

echo "🍞 Bắt đầu chạy dự án Banhmi..."
echo ""

# Kiểm tra database
echo "📊 Lưu ý: Đảm bảo MySQL đã chạy và database 'banhmi' đã được tạo"
echo "   Nếu chưa có, chạy: mysql -u root -e 'CREATE DATABASE banhmi;'"
echo ""

# Chạy API Backend
echo "🚀 Đang khởi động API Backend (Laravel)..."
cd api
if [ ! -f .env ]; then
    echo "⚠️  File .env chưa tồn tại. Đang tạo..."
    cp .env.example .env 2>/dev/null || echo "Cần tạo file .env thủ công"
    php artisan key:generate
fi

# Chạy migrations và seeders
echo "📦 Đang chạy migrations..."
php artisan migrate --force 2>&1 | grep -E "(Migrating|Migrated|Error)" || echo "Migrations đã chạy hoặc có lỗi"

echo "🌱 Đang chạy seeders..."
php artisan db:seed --class=AdminSeeder --force 2>&1 | grep -E "(Seeding|Seeded|Error)" || echo "Seeders đã chạy hoặc có lỗi"

echo "✅ API Backend sẵn sàng tại http://localhost:8000"
echo ""

# Chạy Web Frontend
echo "🌐 Đang khởi động Web Frontend (Next.js)..."
cd ../web
if [ ! -f .env.local ]; then
    echo "📝 Đang tạo file .env.local..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
fi

echo "✅ Web Frontend sẵn sàng tại http://localhost:3000"
echo ""

echo "📋 Tài khoản mặc định:"
echo "   Admin: admin@banhmi.com / admin123"
echo "   Đại lý 1: agent1@banhmi.com / agent123"
echo "   Đại lý 2: agent2@banhmi.com / agent123"
echo ""
echo "💡 Chạy các lệnh sau trong terminal riêng:"
echo "   - API: cd api && php artisan serve"
echo "   - Web: cd web && npm run dev"





