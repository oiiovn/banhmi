#!/bin/bash
# Auto-deploy script for hosting
# Đặt script này trên hosting và setup webhook từ GitHub/GitLab

# ============================================
# CONFIGURATION - Sửa các đường dẫn này
# ============================================

# Đường dẫn đến thư mục project trên hosting
PROJECT_DIR="/home/username/domains/api.websi.vn"  # ← Sửa đường dẫn này

# Đường dẫn đến thư mục web (Next.js)
WEB_DIR="$PROJECT_DIR/web"

# Đường dẫn đến thư mục API (Laravel)
API_DIR="$PROJECT_DIR/api"

# Đường dẫn đến public_html (nơi chứa files static)
PUBLIC_HTML="/home/username/domains/websi.vn/public_html"  # ← Sửa đường dẫn này

# Log file
LOG_FILE="$PROJECT_DIR/deploy.log"

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
log "Starting deployment..."
log "========================================="

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    error "Project directory not found: $PROJECT_DIR"
fi

# Change to project directory
cd "$PROJECT_DIR" || error "Cannot change to project directory"

# Pull latest code from Git
log "Pulling latest code from Git..."
git pull origin main >> "$LOG_FILE" 2>&1 || error "Git pull failed"

# ============================================
# DEPLOY WEB (Next.js)
# ============================================

if [ -d "$WEB_DIR" ]; then
    log "Deploying Web (Next.js)..."
    
    cd "$WEB_DIR" || error "Cannot change to web directory"
    
    # Install dependencies
    log "Installing dependencies..."
    npm install --production >> "$LOG_FILE" 2>&1 || error "npm install failed"
    
    # Build Next.js
    log "Building Next.js..."
    npm run build >> "$LOG_FILE" 2>&1 || error "npm run build failed"
    
    # Check if out/ directory exists
    if [ ! -d "out" ]; then
        error "Build output directory 'out' not found"
    fi
    
    # Copy files to public_html
    log "Copying files to public_html..."
    cp -r out/* "$PUBLIC_HTML/" >> "$LOG_FILE" 2>&1 || error "Copy failed"
    
    log "Web deployment completed!"
else
    log "Web directory not found, skipping..."
fi

# ============================================
# DEPLOY API (Laravel)
# ============================================

if [ -d "$API_DIR" ]; then
    log "Deploying API (Laravel)..."
    
    cd "$API_DIR" || error "Cannot change to API directory"
    
    # Install dependencies
    log "Installing Composer dependencies..."
    composer install --no-dev --optimize-autoloader >> "$LOG_FILE" 2>&1 || error "Composer install failed"
    
    # Clear and cache config
    log "Clearing Laravel cache..."
    php artisan config:cache >> "$LOG_FILE" 2>&1 || error "Config cache failed"
    php artisan route:cache >> "$LOG_FILE" 2>&1 || error "Route cache failed"
    php artisan view:cache >> "$LOG_FILE" 2>&1 || error "View cache failed"
    
    log "API deployment completed!"
else
    log "API directory not found, skipping..."
fi

# ============================================
# COMPLETION
# ============================================

log "========================================="
log "Deployment completed successfully!"
log "========================================="

exit 0


