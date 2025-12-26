# Email Service Startup Script
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Starting Email Service (8087)" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

$emailServicePath = "C:\b2b_sample\backend\email-service"

# Check if port 8087 is already in use
Write-Host "`nChecking port 8087..." -ForegroundColor Yellow
$existingProcess = Get-NetTCPConnection -LocalPort 8087 -ErrorAction SilentlyContinue
if ($existingProcess) {
    Write-Host "⚠️  Port 8087 is already in use!" -ForegroundColor Yellow
    Write-Host "Attempting to stop existing process..." -ForegroundColor Yellow
    
    $processes = Get-Process java -ErrorAction SilentlyContinue | Where-Object {
        (Get-NetTCPConnection -OwningProcess $_.Id -ErrorAction SilentlyContinue).LocalPort -eq 8087
    }
    
    if ($processes) {
        $processes | ForEach-Object {
            Write-Host "Stopping process $($_.Id)..." -ForegroundColor Yellow
            Stop-Process -Id $_.Id -Force
            Start-Sleep -Seconds 2
        }
    }
}

# Navigate to email-service directory
Set-Location $emailServicePath

Write-Host "`nStarting Email Service..." -ForegroundColor Green
Write-Host "This window will show the service logs." -ForegroundColor Gray
Write-Host "Keep this window open while using the application.`n" -ForegroundColor Gray

Write-Host "⚠️  IMPORTANT: Email Configuration" -ForegroundColor Yellow
Write-Host "The service uses Gmail SMTP by default." -ForegroundColor Gray
Write-Host "To send real emails, update application.properties with:" -ForegroundColor Gray
Write-Host "  - Your Gmail address" -ForegroundColor White
Write-Host "  - Gmail App Password (not regular password)" -ForegroundColor White
Write-Host "`nFor testing, emails will be logged but not sent if credentials are missing.`n" -ForegroundColor Gray

# Start the service
mvn spring-boot:run
