# 🔧 Manual Setup Guide

## ⚠️ You need to complete these steps manually:

### Step 1: Edit .env file

Open `D:\MSI\VEI\VEI\VeoProGen\license-system\.env` and change:

```
DATABASE_URL="sqlserver://localhost:1433;database=LicenseDB;user=sa;password=YourPassword123;..."
```

Replace `YourPassword123` with your actual SQL Server password.

### Step 2: Create SQL Server Database

Open SQL Server Management Studio (SSMS) and run:

```sql
CREATE DATABASE LicenseDB;
```

### Step 3: Run Prisma Commands

In PowerShell at `D:\MSI\VEI\VEI\VeoProGen\license-system`:

```powershell
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma db push --skip-generate

# Create default admin user
npx prisma db seed
```

### Step 4: Restart Dev Server

Stop the current server (Ctrl+C) and run:

```powershell
npm run dev
```

### Step 5: Access Application

- Home: https://ngohung.io.vn
- Admin Login: https://ngohung.io.vn/admin/login
  - Email: admin@example.com
  - Password: Admin@123456

---

## 🚀 Quick Commands

```powershell
# If you want to start fresh
Remove-Item .next, node_modules -Recurse -Force
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

---

## 🐛 Troubleshooting

### Error: Cannot connect to database
- Make sure SQL Server is running
- Check DATABASE_URL in .env file
- Test connection: `npx prisma db push`

### Error: Module not found
```powershell
Remove-Item node_modules -Recurse -Force
npm install
```

### Error: Prisma Client not generated
```powershell
npx prisma generate
```

---

## ✅ When Setup is Complete

You should see:

```
✓ Ready on https://ngohung.io.vn
```

Then you can:
1. Visit https://ngohung.io.vn/admin/login
2. Login with admin@example.com / Admin@123456
3. Create licenses
4. Test with Python app

---

Need help? Check README.md for full documentation.

