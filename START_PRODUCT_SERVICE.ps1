# Quick Start Product Service
# This script starts ONLY the Product Service for testing

Write-Host "`n🚀 Starting Product Service on Port 8082..." -ForegroundColor Cyan

# Kill any existing process on 8082
$existingConn = Get-NetTCPConnection -LocalPort 8082 -ErrorAction SilentlyContinue
if ($existingConn -and $existingConn.OwningProcess -ne 0) {
    Write-Host "⚠️  Stopping existing service..." -ForegroundColor Yellow
    Stop-Process -Id $existingConn.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
}

# Set location
Set-Location "c:\b2b_sample\backend\product-service"

# Start the service
Write-Host "📦 Starting Maven Spring Boot..." -ForegroundColor Yellow
Write-Host "This will take 30-60 seconds..." -ForegroundColor Gray
Write-Host "`nWatch for 'Started ProductServiceApplication' message`n" -ForegroundColor Cyan

mvn spring-boot:run
