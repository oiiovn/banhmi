# 📋 Hướng dẫn Đăng ký Đại lý Bán sỉ

## 🎯 Có 2 cách để trở thành Đại lý

### Cách 1: Admin tạo trực tiếp (Khuyến nghị)

**Dành cho:** Admin hệ thống

**Các bước:**

1. **Đăng nhập với tài khoản Admin:**
   - Email: `admin@banhmi.com`
   - Password: `admin123`
   - Truy cập: http://localhost:3002/login

2. **Truy cập trang Quản lý Đại lý:**
   - Sau khi đăng nhập, click vào "Đại lý" trong header
   - Hoặc truy cập trực tiếp: http://localhost:3002/admin/agents

3. **Tạo đại lý mới:**
   - Click nút "+ Tạo đại lý mới"
   - Điền thông tin:
     - Họ và tên *
     - Email * (phải unique)
     - Mật khẩu * (tối thiểu 8 ký tự)
     - Xác nhận mật khẩu *
     - Số điện thoại (tùy chọn)
     - Địa chỉ (tùy chọn)
   - Click "Tạo đại lý"

4. **Đại lý có thể đăng nhập ngay:**
   - Sử dụng email và mật khẩu vừa tạo
   - Truy cập: http://localhost:3002/login

### Cách 2: Đại lý tự đăng ký (Cần Admin phê duyệt)

**Dành cho:** Người muốn trở thành đại lý

**Các bước:**

1. **Đăng ký tài khoản:**
   - Truy cập: http://localhost:3002/register-agent
   - Điền đầy đủ thông tin:
     - Họ và tên *
     - Email *
     - Số điện thoại *
     - Địa chỉ *
     - Tên doanh nghiệp (tùy chọn)
     - Mã số thuế (tùy chọn)
     - Mật khẩu *
     - Xác nhận mật khẩu *
     - Ghi chú thêm (tùy chọn)
   - Click "Gửi yêu cầu đăng ký Đại lý"

2. **Tài khoản được tạo với quyền Khách hàng:**
   - Bạn có thể đăng nhập ngay với tư cách Khách hàng
   - Tài khoản sẽ được tạo thành công

3. **Liên hệ Admin để nâng cấp:**
   - Admin sẽ xem danh sách khách hàng tại: http://localhost:3002/admin/customers
   - Admin click "Nâng cấp lên Đại lý" cho tài khoản của bạn
   - Sau khi nâng cấp, bạn có thể đăng nhập lại và sẽ có quyền Đại lý

## 🔐 Quyền hạn của Đại lý

Sau khi trở thành Đại lý, bạn có thể:

- ✅ Xem dashboard với thống kê đơn hàng
- ✅ Xem danh sách đơn hàng được phân công
- ✅ Xem đơn hàng chưa được assign (để nhận)
- ✅ Nhận đơn hàng (accept order)
- ✅ Cập nhật trạng thái đơn hàng (confirmed → delivered)
- ✅ Xem thống kê doanh thu

## 📍 Các trang liên quan

- **Đăng ký Đại lý:** http://localhost:3002/register-agent
- **Đăng nhập:** http://localhost:3002/login
- **Admin Dashboard:** http://localhost:3002/admin (chỉ Admin)
- **Quản lý Đại lý:** http://localhost:3002/admin/agents (chỉ Admin)
- **Quản lý Khách hàng:** http://localhost:3002/admin/customers (chỉ Admin)
- **Đại lý Dashboard:** http://localhost:3002/agent (chỉ Đại lý)

## 💡 Lưu ý

- Chỉ Admin mới có thể tạo hoặc nâng cấp tài khoản lên Đại lý
- Đại lý không thể tự đăng ký trực tiếp với role "agent"
- Nếu đăng ký qua `/register-agent`, tài khoản sẽ được tạo với role "customer" và cần Admin nâng cấp
- Admin có thể xem và quản lý tất cả đại lý tại trang Quản lý Đại lý





