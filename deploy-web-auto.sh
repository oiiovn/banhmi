#!/bin/bash
# Script tự động deploy Web từ Git lên hosting
# Chạy script này trên hosting để tự động pull, build và deploy

# ============================================
# CONFIGURATION - Sửa các đường dẫn này
# ============================================

# Đường dẫn đến thư mục chứa Git repo (thư mục gốc của project)
# Ví dụ: /home/username/domains/websi.vn/repo
GIT_REPO_DIR="/home/username/domains/websi.vn/repo"  # ← Sửa đường dẫn này

# Đường dẫn đến thư mục web trong repo
WEB_DIR="$GIT_REPO_DIR/web"

# Đường dẫn đến public_html (nơi chứa files static)
PUBLIC_HTML="/home/username/domains/websi.vn/public_html"  # ← Sửa đường dẫn này

# API URL cho production (nếu cần cấu hình thủ công)
# Để trống nếu muốn tự động detect
API_URL=""  # Ví dụ: "https://api.websi.vn/api" hoặc "https://websi.vn/api"

# Log file
LOG_FILE="$GIT_REPO_DIR/deploy-web.log"

# ============================================
# FUNCTIONS
# ============================================

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" | tee -a "$LOG_FILE"
    exit 1
}

# ============================================
# MAIN DEPLOYMENT
# ============================================

log "========================================="
log "Starting Web deployment..."
log "========================================="

# Check if Git repo directory exists
if [ ! -d "$GIT_REPO_DIR" ]; then
    error "Git repo directory not found: $GIT_REPO_DIR"
fi

# Check if .git exists
if [ ! -d "$GIT_REPO_DIR/.git" ]; then
    error "Not a Git repository: $GIT_REPO_DIR"
fi

# Change to Git repo directory
cd "$GIT_REPO_DIR" || error "Cannot change to Git repo directory"

# Pull latest code from Git
log "Pulling latest code from Git..."
git pull origin main >> "$LOG_FILE" 2>&1 || git pull origin master >> "$LOG_FILE" 2>&1 || error "Git pull failed"

# Check if web directory exists
if [ ! -d "$WEB_DIR" ]; then
    error "Web directory not found: $WEB_DIR"
fi

# Change to web directory
cd "$WEB_DIR" || error "Cannot change to web directory"

# ============================================
# BUILD NEXT.JS
# ============================================

# Install dependencies (nếu chưa có node_modules)
if [ ! -d "node_modules" ]; then
    log "Installing dependencies..."
    npm install >> "$LOG_FILE" 2>&1 || error "npm install failed"
else
    log "Dependencies already installed, skipping..."
fi

# Tạo .env.production nếu cần
if [ -n "$API_URL" ] && [ ! -f ".env.production" ]; then
    log "Creating .env.production with API URL: $API_URL"
    echo "NEXT_PUBLIC_API_URL=$API_URL" > .env.production
fi

# Build Next.js
log "Building Next.js..."
npm run build >> "$LOG_FILE" 2>&1 || error "npm run build failed"

# Check if out/ directory exists
if [ ! -d "out" ]; then
    error "Build output directory 'out' not found"
fi

# ============================================
# DEPLOY TO PUBLIC_HTML
# ============================================

log "Deploying to public_html..."

# Backup .htaccess nếu có
if [ -f "$PUBLIC_HTML/.htaccess" ]; then
    log "Backing up .htaccess..."
    cp "$PUBLIC_HTML/.htaccess" "$PUBLIC_HTML/.htaccess.backup" 2>/dev/null || true
fi

# Xóa nội dung cũ trong public_html (trừ .htaccess)
log "Cleaning old files..."
find "$PUBLIC_HTML" -mindepth 1 ! -name '.htaccess' ! -name '.htaccess.backup' -delete 2>/dev/null || true

# Copy files from out/ to public_html
log "Copying files from out/ to public_html..."
cp -r out/* "$PUBLIC_HTML/" >> "$LOG_FILE" 2>&1 || error "Copy failed"

# Restore .htaccess nếu có backup
if [ -f "$PUBLIC_HTML/.htaccess.backup" ] && [ ! -f "$PUBLIC_HTML/.htaccess" ]; then
    log "Restoring .htaccess..."
    mv "$PUBLIC_HTML/.htaccess.backup" "$PUBLIC_HTML/.htaccess"
fi

# Set permissions
log "Setting permissions..."
chmod -R 755 "$PUBLIC_HTML" 2>/dev/null || true

# ============================================
# COMPLETION
# ============================================

log "========================================="
log "Web deployment completed successfully!"
log "========================================="

exit 0
