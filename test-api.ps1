# test-api.ps1 - Quick API Test Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   License System - API Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://ngohung.io.vn"

# Test 1: Health Check
Write-Host "Test 1: Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get
    Write-Host "✓ Health check passed" -ForegroundColor Green
    Write-Host "  Status: $($response.status)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Health check failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Request Trial (First Time)
Write-Host "Test 2: Request Trial..." -ForegroundColor Yellow
$testDeviceId = "TEST-DEVICE-$(Get-Random)"
$body = @{
    deviceId = $testDeviceId
    toolType = "veo"
    hostname = $env:COMPUTERNAME
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/license/check" -Method Post -Body $body -ContentType "application/json"
    if ($response.success) {
        Write-Host "✓ Trial granted successfully" -ForegroundColor Green
        Write-Host "  Type: $($response.license.type)" -ForegroundColor Gray
        Write-Host "  Days: $($response.license.daysRemaining)" -ForegroundColor Gray
    } else {
        Write-Host "✗ Trial request failed: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Request failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Request Trial Again (Should Fail)
Write-Host "Test 3: Request Trial Again (Should Fail)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/license/check" -Method Post -Body $body -ContentType "application/json"
    if ($response.success) {
        Write-Host "✗ Trial granted again (SHOULD NOT HAPPEN!)" -ForegroundColor Red
    } else {
        Write-Host "✓ Trial correctly denied" -ForegroundColor Green
        Write-Host "  Error: $($response.error)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Request failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Admin Login
Write-Host "Test 4: Admin Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@example.com"
    password = "Admin@123456"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/admin/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    if ($response.success) {
        Write-Host "✓ Admin login successful" -ForegroundColor Green
        $token = $response.token
        Write-Host "  Admin: $($response.admin.name)" -ForegroundColor Gray
        Write-Host "  Role: $($response.admin.role)" -ForegroundColor Gray
        
        # Test 5: Create License
        Write-Host ""
        Write-Host "Test 5: Create License..." -ForegroundColor Yellow
        $createBody = @{
            deviceId = "PROD-DEVICE-001"
            toolType = "veo"
            owner = "John Doe"
            type = "YEARLY"
        } | ConvertTo-Json
        
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        try {
            $licResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/license/create" -Method Post -Body $createBody -Headers $headers
            if ($licResponse.success) {
                Write-Host "✓ License created successfully" -ForegroundColor Green
                Write-Host "  Key: $($licResponse.license.licenseKey.Substring(0, 50))..." -ForegroundColor Gray
                Write-Host "  Type: $($licResponse.license.type)" -ForegroundColor Gray
                Write-Host "  Days: $($licResponse.license.daysRemaining)" -ForegroundColor Gray
            } else {
                Write-Host "✗ License creation failed: $($licResponse.error)" -ForegroundColor Red
            }
        } catch {
            Write-Host "✗ License creation failed: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "✗ Admin login failed: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Admin login failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Tests Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

