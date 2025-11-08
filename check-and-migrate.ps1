# check-and-migrate.ps1 - Check connection and run migration
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Database Connection & Migration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Read .env
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content .env
$dbUrl = $envContent | Where-Object { $_ -match "^DATABASE_URL=" }

if (-not $dbUrl) {
    Write-Host "❌ DATABASE_URL not found in .env" -ForegroundColor Red
    exit 1
}

$dbUrl = $dbUrl -replace "DATABASE_URL=", "" -replace '"', ""

Write-Host "📋 Database URL:" -ForegroundColor Yellow
Write-Host "   $dbUrl" -ForegroundColor Gray
Write-Host ""

# Extract connection info (simple parsing)
$dbUrl = $dbUrl -replace 'sqlserver://', ''
$parts = $dbUrl -split ';'
$server = ""
$port = "1433"
$database = ""
$user = ""
$password = ""

foreach ($part in $parts) {
    if ($part -like '*:*') {
        $serverPort = $part -split ':'
        $server = $serverPort[0]
        if ($serverPort.Length -gt 1) {
            $port = ($serverPort[1] -split ';')[0]
        }
    } elseif ($part -like 'database=*') {
        $database = $part -replace 'database=', ''
    } elseif ($part -like 'user=*') {
        $user = $part -replace 'user=', ''
    } elseif ($part -like 'password=*') {
        $password = $part -replace 'password=', ''
    }
}

if ($server -and $database -and $user -and $password) {
    
    Write-Host "🔍 Connection Details:" -ForegroundColor Yellow
    Write-Host "   Server: $server" -ForegroundColor Gray
    Write-Host "   Port: $port" -ForegroundColor Gray
    Write-Host "   Database: $database" -ForegroundColor Gray
    Write-Host "   User: $user" -ForegroundColor Gray
    Write-Host ""
    
    # Test port
    Write-Host "🔌 Testing SQL Server port $port..." -ForegroundColor Yellow
    try {
        $test = Test-NetConnection -ComputerName $server -Port $port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        if ($test.TcpTestSucceeded) {
            Write-Host "✅ Port $port is open" -ForegroundColor Green
        } else {
            Write-Host "❌ Cannot connect to $server`:$port" -ForegroundColor Red
            Write-Host ""
            Write-Host "⚠️  Possible issues:" -ForegroundColor Yellow
            Write-Host "   1. SQL Server is not running" -ForegroundColor White
            Write-Host "   2. Port $port is blocked by firewall" -ForegroundColor White
            Write-Host "   3. SQL Server is using different port" -ForegroundColor White
            Write-Host ""
            Write-Host "💡 Solutions:" -ForegroundColor Cyan
            Write-Host "   - Check SQL Server Configuration Manager" -ForegroundColor White
            Write-Host "   - Make sure SQL Server service is Running" -ForegroundColor White
            Write-Host "   - If using SQL Express, try: localhost\\SQLEXPRESS" -ForegroundColor White
            exit 1
        }
    } catch {
        Write-Host "⚠️  Could not test port (may need admin rights)" -ForegroundColor Yellow
        Write-Host "   Continuing anyway..." -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "🔌 Testing Prisma connection..." -ForegroundColor Yellow
    
    # Try to connect
    $testQuery = "SELECT 1 as test"
    try {
        $result = echo $testQuery | npx prisma db execute --stdin 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database connection successful!" -ForegroundColor Green
        } else {
            Write-Host "❌ Database connection failed" -ForegroundColor Red
            Write-Host "   Error output: $result" -ForegroundColor Red
            Write-Host ""
            Write-Host "💡 Make sure:" -ForegroundColor Yellow
            Write-Host "   1. Database '$database' exists" -ForegroundColor White
            Write-Host "   2. User '$user' has access" -ForegroundColor White
            Write-Host "   3. Password is correct" -ForegroundColor White
            Write-Host ""
            Write-Host "   To create database, run in SSMS:" -ForegroundColor Cyan
            Write-Host "   CREATE DATABASE $database;" -ForegroundColor Green
            exit 1
        }
    } catch {
        Write-Host "⚠️  Connection test skipped" -ForegroundColor Yellow
    }
    
} else {
    Write-Host "❌ Invalid DATABASE_URL format" -ForegroundColor Red
    Write-Host "   Expected: sqlserver://server:port;database=name;user=user;password=pass" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Running Migration..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Generate Prisma Client
Write-Host "Step 1: Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prisma Client generated" -ForegroundColor Green
} else {
    Write-Host "⚠️  Prisma generate had issues (may be locked by dev server)" -ForegroundColor Yellow
    Write-Host "   Continuing with migration..." -ForegroundColor Gray
}

Write-Host ""

# Push schema to database
Write-Host "Step 2: Creating database tables..." -ForegroundColor Yellow
Write-Host "   This will create all tables in '$database' database" -ForegroundColor Gray
Write-Host ""

npx prisma db push --skip-generate --accept-data-loss
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Migration failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Common issues:" -ForegroundColor Yellow
    Write-Host "   1. Database '$database' does not exist" -ForegroundColor White
    Write-Host "      Solution: CREATE DATABASE $database; in SSMS" -ForegroundColor Green
    Write-Host ""
    Write-Host "   2. SQL Server Authentication not enabled" -ForegroundColor White
    Write-Host "      Solution: Enable in SQL Server Properties > Security" -ForegroundColor Green
    Write-Host ""
    Write-Host "   3. 'sa' account disabled" -ForegroundColor White
    Write-Host "      Solution: ALTER LOGIN sa ENABLE; in SSMS" -ForegroundColor Green
    Write-Host ""
    Write-Host "   4. Wrong password" -ForegroundColor White
    Write-Host "      Solution: Check password in .env file" -ForegroundColor Green
    exit 1
}

Write-Host ""
Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
Write-Host ""

# Seed database
Write-Host "Step 3: Seeding database (creating admin user)..." -ForegroundColor Yellow
npx prisma db seed
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Admin user created" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Email: admin@example.com" -ForegroundColor Cyan
    Write-Host "   Password: Admin@123456" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Seed may have failed (admin might already exist)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ✅ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Start server: npm run dev" -ForegroundColor White
Write-Host "  2. Login at: https://ngohung.io.vn/admin/login" -ForegroundColor White
Write-Host ""

