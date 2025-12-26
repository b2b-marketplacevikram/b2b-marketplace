# Search Service Startup Script
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Starting Search Service (8086)" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

$searchServicePath = "C:\b2b_sample\backend\search-service"

# Check if Elasticsearch is running
Write-Host "`nChecking Elasticsearch..." -ForegroundColor Yellow
try {
    $esResponse = Invoke-RestMethod -Uri "http://localhost:9200" -TimeoutSec 3
    Write-Host "✅ Elasticsearch is running (version $($esResponse.version.number))" -ForegroundColor Green
} catch {
    Write-Host "❌ Elasticsearch is not running!" -ForegroundColor Red
    Write-Host "`nPlease start Elasticsearch first:" -ForegroundColor Yellow
    Write-Host "  .\SETUP_ELASTICSEARCH.ps1" -ForegroundColor White
    Write-Host "`nOr manually start it from:" -ForegroundColor Yellow
    Write-Host "  C:\elasticsearch\elasticsearch-8.11.1\bin\elasticsearch.bat" -ForegroundColor White
    exit 1
}

# Check if port 8086 is already in use
Write-Host "`nChecking port 8086..." -ForegroundColor Yellow
$existingProcess = Get-NetTCPConnection -LocalPort 8086 -ErrorAction SilentlyContinue
if ($existingProcess) {
    Write-Host "⚠️  Port 8086 is already in use!" -ForegroundColor Yellow
    Write-Host "Attempting to stop existing process..." -ForegroundColor Yellow
    
    $processes = Get-Process java -ErrorAction SilentlyContinue | Where-Object {
        (Get-NetTCPConnection -OwningProcess $_.Id -ErrorAction SilentlyContinue).LocalPort -eq 8086
    }
    
    if ($processes) {
        $processes | ForEach-Object {
            Write-Host "Stopping process $($_.Id)..." -ForegroundColor Yellow
            Stop-Process -Id $_.Id -Force
            Start-Sleep -Seconds 2
        }
    }
}

# Navigate to search-service directory
Set-Location $searchServicePath

Write-Host "`nStarting Search Service..." -ForegroundColor Green
Write-Host "This window will show the service logs." -ForegroundColor Gray
Write-Host "Keep this window open while using the application.`n" -ForegroundColor Gray

# Start the service
mvn spring-boot:run
