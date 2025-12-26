Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Starting Order Service" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if port 8083 is already in use
$port = 8083
$processOnPort = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($processOnPort) {
    Write-Host "⚠️  Port $port is already in use!" -ForegroundColor Yellow
    Write-Host "Process ID: $($processOnPort.OwningProcess)" -ForegroundColor Yellow
    
    $response = Read-Host "Do you want to stop the existing process? (Y/N)"
    if ($response -eq 'Y' -or $response -eq 'y') {
        Stop-Process -Id $processOnPort.OwningProcess -Force
        Write-Host "✅ Stopped process on port $port" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } else {
        Write-Host "❌ Cannot start service while port is in use" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Starting Order Service on port $port..." -ForegroundColor Yellow
Write-Host ""

# Navigate to order service directory
Set-Location -Path "c:\b2b_sample\backend\order-service"

Write-Host "📦 Service Details:" -ForegroundColor Cyan
Write-Host "   Name: Order Service" -ForegroundColor White
Write-Host "   Port: 8083" -ForegroundColor White
Write-Host "   Functions: Order Processing, Order Tracking" -ForegroundColor White
Write-Host ""

Write-Host "⏳ Starting Spring Boot application..." -ForegroundColor Yellow
Write-Host "   (This may take 30-60 seconds)" -ForegroundColor Gray
Write-Host ""

# Start the service
mvn spring-boot:run

# If Maven command exits, show message
Write-Host ""
Write-Host "Order Service has stopped." -ForegroundColor Yellow
