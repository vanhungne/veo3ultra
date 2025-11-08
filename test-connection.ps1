# Test SQL Server Connection
Write-Host "Testing SQL Server Connection..." -ForegroundColor Cyan
Write-Host ""

# Test port 1433
Write-Host "1. Testing port 1433..." -ForegroundColor Yellow
$test = Test-NetConnection -ComputerName localhost -Port 1433 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue

if ($test.TcpTestSucceeded) {
    Write-Host "   ✅ Port 1433 is OPEN" -ForegroundColor Green
} else {
    Write-Host "   ❌ Port 1433 is CLOSED or SQL Server not running" -ForegroundColor Red
    Write-Host ""
    Write-Host "   💡 Solutions:" -ForegroundColor Yellow
    Write-Host "      - Check SQL Server Configuration Manager" -ForegroundColor White
    Write-Host "      - Make sure SQL Server service is Running" -ForegroundColor White
    Write-Host "      - If using SQL Express, try: localhost\SQLEXPRESS" -ForegroundColor White
}

Write-Host ""
Write-Host "2. Testing Prisma connection..." -ForegroundColor Yellow
$env:PRISMA_SKIP_POSTINSTALL_GENERATE = "true"
npx prisma db execute --stdin 2>&1 | Out-String

Write-Host ""
Write-Host "3. If connection fails, check:" -ForegroundColor Yellow
Write-Host "   - SQL Server is running (SQL Server Configuration Manager)" -ForegroundColor White
Write-Host "   - Database 'LicenseDB' exists (CREATE DATABASE LicenseDB;)" -ForegroundColor White
Write-Host "   - Password in .env is correct" -ForegroundColor White
Write-Host "   - SQL Server Authentication is enabled" -ForegroundColor White

