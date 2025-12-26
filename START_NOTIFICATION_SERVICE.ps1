# Start Notification Service
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Starting Notification Service" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$servicePath = "C:\b2b_sample\backend\notification-service"

# Check if directory exists
if (-not (Test-Path $servicePath)) {
    Write-Host "ERROR: Notification service directory not found at $servicePath" -ForegroundColor Red
    exit 1
}

Write-Host "Service Path: $servicePath" -ForegroundColor Yellow
Write-Host "Port: 8086" -ForegroundColor Yellow
Write-Host ""

# Change to service directory
Set-Location $servicePath

Write-Host "Building notification service..." -ForegroundColor Cyan
mvn clean install -DskipTests

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting notification service on port 8086..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the service" -ForegroundColor Yellow
Write-Host ""

# Start the service
mvn spring-boot:run
