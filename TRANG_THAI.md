# 📊 Trạng thái dự án Banhmi

## ✅ Đang chạy

### API Backend (Laravel)
- **URL**: http://localhost:8000
- **Status**: ✅ Đang chạy
- **API Endpoint**: http://localhost:8000/api
- **Test**: `curl http://localhost:8000/api/categories`

### Web Frontend (Next.js)
- **URL**: http://localhost:3002
- **Status**: ✅ Đang chạy
- **Port**: 3002 (port 3000 đang được sử dụng bởi dự án khác)

## 🔐 Tài khoản mặc định

- **Admin**: `admin@banhmi.com` / `admin123`
- **Đại lý 1**: `agent1@banhmi.com` / `agent123`
- **Đại lý 2**: `agent2@banhmi.com` / `agent123`

## 📝 Lưu ý

- Port 3000 đang được sử dụng bởi dự án khác, nên Next.js chạy trên port 3002
- Để thay đổi port, chạy: `cd web && npm run dev -- -p <port_number>`
- API đang chạy ở background, để dừng: `pkill -f "php artisan serve"`

## 🚀 Khởi động lại

### API:
```bash
cd api
php artisan serve
```

### Web:
```bash
cd web
npm run dev -- -p 3002
```





