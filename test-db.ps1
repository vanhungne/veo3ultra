# test-db.ps1 - Test Database Connection
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Database Connection Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Load .env file
$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "   Please create .env file first" -ForegroundColor Yellow
    exit 1
}

# Read DATABASE_URL
$dbUrl = Get-Content $envFile | Where-Object { $_ -match "^DATABASE_URL=" }
if (-not $dbUrl) {
    Write-Host "❌ DATABASE_URL not found in .env" -ForegroundColor Red
    exit 1
}

$dbUrl = $dbUrl -replace "DATABASE_URL=", "" -replace '"', ""

Write-Host "📋 Database URL:" -ForegroundColor Yellow
Write-Host "   $dbUrl" -ForegroundColor Gray
Write-Host ""

# Extract connection info
if ($dbUrl -match "sqlserver://([^:]+):(\d+);database=([^;]+);user=([^;]+);password=([^;]+)") {
    $server = $matches[1]
    $port = $matches[2]
    $database = $matches[3]
    $user = $matches[4]
    $password = $matches[5]
    
    Write-Host "🔍 Connection Details:" -ForegroundColor Yellow
    Write-Host "   Server: $server" -ForegroundColor Gray
    Write-Host "   Port: $port" -ForegroundColor Gray
    Write-Host "   Database: $database" -ForegroundColor Gray
    Write-Host "   User: $user" -ForegroundColor Gray
    Write-Host ""
    
    # Test SQL Server connection
    Write-Host "🔌 Testing SQL Server connection..." -ForegroundColor Yellow
    
    try {
        # Try to connect using Test-NetConnection
        $test = Test-NetConnection -ComputerName $server -Port $port -WarningAction SilentlyContinue
        
        if ($test.TcpTestSucceeded) {
            Write-Host "✅ Port $port is open" -ForegroundColor Green
        } else {
            Write-Host "❌ Cannot connect to $server`:$port" -ForegroundColor Red
            Write-Host "   Make sure SQL Server is running" -ForegroundColor Yellow
            exit 1
        }
    } catch {
        Write-Host "⚠️  Could not test port (may need admin rights)" -ForegroundColor Yellow
    }
    
    # Test with Prisma
    Write-Host ""
    Write-Host "🔌 Testing Prisma connection..." -ForegroundColor Yellow
    
    try {
        $result = npx prisma db execute --stdin 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Prisma connection successful!" -ForegroundColor Green
        } else {
            Write-Host "❌ Prisma connection failed" -ForegroundColor Red
            Write-Host "   Error: $result" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "❌ Prisma test failed: $_" -ForegroundColor Red
        exit 1
    }
    
} else {
    Write-Host "❌ Invalid DATABASE_URL format" -ForegroundColor Red
    Write-Host "   Expected: sqlserver://server:port;database=name;user=user;password=pass" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ✅ All tests passed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "   1. Run: npx prisma db push" -ForegroundColor Gray
Write-Host "   2. Run: npx prisma db seed" -ForegroundColor Gray
Write-Host "   3. Start server: npm run dev" -ForegroundColor Gray

