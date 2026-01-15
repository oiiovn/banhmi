#!/bin/bash
# Auto-pull script for Cron Job
# Chạy định kỳ để check và pull code từ Git

# ============================================
# CONFIGURATION - Sửa các đường dẫn này
# ============================================

PROJECT_DIR="/home/username/domains/api.websi.vn"  # ← Sửa đường dẫn này
WEB_DIR="$PROJECT_DIR/web"
API_DIR="$PROJECT_DIR/api"
PUBLIC_HTML="/home/username/domains/websi.vn/public_html"  # ← Sửa đường dẫn này
LOG_FILE="$PROJECT_DIR/auto-pull.log"

# ============================================
# FUNCTIONS
# ============================================

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# ============================================
# CHECK FOR CHANGES
# ============================================

cd "$PROJECT_DIR" || exit

# Fetch latest changes (không pull)
git fetch origin main >> "$LOG_FILE" 2>&1

# Get commit hashes
LOCAL=$(git rev-parse HEAD 2>/dev/null)
REMOTE=$(git rev-parse origin/main 2>/dev/null)

# Check if there are changes
if [ "$LOCAL" != "$REMOTE" ]; then
    log "========================================="
    log "Changes detected! Local: $LOCAL, Remote: $REMOTE"
    log "Starting deployment..."
    log "========================================="
    
    # Pull code
    git pull origin main >> "$LOG_FILE" 2>&1
    
    # Deploy Web (Next.js)
    if [ -d "$WEB_DIR" ]; then
        log "Deploying Web..."
        cd "$WEB_DIR" || exit
        npm install --production >> "$LOG_FILE" 2>&1
        npm run build >> "$LOG_FILE" 2>&1
        
        if [ -d "out" ]; then
            cp -r out/* "$PUBLIC_HTML/" >> "$LOG_FILE" 2>&1
            log "Web files copied to public_html"
        fi
    fi
    
    # Deploy API (Laravel)
    if [ -d "$API_DIR" ]; then
        log "Deploying API..."
        cd "$API_DIR" || exit
        composer install --no-dev --optimize-autoloader >> "$LOG_FILE" 2>&1
        php artisan config:cache >> "$LOG_FILE" 2>&1
        php artisan route:cache >> "$LOG_FILE" 2>&1
        log "API cache cleared"
    fi
    
    log "========================================="
    log "Deployment completed!"
    log "========================================="
else
    log "No changes detected. Local and remote are in sync."
fi

exit 0


