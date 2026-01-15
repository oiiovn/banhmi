# 🔄 Hướng Dẫn Setup Tự Động Deploy

## 🎯 Có 2 cách để chạy tự động

### Cách 1: GitHub Webhook (Khuyến nghị)
- ✅ Chạy ngay khi push code
- ✅ Chỉ chạy khi có thay đổi
- ✅ Nhanh và hiệu quả

### Cách 2: Cron Job
- ✅ Chạy định kỳ (mỗi 5 phút, 10 phút, ...)
- ✅ Không cần webhook
- ❌ Có thể chạy không cần thiết

---

## 🔧 CÁCH 1: Setup GitHub Webhook

### Bước 1: Sửa deploy-webhook.php

**Qua SSH hoặc File Manager:**

```bash
cd /home/dro94744/domains/api.websi.vn

# Kiểm tra có deploy-webhook.php chưa
ls -la deploy-webhook.php

# Nếu chưa có, tạo file mới
# Nếu có rồi, sửa file
```

**Nội dung file `deploy-webhook.php`:**

```php
<?php
/**
 * Webhook endpoint for auto-deployment
 * URL: https://api.websi.vn/deploy-webhook.php
 */

// Secret key (tạo ngẫu nhiên, giữ bí mật)
$SECRET = 'your-secret-key-12345'; // ← Thay bằng secret key của bạn

// Đường dẫn đến script deploy
$DEPLOY_SCRIPT = __DIR__ . '/deploy-webhook-v2.sh';

// Log file
$LOG_FILE = __DIR__ . '/deploy-webhook.log';

// ============================================
// FUNCTIONS
// ============================================

function log_message($message) {
    global $LOG_FILE;
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($LOG_FILE, "[$timestamp] $message\n", FILE_APPEND);
}

// ============================================
// VERIFY REQUEST
// ============================================

// Get payload
$payload = file_get_contents('php://input');
$headers = getallheaders();

// Verify signature (GitHub)
if (isset($headers['X-Hub-Signature-256'])) {
    $signature = $headers['X-Hub-Signature-256'];
    $hash = 'sha256=' . hash_hmac('sha256', $payload, $SECRET);
    
    if (!hash_equals($signature, $hash)) {
        log_message('ERROR: Invalid signature');
        http_response_code(401);
        die('Invalid signature');
    }
}

// ============================================
// PARSE PAYLOAD
// ============================================

$data = json_decode($payload, true);

if (!$data) {
    log_message('ERROR: Invalid JSON payload');
    http_response_code(400);
    die('Invalid payload');
}

// ============================================
// CHECK EVENT TYPE
// ============================================

$event = $headers['X-GitHub-Event'] ?? '';

if ($event !== 'push') {
    log_message("INFO: Ignored event type: $event");
    http_response_code(200);
    echo json_encode(['status' => 'ignored', 'reason' => "Event type: $event"]);
    exit;
}

// ============================================
// CHECK BRANCH
// ============================================

$ref = $data['ref'] ?? '';
$branch = str_replace('refs/heads/', '', $ref);

if ($branch !== 'main' && $branch !== 'master') {
    log_message("INFO: Ignored branch: $branch");
    http_response_code(200);
    echo json_encode(['status' => 'ignored', 'reason' => "Branch: $branch"]);
    exit;
}

// ============================================
// EXECUTE DEPLOYMENT
// ============================================

log_message("Starting deployment for branch: $branch");

// Execute deploy script
$output = [];
$return_var = 0;

if (file_exists($DEPLOY_SCRIPT)) {
    exec("bash $DEPLOY_SCRIPT 2>&1", $output, $return_var);
    
    if ($return_var === 0) {
        log_message('Deployment completed successfully');
        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'branch' => $branch,
            'output' => $output
        ]);
    } else {
        log_message('ERROR: Deployment failed');
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'branch' => $branch,
            'output' => $output
        ]);
    }
} else {
    log_message("ERROR: Deploy script not found: $DEPLOY_SCRIPT");
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Deploy script not found'
    ]);
}
?>
```

### Bước 2: Tạo Secret Key

**Tạo secret key ngẫu nhiên:**

```bash
# Trên hosting hoặc máy local
openssl rand -hex 32
# Hoặc
date +%s | sha256sum | base64 | head -c 32
```

**Copy secret key và sửa trong `deploy-webhook.php`**

### Bước 3: Setup GitHub Webhook

1. **Vào GitHub repo `banhmi-api`** → Settings → Webhooks → Add webhook

2. **Cấu hình:**
   - **Payload URL:** `https://api.websi.vn/deploy-webhook.php`
   - **Content type:** `application/json`
   - **Secret:** (dán secret key vừa tạo)
   - **Events:** Chọn "Just the push event"
   - **Active:** ✅

3. **Click** "Add webhook"

4. **Làm tương tự cho repo `banhmi-web`** (nếu muốn deploy web riêng)

### Bước 4: Test Webhook

```bash
# Push code lên GitHub
git add .
git commit -m "Test deploy"
git push origin main

# Xem log trên hosting
tail -f /home/dro94744/domains/api.websi.vn/deploy-webhook.log
tail -f /home/dro94744/domains/api.websi.vn/deploy.log
```

---

## 🔧 CÁCH 2: Setup Cron Job

### Bước 1: Tạo script auto-pull

**Tạo file `auto-pull.sh`:**

```bash
cd /home/dro94744/domains/api.websi.vn

cat > auto-pull.sh << 'EOF'
#!/bin/bash
# Auto-pull script for Cron Job

PROJECT_DIR="/home/dro94744/domains/api.websi.vn"
API_DIR="$PROJECT_DIR/api"
WEB_DIR="/home/dro94744/domains/websi.vn/web"
LOG_FILE="$PROJECT_DIR/auto-pull.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Pull API
cd "$API_DIR/.." || exit
git fetch origin main >> "$LOG_FILE" 2>&1
LOCAL=$(git rev-parse HEAD 2>/dev/null)
REMOTE=$(git rev-parse origin/main 2>/dev/null)

if [ "$LOCAL" != "$REMOTE" ]; then
    log "Changes detected in API, running deploy..."
    bash "$PROJECT_DIR/deploy-webhook-v2.sh" >> "$LOG_FILE" 2>&1
fi

# Pull Web
if [ -d "$WEB_DIR/.." ] && [ -d "$WEB_DIR/../.git" ]; then
    cd "$WEB_DIR/.." || exit
    git fetch origin main >> "$LOG_FILE" 2>&1
    LOCAL=$(git rev-parse HEAD 2>/dev/null)
    REMOTE=$(git rev-parse origin/main 2>/dev/null)
    
    if [ "$LOCAL" != "$REMOTE" ]; then
        log "Changes detected in Web, running deploy..."
        bash "$PROJECT_DIR/deploy-webhook-v2.sh" >> "$LOG_FILE" 2>&1
    fi
fi
EOF

chmod +x auto-pull.sh
```

### Bước 2: Setup Cron Job

**Qua cPanel:**

1. **Vào cPanel** → Cron Jobs → Add New Cron Job
2. **Cấu hình:**
   - **Minute:** `*/5` (mỗi 5 phút)
   - **Hour:** `*`
   - **Day:** `*`
   - **Month:** `*`
   - **Weekday:** `*`
   - **Command:**
     ```bash
     /bin/bash /home/dro94744/domains/api.websi.vn/auto-pull.sh
     ```
3. **Click** "Add New Cron Job"

**Hoặc qua SSH:**

```bash
crontab -e

# Thêm dòng:
*/5 * * * * /bin/bash /home/dro94744/domains/api.websi.vn/auto-pull.sh >> /home/dro94744/domains/api.websi.vn/cron.log 2>&1
```

---

## 📋 Checklist

### Webhook:
- [ ] Đã tạo/sửa deploy-webhook.php
- [ ] Đã tạo secret key
- [ ] Đã setup webhook trên GitHub
- [ ] Đã test webhook

### Cron Job:
- [ ] Đã tạo auto-pull.sh
- [ ] Đã set permissions
- [ ] Đã setup cron job
- [ ] Đã test cron job

---

## 🎯 Khuyến nghị

**Dùng Webhook** vì:
- ✅ Chạy ngay khi push code
- ✅ Không tốn tài nguyên
- ✅ Chỉ chạy khi có thay đổi

**Chỉ dùng Cron Job** nếu:
- Hosting không hỗ trợ webhook
- Muốn backup định kỳ


