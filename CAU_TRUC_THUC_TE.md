# 📁 Cấu Trúc Thực Tế - API và Web ở 2 Nơi Khác Nhau

## 🎯 Cấu trúc thực tế

```
domains/
├── api.websi.vn/              ← Subdomain (API)
│   └── api/                   ← Laravel API (từ Git)
│
└── websi.vn/                  ← Domain chính (Web)
    ├── web/                   ← Next.js source (từ Git)
    └── public_html/           ← Static files (Next.js build output)
```

## 🔄 Quy trình Deploy

### Option 1: 2 Git Repo riêng biệt

**Nếu API và Web là 2 repo riêng:**

```
Git Repo 1 (API):
  → Clone vào: domains/api.websi.vn/
  → Có thư mục: api/

Git Repo 2 (Web):
  → Clone vào: domains/websi.vn/
  → Có thư mục: web/
```

### Option 2: 1 Git Repo, pull vào 2 nơi

**Nếu API và Web cùng 1 repo:**

```
Git Repo (có cả api/ và web/):
  → Clone vào: domains/api.websi.vn/ → có api/
  → Clone vào: domains/websi.vn/ → có web/
```

## 🔧 Script cần cập nhật

Cần 2 script riêng hoặc 1 script xử lý cả 2 nơi.


