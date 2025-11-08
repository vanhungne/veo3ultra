@echo off
echo ========================================
echo   License System - Quick Setup
echo ========================================
echo.

REM Create .env file
echo Creating .env file...
(
echo # Database ^(SQL Server^) - EDIT THIS!
echo DATABASE_URL="sqlserver://localhost:1433;database=LicenseDB;user=sa;password=YOUR_PASSWORD_HERE;encrypt=true;trustServerCertificate=true"
echo.
echo # JWT Secret
echo JWT_SECRET="super-secret-jwt-key-change-in-production-87234hkjsdhf"
echo.
echo # Admin Setup
echo ADMIN_EMAIL="admin@example.com"
echo ADMIN_PASSWORD="Admin@123456"
echo.
echo # App Settings
echo NEXT_PUBLIC_API_URL="https://ngohung.io.vn"
echo NODE_ENV="development"
echo.
echo # Trial Settings
echo TRIAL_DAYS=1
echo MAX_TRIALS_PER_DEVICE=1
) > .env

echo ✓ Created .env file
echo.
echo ========================================
echo   IMPORTANT: Edit .env file now!
echo ========================================
echo.
echo 1. Open .env in notepad
echo 2. Replace YOUR_PASSWORD_HERE with your SQL Server password
echo 3. Save the file
echo.
pause

echo.
echo Running Prisma commands...
echo.

call npx prisma generate
if errorlevel 1 (
    echo ✗ Prisma generate failed
    pause
    exit /b 1
)

call npx prisma db push --skip-generate
if errorlevel 1 (
    echo ✗ Database push failed
    echo Make sure SQL Server is running and credentials are correct
    pause
    exit /b 1
)

call npx prisma db seed
if errorlevel 1 (
    echo ✗ Seed failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✓ Setup Complete!
echo ========================================
echo.
echo Admin credentials:
echo   Email: admin@example.com
echo   Password: Admin@123456
echo.
echo To start the server, run:
echo   npm run dev
echo.
pause

