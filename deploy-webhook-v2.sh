#!/bin/bash
# Auto-deploy script for hosting - API và Web ở 2 nơi khác nhau
# Đặt script này trên hosting và setup webhook từ GitHub/GitLab

# ============================================
# CONFIGURATION - Sửa các đường dẫn này
# ============================================

# Đường dẫn đến thư mục API (Laravel)
API_DIR="/home/dro94744/domains/api.websi.vn/api"  # ← Sửa đường dẫn này

# Đường dẫn đến thư mục Web source (Next.js)
WEB_SOURCE_DIR="/home/dro94744/domains/websi.vn/web"  # ← Sửa đường dẫn này

# Đường dẫn đến public_html (nơi chứa files static)
PUBLIC_HTML="/home/dro94744/domains/websi.vn/public_html"  # ← Sửa đường dẫn này

# Đường dẫn đến thư mục chứa Git repo (nếu cùng 1 repo)
# Hoặc để trống nếu là 2 repo riêng
GIT_REPO_DIR=""  # ← Để trống nếu là 2 repo riêng

# Log file
LOG_FILE="/home/dro94744/domains/api.websi.vn/deploy.log"  # ← Sửa đường dẫn này

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

# ============================================
# PULL CODE FROM GIT
# ============================================

# Nếu là 1 repo chung
if [ -n "$GIT_REPO_DIR" ] && [ -d "$GIT_REPO_DIR/.git" ]; then
    log "Pulling code from Git (shared repo)..."
    cd "$GIT_REPO_DIR" || error "Cannot change to Git repo directory"
    git pull origin main >> "$LOG_FILE" 2>&1 || error "Git pull failed"
    
    # Copy api/ và web/ vào đúng nơi (nếu cần)
    if [ -d "$GIT_REPO_DIR/api" ] && [ ! -d "$API_DIR" ]; then
        log "Copying api/ to API directory..."
        cp -r "$GIT_REPO_DIR/api" "$(dirname $API_DIR)/" >> "$LOG_FILE" 2>&1
    fi
    
    if [ -d "$GIT_REPO_DIR/web" ] && [ ! -d "$WEB_SOURCE_DIR" ]; then
        log "Copying web/ to Web directory..."
        cp -r "$GIT_REPO_DIR/web" "$(dirname $WEB_SOURCE_DIR)/" >> "$LOG_FILE" 2>&1
    fi
else
    # Nếu là 2 repo riêng, pull từng nơi
    if [ -d "$API_DIR/../.git" ]; then
        log "Pulling API code from Git..."
        cd "$(dirname $API_DIR)" || error "Cannot change to API directory"
        git pull origin main >> "$LOG_FILE" 2>&1 || log "API Git pull failed (may not be a Git repo)"
    fi
    
    # Chỉ pull Web nếu websi.vn có Git repo riêng (không pull từ api.websi.vn)
    if [ -d "$WEB_SOURCE_DIR/../.git" ] && [ "$(dirname $WEB_SOURCE_DIR)" != "$(dirname $API_DIR)" ]; then
        log "Pulling Web code from Git..."
        cd "$(dirname $WEB_SOURCE_DIR)" || error "Cannot change to Web directory"
        git pull origin main >> "$LOG_FILE" 2>&1 || log "Web Git pull failed (may not be a Git repo)"
    else
        log "Skipping Web Git pull (Web should be in separate directory: websi.vn)"
    fi
fi

# ============================================
# DEPLOY API (Laravel)
# ============================================

if [ -d "$API_DIR" ]; then
    log "Deploying API (Laravel)..."
    
    cd "$API_DIR" || error "Cannot change to API directory"
    
    # Install dependencies
    log "Installing Composer dependencies..."
    # Tìm Composer
    COMPOSER_CMD=$(which composer 2>/dev/null || echo "")
    if [ -z "$COMPOSER_CMD" ]; then
        # Thử các đường dẫn phổ biến
        if [ -f "/usr/local/bin/composer" ]; then
            COMPOSER_CMD="/usr/local/bin/composer"
        elif [ -f "/usr/bin/composer" ]; then
            COMPOSER_CMD="/usr/bin/composer"
        elif [ -f "$HOME/composer" ]; then
            COMPOSER_CMD="$HOME/composer"
        elif [ -f "$HOME/composer.phar" ]; then
            COMPOSER_CMD="php $HOME/composer.phar"
        else
            error "Composer not found. Please install Composer or update COMPOSER_CMD in script."
        fi
    fi
    log "Using Composer: $COMPOSER_CMD"
    $COMPOSER_CMD install --no-dev --optimize-autoloader >> "$LOG_FILE" 2>&1 || error "Composer install failed"
    
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
# DEPLOY WEB (Next.js)
# ============================================

if [ -d "$WEB_SOURCE_DIR" ]; then
    log "Deploying Web (Next.js)..."
    
    cd "$WEB_SOURCE_DIR" || error "Cannot change to web directory"
    
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
# COMPLETION
# ============================================

log "========================================="
log "Deployment completed successfully!"
log "========================================="

exit 0

