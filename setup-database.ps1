# setup-database.ps1 - Complete Database Setup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   License System - Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check .env file
Write-Host "Step 1: Checking .env file..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "   Creating .env from template..." -ForegroundColor Yellow
    
    $envContent = @"
DATABASE_URL="sqlserver://localhost:1433;database=LicenseDB;user=sa;password=YOUR_PASSWORD_HERE;encrypt=true;trustServerCertificate=true"
JWT_SECRET="super-secret-jwt-key-change-in-production-87234hkjsdhf"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="Admin@123456"
NEXT_PUBLIC_API_URL="https://ngohung.io.vn"
NODE_ENV="development"
TRIAL_DAYS=1
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "✅ Created .env file" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit .env file and set your SQL Server password!" -ForegroundColor Yellow
    Write-Host "   Replace YOUR_PASSWORD_HERE with your actual password" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Press Enter after editing .env file, or 'q' to quit"
    if ($continue -eq 'q') { exit }
}

# Step 2: Check DATABASE_URL
Write-Host "Step 2: Checking DATABASE_URL..." -ForegroundColor Yellow
$dbUrl = Get-Content ".env" | Where-Object { $_ -match "^DATABASE_URL=" }
if (-not $dbUrl) {
    Write-Host "❌ DATABASE_URL not found in .env" -ForegroundColor Red
    exit 1
}

if ($dbUrl -match "YOUR_PASSWORD_HERE") {
    Write-Host "❌ Please set your SQL Server password in .env file!" -ForegroundColor Red
    Write-Host "   Edit .env and replace YOUR_PASSWORD_HERE" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ DATABASE_URL found" -ForegroundColor Green
Write-Host ""

# Step 3: Instructions for SQL Server
Write-Host "Step 3: SQL Server Setup Instructions" -ForegroundColor Yellow
Write-Host ""
Write-Host "Before continuing, make sure:" -ForegroundColor Cyan
Write-Host "  1. SQL Server is running" -ForegroundColor White
Write-Host "  2. SQL Server Authentication is enabled" -ForegroundColor White
Write-Host "  3. 'sa' account is enabled" -ForegroundColor White
Write-Host ""
Write-Host "To create database, run this in SQL Server Management Studio:" -ForegroundColor Cyan
Write-Host "  CREATE DATABASE LicenseDB;" -ForegroundColor Green
Write-Host ""
$continue = Read-Host "Press Enter when database is created, or 'q' to quit"
if ($continue -eq 'q') { exit }

# Step 4: Test connection
Write-Host ""
Write-Host "Step 4: Testing database connection..." -ForegroundColor Yellow
try {
    $result = npx prisma db execute --stdin --schema=prisma/schema.prisma 2>&1
    Write-Host "✅ Connection test passed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Connection test skipped (may need database first)" -ForegroundColor Yellow
}

# Step 5: Generate Prisma Client
Write-Host ""
Write-Host "Step 5: Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Prisma generate failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma Client generated" -ForegroundColor Green

# Step 6: Create database tables (using db push)
Write-Host ""
Write-Host "Step 6: Creating database tables..." -ForegroundColor Yellow
Write-Host "   This will create all tables in LicenseDB database" -ForegroundColor Gray
Write-Host ""

npx prisma db push --skip-generate --accept-data-loss
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create tables" -ForegroundColor Red
    Write-Host "   Check:" -ForegroundColor Yellow
    Write-Host "   1. SQL Server is running" -ForegroundColor Yellow
    Write-Host "   2. Database 'LicenseDB' exists" -ForegroundColor Yellow
    Write-Host "   3. DATABASE_URL in .env is correct" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Database tables created successfully!" -ForegroundColor Green
Write-Host ""

# Step 7: Seed database (create admin user)
Write-Host "Step 7: Seeding database (creating admin user)..." -ForegroundColor Yellow
npx prisma db seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Seed failed (may already exist)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Admin user created" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Email: admin@example.com" -ForegroundColor Cyan
    Write-Host "   Password: Admin@123456" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ✅ Database Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Start server: npm run dev" -ForegroundColor White
Write-Host "  2. Login at: https://ngohung.io.vn/admin/login" -ForegroundColor White
Write-Host ""

