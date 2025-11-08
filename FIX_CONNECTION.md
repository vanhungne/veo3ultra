# 🔧 Fix Database Connection

## ❌ Lỗi hiện tại:
```
Can't reach database server at `localhost:1433`
```

## ✅ Các bước fix:

### Bước 1: Kiểm tra SQL Server đang chạy

1. Mở **SQL Server Configuration Manager**
2. Vào **SQL Server Services**
3. Kiểm tra **SQL Server (MSSQLSERVER)** → Phải là **Running**
4. Nếu không chạy → Click **Start**

### Bước 2: Tạo Database

Mở **SQL Server Management Studio (SSMS)** và chạy:

```sql
CREATE DATABASE LicenseDB;
GO
```

### Bước 3: Kiểm tra .env file

File: `D:\MSI\VEI\VEI\VeoProGen\license-system\.env`

**Nếu dùng SQL Server Default:**
```
DATABASE_URL=sqlserver://localhost:1433;database=LicenseDB;user=sa;password=YOUR_REAL_PASSWORD;encrypt=true;trustServerCertificate=true
```

**Nếu dùng SQL Server Express:**
```
DATABASE_URL=sqlserver://localhost\SQLEXPRESS:1433;database=LicenseDB;user=sa;password=YOUR_REAL_PASSWORD;encrypt=true;trustServerCertificate=true
```

**⚠️ QUAN TRỌNG:** Thay `YOUR_REAL_PASSWORD` bằng mật khẩu SQL Server thực của bạn!

### Bước 4: Test Connection

```powershell
cd D:\MSI\VEI\VEI\VeoProGen\license-system
.\test-connection.ps1
```

### Bước 5: Chạy Migration (sau khi connection OK)

```powershell
# Tạo tables
npx prisma db push --skip-generate --accept-data-loss

# Tạo admin user
npx prisma db seed
```

---

## 🔍 Kiểm tra nhanh:

### Check SQL Server Service:
```powershell
Get-Service | Where-Object {$_.Name -like "*SQL*"}
```

### Check Port 1433:
```powershell
Test-NetConnection -ComputerName localhost -Port 1433
```

### Test với Prisma:
```powershell
npx prisma db execute --stdin
# Nhập: SELECT 1;
# Nếu trả về 1 thì OK!
```

---

## 💡 Common Issues:

### 1. SQL Server không chạy
→ Start service trong SQL Server Configuration Manager

### 2. Port 1433 bị block
→ Check firewall hoặc dùng port khác

### 3. Database chưa tạo
→ Chạy: `CREATE DATABASE LicenseDB;` trong SSMS

### 4. Password sai
→ Check lại password trong .env file

### 5. SQL Server Authentication chưa enable
→ Right-click server → Properties → Security → Enable "SQL Server and Windows Authentication mode"

---

## ✅ Sau khi fix xong:

```powershell
# 1. Test connection
npx prisma db execute --stdin

# 2. Create tables
npx prisma db push --skip-generate --accept-data-loss

# 3. Create admin
npx prisma db seed

# 4. Start server
npm run dev
```

---

**Cần help?** Check file `DATABASE_SETUP.md` để xem hướng dẫn chi tiết hơn!

