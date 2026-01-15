# 💾 Vị Trí Database MySQL Trên Máy Local

## 📍 Database MySQL lưu ở đâu trên máy local?

Database MySQL trên máy local thường lưu ở các vị trí sau:

### macOS (Homebrew):
```
/opt/homebrew/var/mysql/        # Apple Silicon (M1/M2/M3)
/usr/local/var/mysql/           # Intel Mac
```

### macOS (MySQL Server từ mysql.com):
```
/usr/local/mysql/data/
```

### Linux:
```
/var/lib/mysql/
```

### Windows:
```
C:\ProgramData\MySQL\MySQL Server X.X\Data\
```

## 🔍 Cách tìm vị trí chính xác

### Cách 1: Qua MySQL Command

```bash
mysql -u root -p -e "SHOW VARIABLES LIKE 'datadir';"
```

**Kết quả sẽ hiển thị:**
```
+---------------+---------------------------+
| Variable_name | Value                     |
+---------------+---------------------------+
| datadir       | /opt/homebrew/var/mysql/  |
+---------------+---------------------------+
```

### Cách 2: Qua MySQL Config

**macOS (Homebrew):**
```bash
cat /opt/homebrew/etc/my.cnf
# hoặc
cat /usr/local/etc/my.cnf
```

**Linux:**
```bash
cat /etc/mysql/my.cnf
# hoặc
cat /etc/my.cnf
```

### Cách 3: Kiểm tra process

```bash
ps aux | grep mysql
# Xem --datadir trong output
```

## 📂 Cấu trúc thư mục database

Trong thư mục data, mỗi database là một thư mục:

```
/opt/homebrew/var/mysql/
├── banhmi/              ← Database của bạn
│   ├── users.frm
│   ├── users.ibd
│   ├── categories.frm
│   ├── categories.ibd
│   └── ...
├── mysql/               ← Database hệ thống
├── performance_schema/  ← Database hệ thống
└── sys/                 ← Database hệ thống
```

## 🔧 Cách truy cập database

### Qua MySQL Command Line:

```bash
# Kết nối
mysql -u root -p

# Hoặc với database cụ thể
mysql -u root -p banhmi
```

### Qua phpMyAdmin (nếu có):

Truy cập: `http://localhost/phpmyadmin`

### Qua Laravel Tinker:

```bash
cd api
php artisan tinker

# Trong tinker:
DB::table('users')->get();
```

## 📝 Database của dự án Banhmi

**Tên database:** `banhmi` (hoặc tên bạn đã đặt)

**Xem trong file:** `api/.env`
```env
DB_DATABASE=banhmi
DB_USERNAME=root
DB_PASSWORD=your_password
```

## 💾 Backup database local

### Cách 1: Qua mysqldump

```bash
# Backup
mysqldump -u root -p banhmi > backup.sql

# Restore
mysql -u root -p banhmi < backup.sql
```

### Cách 2: Copy thư mục data (không khuyến nghị)

```bash
# Dừng MySQL trước
# Copy thư mục database
cp -r /opt/homebrew/var/mysql/banhmi /backup/banhmi
```

## 🔍 Kiểm tra database có tồn tại không

```bash
mysql -u root -p -e "SHOW DATABASES;"
```

**Hoặc:**
```bash
mysql -u root -p
SHOW DATABASES;
USE banhmi;
SHOW TABLES;
```

## 📊 Xem thông tin database

### Xem kích thước database:

```sql
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'banhmi'
GROUP BY table_schema;
```

### Xem danh sách tables:

```sql
USE banhmi;
SHOW TABLES;
```

### Xem số lượng records:

```sql
SELECT 
    table_name AS 'Table',
    table_rows AS 'Rows'
FROM information_schema.tables
WHERE table_schema = 'banhmi';
```

## 🚀 Lệnh hữu ích

### Kết nối và xem database:

```bash
mysql -u root -p banhmi
```

### Export database:

```bash
mysqldump -u root -p banhmi > banhmi_backup.sql
```

### Import database:

```bash
mysql -u root -p banhmi < banhmi_backup.sql
```

### Xem tất cả databases:

```bash
mysql -u root -p -e "SHOW DATABASES;"
```

## ⚠️ Lưu ý

1. **Không nên chỉnh sửa trực tiếp** file trong thư mục data
2. **Luôn backup** trước khi thao tác
3. **Dừng MySQL** trước khi copy thư mục data
4. **Dùng mysqldump** để backup (an toàn hơn)

## 📍 Tóm tắt

**Database local lưu ở:**
- **macOS (Homebrew):** `/opt/homebrew/var/mysql/` hoặc `/usr/local/var/mysql/`
- **Linux:** `/var/lib/mysql/`
- **Windows:** `C:\ProgramData\MySQL\MySQL Server X.X\Data\`

**Cách tìm chính xác:**
```bash
mysql -u root -p -e "SHOW VARIABLES LIKE 'datadir';"
```

**Database của bạn:**
- Tên: `banhmi` (hoặc tên trong `.env`)
- Vị trí: Trong thư mục data của MySQL
- Truy cập: Qua MySQL command line hoặc phpMyAdmin


