#!/bin/bash
# Script để push code lên GitHub sau khi đã tạo repo

echo "📤 Bắt đầu push code lên GitHub..."
echo ""

# Kiểm tra token
TOKEN="YOUR_TOKEN_HERE"
USERNAME="oiiovn"

# ============================================
# PUSH BANHMI-API
# ============================================

echo "📦 Pushing banhmi-api..."
cd ~/banhmi-api || exit 1

# Xóa remote cũ (nếu có)
git remote remove origin 2>/dev/null

# Thêm remote mới
git remote add origin https://${USERNAME}:${TOKEN}@github.com/${USERNAME}/banhmi-api.git

# Push
echo "Pushing to banhmi-api..."
if git push -u origin main 2>&1; then
    echo "✅ banhmi-api pushed successfully!"
else
    echo "❌ Failed to push banhmi-api"
    echo "   → Kiểm tra repo đã được tạo trên GitHub chưa: https://github.com/${USERNAME}/banhmi-api"
    exit 1
fi

echo ""

# ============================================
# PUSH BANHMI-WEB
# ============================================

echo "📦 Pushing banhmi-web..."
cd ~/banhmi-web || exit 1

# Xóa remote cũ (nếu có)
git remote remove origin 2>/dev/null

# Thêm remote mới
git remote add origin https://${USERNAME}:${TOKEN}@github.com/${USERNAME}/banhmi-web.git

# Push
echo "Pushing to banhmi-web..."
if git push -u origin main 2>&1; then
    echo "✅ banhmi-web pushed successfully!"
else
    echo "❌ Failed to push banhmi-web"
    echo "   → Kiểm tra repo đã được tạo trên GitHub chưa: https://github.com/${USERNAME}/banhmi-web"
    exit 1
fi

echo ""
echo "✅ Hoàn thành!"
echo ""
echo "🔗 Kiểm tra trên GitHub:"
echo "   - https://github.com/${USERNAME}/banhmi-api"
echo "   - https://github.com/${USERNAME}/banhmi-web"
echo ""
echo "🖥️  Bước tiếp theo: Pull trên hosting"
echo "   Xem: HUONG_DAN_HOSTING_NGAN_GON.md"


