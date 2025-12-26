# Quick Product Service Restart Script

Write-Host "`n=== Product Service Restart ===" -ForegroundColor Cyan

# Step 1: Find and stop current Product Service
Write-Host "`nStep 1: Stopping current Product Service..." -ForegroundColor Yellow
$conn = Get-NetTCPConnection -LocalPort 8082 -ErrorAction SilentlyContinue
if ($conn) {
    $pids = $conn.OwningProcess | Select-Object -Unique
    foreach ($pid in $pids) {
        if ($pid -gt 0) {
            try {
                $proc = Get-Process -Id $pid -ErrorAction Stop
                Write-Host "  Stopping $($proc.Name) (PID: $pid)" -ForegroundColor Gray
                Stop-Process -Id $pid -Force
            } catch {
                Write-Host "  PID $pid already stopped" -ForegroundColor Gray
            }
        }
    }
    Start-Sleep -Seconds 5
}

# Step 2: Verify port is free
Write-Host "`nStep 2: Verifying port 8082 is free..." -ForegroundColor Yellow
$conn = Get-NetTCPConnection -LocalPort 8082 -ErrorAction SilentlyContinue
if ($conn) {
    Write-Host "  ✗ Port 8082 still in use - please close any Java windows manually" -ForegroundColor Red
    exit 1
} else {
    Write-Host "  ✓ Port 8082 is FREE" -ForegroundColor Green
}

# Step 3: Start updated Product Service
Write-Host "`nStep 3: Starting updated Product Service..." -ForegroundColor Yellow
Set-Location "c:\b2b_sample\backend\product-service"
Write-Host "  Starting Maven Spring Boot..." -ForegroundColor Gray
Write-Host "  This will take 30-40 seconds..." -ForegroundColor Gray
Write-Host "  Watch for 'Started ProductServiceApplication' message`n" -ForegroundColor Cyan

# Start the service in foreground so you can see logs
mvn spring-boot:run
