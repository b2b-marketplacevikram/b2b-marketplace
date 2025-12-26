# Cart Service Startup Script
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Starting Cart Service (8085)" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

$cartServicePath = "C:\b2b_sample\backend\cart-service"

# Check if port 8085 is already in use
$existingProcess = Get-NetTCPConnection -LocalPort 8085 -ErrorAction SilentlyContinue
if ($existingProcess) {
    Write-Host "`nPort 8085 is already in use!" -ForegroundColor Yellow
    Write-Host "Attempting to stop existing process..." -ForegroundColor Yellow
    
    $processes = Get-Process java -ErrorAction SilentlyContinue | Where-Object {
        (Get-NetTCPConnection -OwningProcess $_.Id -ErrorAction SilentlyContinue).LocalPort -eq 8085
    }
    
    if ($processes) {
        $processes | ForEach-Object {
            Write-Host "Stopping process $($_.Id)..." -ForegroundColor Yellow
            Stop-Process -Id $_.Id -Force
            Start-Sleep -Seconds 2
        }
    }
}

# Navigate to cart-service directory
Set-Location $cartServicePath

Write-Host "`nStarting Cart Service..." -ForegroundColor Green
Write-Host "This window will show the service logs." -ForegroundColor Gray
Write-Host "Keep this window open while using the application.`n" -ForegroundColor Gray

# Start the service
mvn spring-boot:run
