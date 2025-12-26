# Admin Service Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Admin Service (Port 8088)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Set-Location "C:\b2b_sample\backend\admin-service"

Write-Host "`nChecking MySQL connection..." -ForegroundColor Yellow
try {
    $mysqlCheck = Get-Process mysqld -ErrorAction Stop
    Write-Host "✓ MySQL is running" -ForegroundColor Green
} catch {
    Write-Host "✗ MySQL is not running! Please start MySQL first." -ForegroundColor Red
    Write-Host "`nTo start MySQL, run:" -ForegroundColor Yellow
    Write-Host "Start-Process 'C:\b2bmysql\bin\mysqld.exe' -WindowStyle Hidden" -ForegroundColor White
    exit 1
}

Write-Host "`nStarting Admin Service..." -ForegroundColor Yellow
Write-Host "API will be available at: http://localhost:8088" -ForegroundColor Cyan
Write-Host "Health check: http://localhost:8088/api/admin/health" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop the service`n" -ForegroundColor Yellow

mvn spring-boot:run
