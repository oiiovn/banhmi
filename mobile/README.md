# Banhmi Mobile (Flutter)

Mobile app cho dự án Banhmi

## Cài đặt1. Đảm bảo bạn đã cài đặt Flutter SDK (>=3.0.0)

2. Cài đặt dependencies:
```bash
flutter pub get
```3. Cấu hình API URL trong `lib/providers/product_provider.dart` và `lib/providers/auth_provider.dart`:
```dart
static const String baseUrl = 'http://YOUR_API_URL/api';
```

4. Chạy ứng dụng:
```bash
flutter run
```

## Cấu trúc dự án

- `lib/main.dart` - Entry point của ứng dụng
- `lib/screens/` - Các màn hình
- `lib/models/` - Data models
- `lib/providers/` - State management với Provider

## Tính năng

- Xem danh sách sản phẩm
- Lọc sản phẩm theo danh mục
- Đăng ký/Đăng nhập (sắp có)
- Đặt hàng (sắp có)
