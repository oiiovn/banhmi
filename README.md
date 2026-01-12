# 🍞 Banhmi - Ứng dụng đặt hàng bánh mì

Dự án full-stack cho ứng dụng đặt hàng bánh mì online với 3 phần chính:
- **API Backend** (Laravel)
- **Web Frontend** (Next.js)
- **Mobile App** (Flutter)

## 🎯 Mục tiêu

Hệ thống quản lý đặt hàng và giao dịch từ khách hàng tới đại lý bán sỉ với 3 cấp người dùng:
- **Admin**: Quản lý toàn bộ hệ thống (đại lý, sản phẩm, đơn hàng)
- **Đại lý (Agent)**: Quản lý đơn hàng được phân công, cập nhật trạng thái đơn hàng
- **Khách hàng (Customer)**: Đặt hàng và xem đơn hàng của mình

## 📋 Mục lục

- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Chạy dự án](#chạy-dự-án)
- [Tính năng](#tính-năng)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)

## 📁 Cấu trúc dự án

```
banhmi/
├── api/          # Laravel API Backend
├── web/          # Next.js Web Frontend
└── mobile/       # Flutter Mobile App
```

## 💻 Yêu cầu hệ thống

### API Backend
- PHP >= 8.1
- Composer
- MySQL/MariaDB
- Laravel 10.x

### Web Frontend
- Node.js >= 18
- npm hoặc yarn

### Mobile App
- Flutter SDK >= 3.0.0
- Dart >= 3.0.0

## 🚀 Cài đặt

### 1. API Backend

```bash
cd api
composer install
cp .env.example .env
php artisan key:generate
# Cấu hình database trong .env
php artisan migrate
php artisan db:seed --class=AdminSeeder  # Tạo admin và đại lý mẫu
php artisan serve
```

API sẽ chạy tại `http://localhost:8000`

**Tài khoản mặc định sau khi seed:**
- Admin: `admin@banhmi.com` / `admin123`
- Đại lý 1: `agent1@banhmi.com` / `agent123`
- Đại lý 2: `agent2@banhmi.com` / `agent123`

### 2. Web Frontend

```bash
cd web
npm install
# Tạo file .env.local với nội dung:
# NEXT_PUBLIC_API_URL=http://localhost:8000/api
npm run dev
```

Web sẽ chạy tại `http://localhost:3000` (hoặc port khác nếu 3000 bị chiếm, ví dụ: 3002)

### 3. Mobile App

```bash
cd mobile
flutter pub get
# Cập nhật API URL trong lib/providers/
flutter run
```

## 🎯 Tính năng

### Đã hoàn thành
- ✅ **Hệ thống 3 cấp người dùng**
  - Admin: Quản lý toàn bộ hệ thống
  - Đại lý: Quản lý đơn hàng được phân công
  - Khách hàng: Đặt hàng và xem đơn hàng
- ✅ **API Backend với Laravel**
  - Authentication với phân quyền (Admin/Agent/Customer)
  - Quản lý Categories, Products, Orders
  - Admin routes: Quản lý đại lý, khách hàng, sản phẩm, đơn hàng
  - Agent routes: Xem và quản lý đơn hàng được phân công
  - Customer routes: Đặt hàng và xem đơn hàng
- ✅ **Web Frontend với Next.js**
  - Trang chủ hiển thị sản phẩm
  - Lọc sản phẩm theo danh mục
  - UI/UX hiện đại với Tailwind CSS
- ✅ **Mobile App với Flutter**
  - Trang chủ hiển thị sản phẩm
  - Lọc sản phẩm theo danh mục
  - State management với Provider

### Sắp phát triển
- 🔄 Đăng ký/Đăng nhập trên Web và Mobile
- 🔄 Giỏ hàng và thanh toán
- 🔄 Dashboard Admin trên Web
- 🔄 Dashboard Đại lý trên Web và Mobile
- 🔄 Push notifications cho đơn hàng
- 🔄 Báo cáo và thống kê

## 🛠 Công nghệ sử dụng

### Backend
- **Laravel 10** - PHP Framework
- **Laravel Sanctum** - API Authentication
- **MySQL** - Database

### Web Frontend
- **Next.js 14** - React Framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP Client

### Mobile
- **Flutter** - Cross-platform framework
- **Provider** - State management
- **HTTP** - API calls

## 📝 API Documentation

Xem chi tiết tại [API README](api/README.md)

### Quy trình đặt hàng
1. **Khách hàng** tạo đơn hàng → status: `pending`, `agent_id`: null
2. **Admin** hoặc **Đại lý** nhận đơn hàng → assign `agent_id`, status: `confirmed`
3. **Đại lý** cập nhật trạng thái: `preparing` → `ready` → `delivered`
4. **Admin** có thể xem và quản lý tất cả đơn hàng

### Routes chính
- **Public**: `/api/register`, `/api/login`, `/api/categories`, `/api/products`
- **Customer**: `/api/orders` (GET, POST)
- **Admin**: `/api/admin/*` (quản lý toàn bộ hệ thống)
- **Agent**: `/api/agent/*` (quản lý đơn hàng được phân công)

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo issue hoặc pull request.

## 📄 License

MIT License

