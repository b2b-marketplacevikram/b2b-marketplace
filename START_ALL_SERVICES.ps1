# B2B Marketplace - Start All Services
# Run this script to start the complete application

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host " B2B Marketplace Startup Script" -ForegroundColor Green  
Write-Host "================================`n" -ForegroundColor Cyan

# Add MySQL to PATH
$env:Path += ";C:\b2bmysql\bin"

# Check MySQL
Write-Host "Checking MySQL..." -ForegroundColor Yellow
$mysqlProcess = Get-Process mysqld -ErrorAction SilentlyContinue
if ($mysqlProcess) {
    Write-Host "✅ MySQL is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  Starting MySQL..." -ForegroundColor Yellow
    Start-Process -FilePath "C:\b2bmysql\bin\mysqld.exe" -WindowStyle Hidden
    Start-Sleep -Seconds 5
    Write-Host "✅ MySQL started" -ForegroundColor Green
}

# Check Solr (Search Engine)
Write-Host "Checking Solr..." -ForegroundColor Yellow
$solrRunning = $false
try {
    $solrResponse = Invoke-WebRequest -Uri "http://localhost:8983/solr/" -TimeoutSec 5 -ErrorAction Stop
    if ($solrResponse.StatusCode -eq 200) {
        $solrRunning = $true
        Write-Host "✅ Solr is running on port 8983" -ForegroundColor Green
    }
} catch {
    # Try alternative check
    $solrProcess = Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*solr*" -or $_.MainWindowTitle -like "*Solr*" }
    $netCheck = netstat -ano | Select-String ":8983.*LISTENING"
    if ($netCheck) {
        $solrRunning = $true
        Write-Host "✅ Solr is running on port 8983" -ForegroundColor Green
    }
}

if (-not $solrRunning) {
    Write-Host "⚠️  Solr is not running!" -ForegroundColor Red
    Write-Host "   Search functionality will not work without Solr." -ForegroundColor Yellow
    Write-Host "   Run: .\SETUP_SOLR.ps1" -ForegroundColor Cyan
    $response = Read-Host "`nContinue without Solr? (Y/N)"
    if ($response -ne 'Y' -and $response -ne 'y') {
        Write-Host "Exiting..." -ForegroundColor Red
        exit
    }
}

# Start Backend Services
Write-Host "`nStarting Backend Microservices..." -ForegroundColor Yellow
$services = @(
    @{Name="User Service"; Port=8081; Path="user-service"},
    @{Name="Product Service"; Port=8082; Path="product-service"},
    @{Name="Order Service"; Port=8083; Path="order-service"},
    @{Name="Payment Service"; Port=8084; Path="payment-service"},
    @{Name="Cart Service"; Port=8085; Path="cart-service"},
    @{Name="Search Service"; Port=8086; Path="search-service"},
    @{Name="Email Service"; Port=8087; Path="email-service"},
    @{Name="Notification Service"; Port=8088; Path="notification-service"},
    @{Name="Messaging Service"; Port=8089; Path="messaging-service"},
    @{Name="Admin Service"; Port=8090; Path="admin-service"}
)

foreach ($svc in $services) {
    Write-Host "  Starting $($svc.Name) on port $($svc.Port)..." -ForegroundColor Cyan
    Start-Job -ScriptBlock {
        param($path)
        Set-Location "c:\b2b_sample\backend\$path"
        mvn spring-boot:run -q
    } -ArgumentList $svc.Path -Name $svc.Name | Out-Null
}

Write-Host "`n✅ Backend services starting in background (60-90 seconds)" -ForegroundColor Green

# Start Frontend
Write-Host "`nStarting Frontend..." -ForegroundColor Yellow
Start-Job -ScriptBlock {
    Set-Location "c:\b2b_sample"
    npm run dev
} -Name "Frontend" | Out-Null
Start-Sleep -Seconds 5

Write-Host "✅ Frontend starting..." -ForegroundColor Green

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host " 🎉 APPLICATION STARTING! 🎉" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan

Write-Host "`n⏳ Please wait 60-90 seconds for services to fully start" -ForegroundColor Yellow
Write-Host "`n📱 Then open: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`n🔑 Login Credentials:" -ForegroundColor Yellow
Write-Host "   Buyer:    buyer1@example.com / password123" -ForegroundColor White
Write-Host "   Supplier: supplier1@example.com / password123" -ForegroundColor White

Write-Host "`n💡 To check status: Get-Job | Format-Table" -ForegroundColor Gray
Write-Host "💡 To stop all:   Get-Job | Stop-Job; Get-Job | Remove-Job" -ForegroundColor Gray

Write-Host "`nWaiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

Write-Host "`n✅ Services should be ready! Opening browser..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "`nPress Ctrl+C to exit this script (services will keep running)" -ForegroundColor Gray
Write-Host "To stop services: Get-Job | Stop-Job; Get-Job | Remove-Job`n" -ForegroundColor Gray
