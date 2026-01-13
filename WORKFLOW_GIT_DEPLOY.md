# 🔄 Workflow Git - Tự Động Deploy Từ Git

## 🎯 Mục tiêu

1. Chỉnh sửa code trên máy local
2. Push lên Git (GitHub/GitLab/Bitbucket)
3. Hosting tự động pull code và deploy

## 📋 Các Bước Setup

### Bước 1: Setup Git Repository

#### 1.1. Tạo repository trên GitHub/GitLab

1. Tạo repository mới trên GitHub/GitLab
2. Copy URL repository (ví dụ: `https://github.com/username/banhmi.git`)

#### 1.2. Init Git trong project local

```bash
cd /Users/buiquocvu/banhmi
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/banhmi.git
git push -u origin main
```

### Bước 2: Setup Auto-Deploy trên Hosting

#### Option 1: Dùng Webhook (Khuyến nghị)

**Cách hoạt động:**
- GitHub/GitLab gửi webhook khi có push
- Hosting nhận webhook và tự động pull code

**Cần:**
- SSH access trên hosting
- Webhook URL trên hosting

#### Option 2: Dùng Cron Job

**Cách hoạt động:**
- Cron job chạy định kỳ (ví dụ: mỗi 5 phút)
- Kiểm tra có thay đổi trên Git không
- Nếu có → pull code và deploy

**Cần:**
- Cron job access trong cPanel

#### Option 3: Dùng GitHub Actions / GitLab CI

**Cách hoạt động:**
- Khi push code → GitHub Actions tự động chạy
- Build code và deploy lên hosting qua FTP/SSH

**Cần:**
- GitHub Actions hoặc GitLab CI/CD

## 🔧 Setup Chi Tiết

### Option 1: Webhook + Script trên Hosting

#### Bước 1: Tạo script deploy trên hosting

**Tạo file:** `deploy-webhook.php` hoặc `deploy-webhook.sh`

**Nội dung PHP (`deploy-webhook.php`):**
```php
<?php
// deploy-webhook.php
// Đặt trong thư mục API hoặc Web trên hosting

$secret = 'your-secret-key-here'; // Thay bằng secret key của bạn
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

// Verify signature (GitHub)
if ($signature) {
    $hash = 'sha256=' . hash_hmac('sha256', $payload, $secret);
    if (!hash_equals($signature, $hash)) {
        http_response_code(401);
        die('Invalid signature');
    }
}

// Parse payload
$data = json_decode($payload, true);

// Check if it's a push event
if ($data['ref'] === 'refs/heads/main' || $data['ref'] === 'refs/heads/master') {
    // Execute git pull
    $output = [];
    $return_var = 0;
    
    // Change to project directory
    $project_dir = __DIR__; // Hoặc đường dẫn đầy đủ đến thư mục project
    
    // Pull code
    exec("cd $project_dir && git pull origin main 2>&1", $output, $return_var);
    
    // Build Next.js (nếu là web)
    if (file_exists($project_dir . '/web/package.json')) {
        exec("cd $project_dir/web && npm install --production 2>&1", $output, $return_var);
        exec("cd $project_dir/web && npm run build 2>&1", $output, $return_var);
        
        // Copy out/ to public_html/
        exec("cp -r $project_dir/web/out/* $project_dir/../public_html/ 2>&1", $output, $return_var);
    }
    
    // Clear Laravel cache (nếu là API)
    if (file_exists($project_dir . '/artisan')) {
        exec("cd $project_dir && php artisan config:cache 2>&1", $output, $return_var);
        exec("cd $project_dir && php artisan route:cache 2>&1", $output, $return_var);
    }
    
    // Log
    file_put_contents('deploy.log', date('Y-m-d H:i:s') . " - Deployed\n" . implode("\n", $output) . "\n\n", FILE_APPEND);
    
    echo json_encode(['status' => 'success', 'output' => $output]);
} else {
    echo json_encode(['status' => 'ignored', 'reason' => 'Not main branch']);
}
?>
```

**Nội dung Shell (`deploy-webhook.sh`):**
```bash
#!/bin/bash
# deploy-webhook.sh

# Configuration
PROJECT_DIR="/path/to/your/project"  # Thay bằng đường dẫn thực tế
WEB_DIR="$PROJECT_DIR/web"
API_DIR="$PROJECT_DIR/api"
PUBLIC_HTML="/path/to/public_html"   # Thay bằng đường dẫn thực tế

# Log file
LOG_FILE="$PROJECT_DIR/deploy.log"

# Function to log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log "Starting deployment..."

# Pull code
cd "$PROJECT_DIR" || exit
git pull origin main >> "$LOG_FILE" 2>&1

# Deploy Web (Next.js)
if [ -d "$WEB_DIR" ]; then
    log "Building Next.js..."
    cd "$WEB_DIR" || exit
    npm install --production >> "$LOG_FILE" 2>&1
    npm run build >> "$LOG_FILE" 2>&1
    
    # Copy to public_html
    if [ -d "out" ]; then
        log "Copying files to public_html..."
        cp -r out/* "$PUBLIC_HTML/" >> "$LOG_FILE" 2>&1
    fi
fi

# Deploy API (Laravel)
if [ -d "$API_DIR" ]; then
    log "Clearing Laravel cache..."
    cd "$API_DIR" || exit
    php artisan config:cache >> "$LOG_FILE" 2>&1
    php artisan route:cache >> "$LOG_FILE" 2>&1
fi

log "Deployment completed!"
```

#### Bước 2: Setup Webhook trên GitHub

1. Vào repository trên GitHub
2. Settings → Webhooks → Add webhook
3. Payload URL: `https://api.websi.vn/deploy-webhook.php` (hoặc URL của script)
4. Content type: `application/json`
5. Secret: Nhập secret key (giống trong script)
6. Events: Chọn "Just the push event"
7. Active: Check
8. Add webhook

#### Bước 3: Set permissions cho script

**Qua SSH:**
```bash
chmod +x deploy-webhook.sh
```

**Qua File Manager:**
- Set permissions: `755` cho script

### Option 2: Cron Job

#### Bước 1: Tạo script check và pull

**Tạo file:** `auto-pull.sh`

```bash
#!/bin/bash
# auto-pull.sh

PROJECT_DIR="/path/to/your/project"
WEB_DIR="$PROJECT_DIR/web"
API_DIR="$PROJECT_DIR/api"
PUBLIC_HTML="/path/to/public_html"
LOG_FILE="$PROJECT_DIR/auto-pull.log"

cd "$PROJECT_DIR" || exit

# Fetch latest changes
git fetch origin main >> "$LOG_FILE" 2>&1

# Check if there are changes
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Changes detected, pulling..." >> "$LOG_FILE"
    
    # Pull code
    git pull origin main >> "$LOG_FILE" 2>&1
    
    # Build and deploy Web
    if [ -d "$WEB_DIR" ]; then
        cd "$WEB_DIR" || exit
        npm install --production >> "$LOG_FILE" 2>&1
        npm run build >> "$LOG_FILE" 2>&1
        cp -r out/* "$PUBLIC_HTML/" >> "$LOG_FILE" 2>&1
    fi
    
    # Clear API cache
    if [ -d "$API_DIR" ]; then
        cd "$API_DIR" || exit
        php artisan config:cache >> "$LOG_FILE" 2>&1
        php artisan route:cache >> "$LOG_FILE" 2>&1
    fi
    
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deployment completed!" >> "$LOG_FILE"
fi
```

#### Bước 2: Setup Cron Job trong cPanel

1. Vào cPanel → Cron Jobs
2. Add New Cron Job:
   - **Minute:** `*/5` (mỗi 5 phút)
   - **Hour:** `*`
   - **Day:** `*`
   - **Month:** `*`
   - **Weekday:** `*`
   - **Command:** `/bin/bash /path/to/auto-pull.sh`

### Option 3: GitHub Actions

#### Tạo file: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Hosting

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Build Next.js
      run: |
        cd web
        npm install
        npm run build
    
    - name: Deploy to Hosting
      uses: SamKirkland/FTP-Deploy-Action@4.3.0
      with:
        server: ${{ secrets.FTP_SERVER }}
        username: ${{ secrets.FTP_USERNAME }}
        password: ${{ secrets.FTP_PASSWORD }}
        local-dir: ./web/out/
        server-dir: /public_html/
```

## 📝 Workflow Hàng Ngày

### 1. Chỉnh sửa code trên local

```bash
cd /Users/buiquocvu/banhmi
# Sửa code...
```

### 2. Commit và push

```bash
git add .
git commit -m "Mô tả thay đổi"
git push origin main
```

### 3. Hosting tự động deploy

- Webhook: Tự động chạy ngay khi push
- Cron Job: Chạy trong vòng 5 phút
- GitHub Actions: Tự động chạy ngay khi push

## 🔒 Bảo Mật

### 1. Secret Key cho Webhook

- Dùng secret key mạnh
- Không commit secret key vào Git
- Lưu secret key trong `.env` hoặc biến môi trường

### 2. SSH Key cho Git

- Dùng SSH key thay vì password
- Set permissions đúng cho `.ssh` folder

### 3. File Permissions

- Script: `755`
- Log files: `644`
- Không cho phép public access vào script

## 📋 Checklist Setup

- [ ] Đã tạo Git repository
- [ ] Đã push code lên Git
- [ ] Đã tạo script deploy trên hosting
- [ ] Đã setup webhook hoặc cron job
- [ ] Đã test: Push code → Hosting tự động deploy
- [ ] Đã kiểm tra log: Xem có lỗi không

## 🆘 Troubleshooting

### Script không chạy:

- Kiểm tra permissions: `chmod +x script.sh`
- Kiểm tra đường dẫn: Phải là đường dẫn đầy đủ
- Kiểm tra log file: Xem có lỗi gì không

### Git pull không hoạt động:

- Kiểm tra SSH key hoặc credentials
- Kiểm tra quyền truy cập repository
- Test manual: `git pull` trên hosting

### Build không thành công:

- Kiểm tra Node.js version
- Kiểm tra dependencies: `npm install`
- Xem log để biết lỗi cụ thể

## ✅ Kết Quả

Sau khi setup:
- Chỉnh sửa code local → Push Git → Hosting tự động deploy
- Không cần upload thủ công nữa
- Deploy nhanh và tự động

