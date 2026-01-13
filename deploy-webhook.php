<?php
/**
 * Webhook endpoint for auto-deployment
 * Đặt file này trên hosting và setup webhook từ GitHub/GitLab
 * 
 * URL: https://api.websi.vn/deploy-webhook.php
 */

// ============================================
// CONFIGURATION
// ============================================

// Secret key (phải giống với secret trong GitHub webhook)
$SECRET = 'your-secret-key-here'; // ← Thay bằng secret key của bạn

// Đường dẫn đến script deploy
$DEPLOY_SCRIPT = __DIR__ . '/deploy-webhook.sh';

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

