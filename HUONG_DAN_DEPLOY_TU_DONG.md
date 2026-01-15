# 🚀 Hướng dẫn setup tự động deploy Web từ Git lên hosting

## 📋 Tổng quan

Script này sẽ tự động:
1. **Pull code** từ Git repository
2. **Build Next.js** (tạo thư mục `out/`)
3. **Copy nội dung** từ `web/out/` vào `public_html/`

## 📁 Cấu trúc trên hosting

```
/home/username/domains/websi.vn/
├── repo/              # Git repository (clone từ GitHub/GitLab)
│   ├── .git/
│   ├── web/
│   │   ├── package.json
│   │   ├── next.config.js
│   │   └── ... (source code)
│   └── api/
└── public_html/       # Nơi chứa files static (web đã build)
    ├── index.html
    ├── _next/
    └── ...
```

## 🔧 Bước 1: Clone Git repository lên hosting

1. **SSH vào hosting**:
   ```bash
   ssh username@yourhosting.com
   ```

2. **Tạo thư mục repo** (nếu chưa có):
   ```bash
   cd /home/username/domains/websi.vn/
   mkdir -p repo
   cd repo
   ```

3. **Clone repository**:
   ```bash
   git clone https://github.com/yourusername/yourrepo.git .
   # Hoặc nếu đã có repo:
   git pull origin main
   ```

## 📝 Bước 2: Cấu hình script deploy

1. **Upload script** `deploy-web-auto.sh` lên hosting:
   - Vào thư mục repo: `/home/username/domains/websi.vn/repo/`
   - Upload file `deploy-web-auto.sh`

2. **Sửa các đường dẫn** trong script:
   ```bash
   nano deploy-web-auto.sh
   ```

   Sửa các dòng:
   ```bash
   GIT_REPO_DIR="/home/username/domains/websi.vn/repo"  # ← Đường dẫn repo
   PUBLIC_HTML="/home/username/domains/websi.vn/public_html"  # ← Đường dẫn public_html
   API_URL=""  # ← Để trống nếu tự động detect, hoặc điền API URL nếu cần
   ```

3. **Set quyền thực thi**:
   ```bash
   chmod +x deploy-web-auto.sh
   ```

## 🧪 Bước 3: Test script thủ công

Chạy script để test:

```bash
cd /home/username/domains/websi.vn/repo
./deploy-web-auto.sh
```

Kiểm tra log:
```bash
tail -f deploy-web.log
```

Nếu thành công, kiểm tra `public_html/` có file mới không.

## ⚙️ Bước 4: Setup tự động deploy

Có 2 cách:

### Cách 1: GitHub/GitLab Webhook (Khuyến nghị)

1. **Upload file PHP webhook** (nếu chưa có):
   - Upload `deploy-webhook.php` lên `public_html/` hoặc thư mục API
   - Sửa đường dẫn trong file PHP trỏ đến script `deploy-web-auto.sh`

2. **Cấu hình webhook trên GitHub/GitLab**:
   - Vào Settings → Webhooks → Add webhook
   - Payload URL: `https://websi.vn/deploy-webhook.php`
   - Content type: `application/json`
   - Secret: Tạo secret key và điền vào file PHP
   - Events: Chọn `Just the push event`
   - Active: ✓

3. **Test webhook**:
   - Push code lên Git
   - Kiểm tra log: `tail -f deploy-web.log`

### Cách 2: Cron Job (Chạy định kỳ)

1. **Mở crontab**:
   ```bash
   crontab -e
   ```

2. **Thêm dòng** (chạy mỗi 5 phút):
   ```bash
   */5 * * * * cd /home/username/domains/websi.vn/repo && ./deploy-web-auto.sh >> /dev/null 2>&1
   ```

   Hoặc chạy mỗi giờ:
   ```bash
   0 * * * * cd /home/username/domains/websi.vn/repo && ./deploy-web-auto.sh >> /dev/null 2>&1
   ```

## 🔍 Kiểm tra và Debug

### Xem log:
```bash
tail -f /home/username/domains/websi.vn/repo/deploy-web.log
```

### Kiểm tra Git status:
```bash
cd /home/username/domains/websi.vn/repo
git status
git log -1
```

### Kiểm tra build:
```bash
cd /home/username/domains/websi.vn/repo/web
ls -la out/
```

### Kiểm tra public_html:
```bash
ls -la /home/username/domains/websi.vn/public_html/
```

## 🐛 Troubleshooting

### Lỗi: "Git pull failed"
- Kiểm tra kết nối Git
- Kiểm tra quyền truy cập repository
- Thử pull thủ công: `git pull origin main`

### Lỗi: "npm install failed"
- Kiểm tra Node.js đã cài chưa: `node -v`
- Kiểm tra npm: `npm -v`
- Có thể cần cài Node.js trên hosting

### Lỗi: "npm run build failed"
- Kiểm tra log chi tiết: `tail -f deploy-web.log`
- Kiểm tra file `.env.production` nếu cần
- Kiểm tra `next.config.js` có đúng không

### Lỗi: "Copy failed"
- Kiểm tra quyền truy cập `public_html/`
- Kiểm tra dung lượng disk: `df -h`
- Thử copy thủ công: `cp -r web/out/* public_html/`

### Script không chạy tự động
- Kiểm tra quyền thực thi: `chmod +x deploy-web-auto.sh`
- Kiểm tra cron job: `crontab -l`
- Kiểm tra webhook có được gọi không (xem log PHP)

## 📝 Lưu ý quan trọng

1. **`.gitignore` đã đúng**: Thư mục `web/out/` đã được ignore, không commit lên Git
2. **API URL**: Nếu API không ở subdomain `api.{domain}`, cần cấu hình `API_URL` trong script
3. **Backup**: Script tự động backup `.htaccess` trước khi deploy
4. **Permissions**: Script tự động set permissions cho `public_html/`

## ✅ Checklist

- [ ] Đã clone Git repository lên hosting
- [ ] Đã upload và cấu hình script `deploy-web-auto.sh`
- [ ] Đã test script thủ công thành công
- [ ] Đã setup webhook hoặc cron job
- [ ] Đã test push code và kiểm tra deploy tự động
- [ ] Đã kiểm tra website hoạt động đúng sau deploy
