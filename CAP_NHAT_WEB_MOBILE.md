# 🔄 Cập Nhật Code Web và Mobile Cho Production

## 📊 Tóm tắt

### ✅ Web (Next.js) - KHÔNG CẦN SỬA CODE
- Code đã dùng biến môi trường `NEXT_PUBLIC_API_URL`
- Chỉ cần tạo file `.env.production` với API URL

### ⚠️ Mobile (Flutter) - CẦN SỬA CODE
- Đang hardcode `localhost:8000`
- Cần thay đổi thành `https://api.websi.vn/api`

---

## 🌐 Web (Next.js) - Chỉ cần cấu hình

### Bước 1: Tạo file `.env.production`

**Vị trí:** `web/.env.production`

**Nội dung:**
```env
NEXT_PUBLIC_API_URL=https://api.websi.vn/api
NEXT_PUBLIC_IMAGE_DOMAINS=api.websi.vn,websi.vn
```

### Bước 2: Rebuild (nếu đang chạy production)

```bash
cd web
npm run build
npm start
```

**Lưu ý:**
- Code đã tự động đọc từ `NEXT_PUBLIC_API_URL`
- Không cần sửa code
- Chỉ cần set biến môi trường

---

## 📱 Mobile (Flutter) - Cần sửa code

### File cần sửa:

1. `mobile/lib/providers/auth_provider.dart`
2. `mobile/lib/providers/product_provider.dart`

### Cách 1: Sửa trực tiếp (Đơn giản)

Thay đổi từ:
```dart
static const String baseUrl = 'http://localhost:8000/api';
```

Thành:
```dart
static const String baseUrl = 'https://api.websi.vn/api';
```

### Cách 2: Dùng biến môi trường (Khuyến nghị)

Tạo file config để dễ quản lý.

---

## 🔧 Hướng dẫn sửa Mobile

### Option 1: Sửa trực tiếp (Nhanh)

**File 1: `mobile/lib/providers/auth_provider.dart`**

Dòng 14:
```dart
// Từ:
static const String baseUrl = 'http://localhost:8000/api';

// Thành:
static const String baseUrl = 'https://api.websi.vn/api';
```

**File 2: `mobile/lib/providers/product_provider.dart`**

Dòng 16:
```dart
// Từ:
static const String baseUrl = 'http://localhost:8000/api';

// Thành:
static const String baseUrl = 'https://api.websi.vn/api';
```

### Option 2: Tạo file config (Tốt hơn)

**Tạo file:** `mobile/lib/config/api_config.dart`

```dart
class ApiConfig {
  // Development
  static const String devBaseUrl = 'http://localhost:8000/api';
  
  // Production
  static const String prodBaseUrl = 'https://api.websi.vn/api';
  
  // Chọn baseUrl dựa trên environment
  static const String baseUrl = kDebugMode ? devBaseUrl : prodBaseUrl;
  
  // Hoặc luôn dùng production:
  // static const String baseUrl = prodBaseUrl;
}
```

**Sau đó sửa các provider:**

**`auth_provider.dart`:**
```dart
import '../config/api_config.dart';

class AuthProvider with ChangeNotifier {
  // Thay:
  // static const String baseUrl = 'http://localhost:8000/api';
  
  // Bằng:
  static const String baseUrl = ApiConfig.baseUrl;
  // ...
}
```

**`product_provider.dart`:**
```dart
import '../config/api_config.dart';

class ProductProvider with ChangeNotifier {
  // Thay:
  // static const String baseUrl = 'http://localhost:8000/api';
  
  // Bằng:
  static const String baseUrl = ApiConfig.baseUrl;
  // ...
}
```

---

## ✅ Checklist

### Web:
- [ ] Đã tạo file `web/.env.production`
- [ ] Đã set `NEXT_PUBLIC_API_URL=https://api.websi.vn/api`
- [ ] Đã rebuild (nếu cần)
- [ ] Đã test kết nối API

### Mobile:
- [ ] Đã sửa `auth_provider.dart`
- [ ] Đã sửa `product_provider.dart`
- [ ] Đã test trên device/emulator
- [ ] Đã build APK/IPA với URL mới

---

## 🧪 Test sau khi cập nhật

### Web:
1. Mở `websi.vn`
2. F12 → Console
3. Xem request đến `https://api.websi.vn/api/...`
4. Test đăng nhập

### Mobile:
1. Build và chạy app
2. Test đăng nhập
3. Test load sản phẩm
4. Kiểm tra không có lỗi network

---

## 📝 Lưu ý

### Web:
- Biến môi trường `NEXT_PUBLIC_*` phải được set trước khi build
- Nếu đổi URL sau khi build, cần rebuild lại
- Development vẫn dùng `localhost` (từ `.env.local`)

### Mobile:
- Nếu dùng Option 1 (sửa trực tiếp), cần nhớ đổi lại khi test local
- Nếu dùng Option 2 (config), có thể switch dễ dàng
- Trên mobile thật, không thể dùng `localhost` (phải dùng IP hoặc domain)

---

## 🔄 Chuyển đổi giữa Dev và Production

### Web:
- **Development:** File `.env.local` với `NEXT_PUBLIC_API_URL=http://localhost:8000/api`
- **Production:** File `.env.production` với `NEXT_PUBLIC_API_URL=https://api.websi.vn/api`

### Mobile (nếu dùng Option 2):
- Tự động switch dựa trên `kDebugMode`
- Hoặc comment/uncomment dòng trong `ApiConfig`


