Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  USER SERVICE DIAGNOSTIC" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if service is running
Write-Host "[1/5] Checking if User Service is running..." -ForegroundColor Yellow
$conn = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue
if ($conn) {
    $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
    Write-Host "  ✓ User Service is RUNNING (PID: $($proc.Id))" -ForegroundColor Green
    $serviceRunning = $true
} else {
    Write-Host "  ✗ User Service is NOT running" -ForegroundColor Red
    $serviceRunning = $false
}

# Test database connection
Write-Host "`n[2/5] Testing database connection..." -ForegroundColor Yellow
try {
    $result = & "C:\mysql\bin\mysql.exe" -u root -p1234 -e "SELECT COUNT(*) FROM b2b_marketplace.users;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Database connection successful" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Database connection failed" -ForegroundColor Red
    }
} catch {
    Write-Host "  ✗ Database connection error: $_" -ForegroundColor Red
}

# Verify email column exists
Write-Host "`n[3/5] Verifying email column in users table..." -ForegroundColor Yellow
$columns = & "C:\mysql\bin\mysql.exe" -u root -p1234 -e "USE b2b_marketplace; DESCRIBE users;" 2>$null | Select-String "email"
if ($columns) {
    Write-Host "  ✓ Email column exists" -ForegroundColor Green
    Write-Host "    $columns" -ForegroundColor Gray
} else {
    Write-Host "  ✗ Email column NOT found" -ForegroundColor Red
}

# Test API endpoint
if ($serviceRunning) {
    Write-Host "`n[4/5] Testing API endpoint..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8081/api/auth/login" `
            -Method POST `
            -ContentType "application/json" `
            -Body '{"email":"buyer1@example.com","password":"password"}' `
            -UseBasicParsing `
            -ErrorAction Stop
        Write-Host "  ✓ API responded with status $($response.StatusCode)" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "  ✗ API responded with error $statusCode" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $errorBody = $reader.ReadToEnd()
            Write-Host "    Error: $errorBody" -ForegroundColor Gray
        }
    }
}

# Check application.properties
Write-Host "`n[5/5] Checking application.properties..." -ForegroundColor Yellow
$propsFile = "backend\user-service\src\main\resources\application.properties"
if (Test-Path $propsFile) {
    $ddlAuto = Select-String -Path $propsFile -Pattern "spring.jpa.hibernate.ddl-auto" | Select-Object -First 1
    $datasourceUrl = Select-String -Path $propsFile -Pattern "spring.datasource.url" | Select-Object -First 1
    
    Write-Host "  ✓ Configuration file found" -ForegroundColor Green
    Write-Host "    $ddlAuto" -ForegroundColor Gray
    Write-Host "    $datasourceUrl" -ForegroundColor Gray
} else {
    Write-Host "  ✗ application.properties not found" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "RECOMMENDATION:" -ForegroundColor Yellow
Write-Host "The 'Unknown column email' error suggests Hibernate" -ForegroundColor White
Write-Host "created tables before your schema was loaded." -ForegroundColor White
Write-Host "`nSolution:" -ForegroundColor Yellow
Write-Host "1. Stop User Service completely" -ForegroundColor White
Write-Host "2. Drop and recreate the database:" -ForegroundColor White
Write-Host "   mysql -u root -p1234 -e 'DROP DATABASE b2b_marketplace; CREATE DATABASE b2b_marketplace;'" -ForegroundColor Cyan
Write-Host "3. Reload schema: Get-Content database\schema.sql | & 'C:\mysql\bin\mysql.exe' -u root -p1234 b2b_marketplace" -ForegroundColor Cyan
Write-Host "4. Reload data: Get-Content database\sample_data.sql | & 'C:\mysql\bin\mysql.exe' -u root -p1234 b2b_marketplace" -ForegroundColor Cyan
Write-Host "5. Start User Service fresh" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan
