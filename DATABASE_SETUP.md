# 🗄️ Database Setup Guide

## ⚠️ Lỗi: Can't reach database server at `localhost:1433`

### Bước 1: Kiểm tra SQL Server đang chạy

1. Mở **SQL Server Configuration Manager**
2. Kiểm tra **SQL Server Services** → **SQL Server (MSSQLSERVER)** phải là **Running**
3. Nếu không chạy, click **Start**

### Bước 2: Kiểm tra SQL Server Authentication

1. Mở **SQL Server Management Studio (SSMS)**
2. Connect với:
   - **Server name:** `localhost` hoặc `.\SQLEXPRESS`
   - **Authentication:** SQL Server Authentication
   - **Login:** `sa`
   - **Password:** (mật khẩu của bạn)

### Bước 3: Tạo Database

Chạy trong SSMS:

```sql
-- Tạo database
CREATE DATABASE LicenseDB;
GO

-- Kiểm tra database đã tạo
USE LicenseDB;
GO
SELECT name FROM sys.databases WHERE name = 'LicenseDB';
```

### Bước 4: Cập nhật .env file

Mở `D:\MSI\VEI\VEI\VeoProGen\license-system\.env` và sửa:

```env
# Nếu dùng SQL Server Express:
DATABASE_URL="sqlserver://localhost\\SQLEXPRESS:1433;database=LicenseDB;user=sa;password=YOUR_PASSWORD;encrypt=true;trustServerCertificate=true"

# Hoặc nếu dùng SQL Server Default Instance:
DATABASE_URL="sqlserver://localhost:1433;database=LicenseDB;user=sa;password=YOUR_PASSWORD;encrypt=true;trustServerCertificate=true"

# Hoặc nếu dùng Named Instance:
DATABASE_URL="sqlserver://localhost\\INSTANCE_NAME:1433;database=LicenseDB;user=sa;password=YOUR_PASSWORD;encrypt=true;trustServerCertificate=true"
```

**Lưu ý:**
- Thay `YOUR_PASSWORD` bằng mật khẩu SQL Server thực của bạn
- Nếu dùng Express, thêm `\\SQLEXPRESS` sau `localhost`
- Port mặc định là `1433`, nếu khác thì sửa

### Bước 5: Test Connection

```powershell
cd D:\MSI\VEI\VEI\VeoProGen\license-system
npx prisma db push --skip-generate
```

Nếu thành công, bạn sẽ thấy:
```
✔ Database LicenseDB created
✔ All migrations applied
```

### Bước 6: Seed Database (Tạo Admin)

```powershell
npx prisma db seed
```

Output:
```
✅ Created admin: admin@example.com
📧 Email: admin@example.com
🔑 Password: Admin@123456
```

### Bước 7: Restart Server

```powershell
# Stop server (Ctrl+C)
npm run dev
```

---

## 🔧 Troubleshooting

### Lỗi: "Login failed for user 'sa'"

**Giải pháp:**
1. Enable SQL Server Authentication:
   - Right-click server → Properties → Security
   - Chọn "SQL Server and Windows Authentication mode"
   - Restart SQL Server

2. Enable sa account:
   ```sql
   ALTER LOGIN sa ENABLE;
   ALTER LOGIN sa WITH PASSWORD = 'YourNewPassword';
   ```

### Lỗi: "Cannot connect to localhost"

**Giải pháp:**
1. Kiểm tra SQL Server Browser service đang chạy
2. Thử dùng `127.0.0.1` thay vì `localhost`
3. Kiểm tra firewall không block port 1433

### Lỗi: "Named Pipes Provider: Could not open a connection"

**Giải pháp:**
1. Enable Named Pipes trong SQL Server Configuration Manager
2. Enable TCP/IP protocol
3. Restart SQL Server

---

## ✅ Quick Test

Sau khi setup xong, test connection:

```powershell
# Test Prisma connection
npx prisma db execute --stdin
# Nhập: SELECT 1;
# Nếu trả về 1 thì OK!
```

---

## 📝 Alternative: Dùng SQLite (Development Only)

Nếu không muốn setup SQL Server ngay, có thể dùng SQLite tạm thời:

1. Sửa `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```

2. Chạy:
   ```powershell
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

**Lưu ý:** SQLite không hỗ trợ một số features, chỉ dùng cho development!

