# 🚀 Quick Setup Guide

## ⚡ Setup Database trong 5 phút

### Bước 1: Tạo Database trong SQL Server

Mở **SQL Server Management Studio (SSMS)** và chạy:

```sql
CREATE DATABASE LicenseDB;
GO
```

### Bước 2: Sửa file .env

Mở file `D:\MSI\VEI\VEI\VeoProGen\license-system\.env`

Tìm dòng:
```
DATABASE_URL="sqlserver://localhost:1433;database=LicenseDB;user=sa;password=YOUR_PASSWORD_HERE;..."
```

**Thay `YOUR_PASSWORD_HERE` bằng mật khẩu SQL Server của bạn!**

**Lưu ý:**
- Nếu dùng SQL Server Express, thay `localhost` bằng `localhost\\SQLEXPRESS`
- Nếu port khác 1433, sửa port number

### Bước 3: Chạy Setup Script

```powershell
cd D:\MSI\VEI\VEI\VeoProGen\license-system
.\setup-database.ps1
```

Script sẽ tự động:
1. ✅ Kiểm tra .env file
2. ✅ Generate Prisma Client
3. ✅ Tạo tất cả tables trong database
4. ✅ Tạo admin user mặc định

### Bước 4: Start Server

```powershell
npm run dev
```

### Bước 5: Login

Truy cập: **https://ngohung.io.vn/admin/login**

**Credentials:**
- Email: `admin@example.com`
- Password: `Admin@123456`

---

## 🔧 Manual Setup (Nếu script không chạy)

### 1. Generate Prisma Client
```powershell
npx prisma generate
```

### 2. Create Tables (Migration)
```powershell
npx prisma db push --skip-generate
```

### 3. Seed Database (Create Admin)
```powershell
npx prisma db seed
```

---

## ✅ Verify Setup

Sau khi setup, kiểm tra:

```powershell
# Xem tables đã tạo
npx prisma studio
```

Hoặc trong SSMS:
```sql
USE LicenseDB;
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES;
```

Bạn sẽ thấy các tables:
- `admins`
- `devices`
- `licenses`
- `activity_logs`
- `rate_limits`

---

## 🐛 Troubleshooting

### Lỗi: "Can't reach database server"

**Giải pháp:**
1. Kiểm tra SQL Server đang chạy:
   - Mở **SQL Server Configuration Manager**
   - Xem **SQL Server Services** → Phải là **Running**

2. Kiểm tra connection string trong .env:
   - Server name đúng chưa?
   - Port đúng chưa? (mặc định 1433)
   - Password đúng chưa?

3. Test connection:
   ```powershell
   .\test-db.ps1
   ```

### Lỗi: "Login failed for user 'sa'"

**Giải pháp:**
1. Enable SQL Server Authentication:
   - Right-click server → Properties → Security
   - Chọn "SQL Server and Windows Authentication mode"
   - Restart SQL Server

2. Enable sa account:
   ```sql
   ALTER LOGIN sa ENABLE;
   ALTER LOGIN sa WITH PASSWORD = 'YourPassword';
   ```

### Lỗi: "Database LicenseDB does not exist"

**Giải pháp:**
Chạy trong SSMS:
```sql
CREATE DATABASE LicenseDB;
```

---

## 📊 Check Database

Sau khi setup xong, mở Prisma Studio để xem data:

```powershell
npx prisma studio
```

Mở browser: **http://localhost:5555**

---

## 🎉 Done!

Sau khi setup xong, bạn có thể:
- ✅ Login vào admin dashboard
- ✅ Tạo licenses
- ✅ Quản lý devices
- ✅ Xem activity logs

Happy coding! 🚀

