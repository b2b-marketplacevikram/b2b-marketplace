# B2B Marketplace Frontend Startup Script
Write-Host "Starting B2B Marketplace Frontend..." -ForegroundColor Green
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if backend services are running
Write-Host "Checking backend services..." -ForegroundColor Cyan

$services = @(
    @{Name="User Service"; Port=8081; Url="http://localhost:8081/api/auth/health"},
    @{Name="Product Service"; Port=8082; Url="http://localhost:8082/api/products"},
    @{Name="Order Service"; Port=8083; Url="http://localhost:8083/api/orders/health"},
    @{Name="Payment Service"; Port=8084; Url="http://localhost:8084/api/payments/health"}
)

$allRunning = $true
foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.Url -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        Write-Host "✓ $($service.Name) is running on port $($service.Port)" -ForegroundColor Green
    } catch {
        Write-Host "✗ $($service.Name) is NOT running on port $($service.Port)" -ForegroundColor Red
        $allRunning = $false
    }
}

Write-Host ""

if (-not $allRunning) {
    Write-Host "WARNING: Some backend services are not running." -ForegroundColor Yellow
    Write-Host "The frontend will start, but some features may not work." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Starting Vite development server..." -ForegroundColor Green
Write-Host "Once started, open your browser to: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

npm run dev
