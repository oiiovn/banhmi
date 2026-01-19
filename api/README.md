# Banhmi API (Laravel)

API backend cho dự án Banhmi

## Cài đặt

1. Cài đặt dependencies:
```bash
composer install
```

2. Copy file `.env.example` thành `.env`:
```bash
cp .env.example .env
```

3. Tạo application key:
```bash
php artisan key:generate
```

4. Cấu hình database trong file `.env`5. Chạy migrations:
```bash
php artisan migrate
```

6. Chạy server:
```bash
php artisan serve
```

API sẽ chạy tại `http://localhost:8000`

## Hệ thống 3 cấp người dùng

- **Admin**: Quản lý toàn bộ hệ thống (đại lý, sản phẩm, đơn hàng)
- **Đại lý (Agent)**: Quản lý đơn hàng được phân công, cập nhật trạng thái đơn hàng
- **Khách hàng (Customer)**: Đặt hàng và xem đơn hàng của mình## API Endpoints### Authentication (Public)
- `POST /api/register` - Đăng ký tài khoản khách hàng mới
- `POST /api/login` - Đăng nhập (trả về role của user)
- `POST /api/logout` - Đăng xuất (yêu cầu authentication)

### Categories (Public)
- `GET /api/categories` - Lấy danh sách danh mục
- `GET /api/categories/{id}` - Lấy chi tiết danh mục

### Products (Public)
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/{id}` - Lấy chi tiết sản phẩm

### Orders (Customer - yêu cầu authentication)
- `GET /api/orders` - Lấy danh sách đơn hàng của khách hàng
- `POST /api/orders` - Tạo đơn hàng mới
- `GET /api/orders/{id}` - Lấy chi tiết đơn hàng

### Admin Routes (yêu cầu role: admin)
- `GET /api/admin/dashboard` - Thống kê tổng quan
- `GET /api/admin/agents` - Danh sách đại lý
- `POST /api/admin/agents` - Tạo đại lý mới
- `PUT /api/admin/agents/{id}` - Cập nhật đại lý
- `DELETE /api/admin/agents/{id}` - Xóa đại lý
- `GET /api/admin/customers` - Danh sách khách hàng
- `GET /api/admin/orders` - Tất cả đơn hàng (có filter)
- `PUT /api/admin/orders/{id}/status` - Cập nhật trạng thái đơn hàng và assign đại lý
- `GET /api/admin/products` - Tất cả sản phẩm
- `POST /api/admin/products` - Tạo sản phẩm
- `PUT /api/admin/products/{id}` - Cập nhật sản phẩm
- `DELETE /api/admin/products/{id}` - Xóa sản phẩm
- `POST /api/admin/categories` - Tạo danh mục
- `PUT /api/admin/categories/{id}` - Cập nhật danh mục
- `DELETE /api/admin/categories/{id}` - Xóa danh mục

### Agent Routes (yêu cầu role: agent)
- `GET /api/agent/dashboard` - Thống kê đại lý
- `GET /api/agent/orders` - Danh sách đơn hàng được phân công
- `GET /api/agent/orders/pending` - Đơn hàng chưa được assign (để nhận)
- `GET /api/agent/orders/{id}` - Chi tiết đơn hàng
- `POST /api/agent/orders/{id}/accept` - Nhận đơn hàng
- `PUT /api/agent/orders/{id}/status` - Cập nhật trạng thái đơn hàng (confirmed → delivered)

## Cấu trúc Database

- **users**: Thông tin người dùng (có field `role`: admin, agent, customer)
- **categories**: Danh mục sản phẩm
- **products**: Sản phẩm
- **orders**: Đơn hàng (có `user_id` - khách hàng, `agent_id` - đại lý)
- **order_items**: Chi tiết đơn hàng

## Quy trình đặt hàng

1. **Khách hàng** tạo đơn hàng → status: `pending`, `agent_id`: null
2. **Admin** hoặc **Đại lý** nhận đơn hàng → assign `agent_id`, status: `confirmed`
3. **Đại lý** cập nhật trạng thái: `preparing` → `ready` → `delivered`
4. **Admin** có thể xem và quản lý tất cả đơn hàng