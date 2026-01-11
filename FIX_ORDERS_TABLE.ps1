# Fix Orders Table Schema

$mysqlUser = "root"
$mysqlPassword = "root"
$mysqlDatabase = "b2b_marketplace"

Write-Host "Dropping and recreating orders table..." -ForegroundColor Yellow

$query = @"
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;

SET FOREIGN_KEY_CHECKS = 1;

-- Recreate will happen automatically when order-service starts
SELECT 'Tables dropped successfully' as result;
"@

$mysqlPath = "mysql"
if (Test-Path "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe") {
    $mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
}

try {
    & $mysqlPath -u $mysqlUser -p$mysqlPassword -D $mysqlDatabase -e $query
    
    Write-Host ""
    Write-Host "✓ Orders tables dropped successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now restart the order-service and it will create clean tables:" -ForegroundColor Yellow
    Write-Host "  cd backend\order-service" -ForegroundColor White
    Write-Host "  mvn spring-boot:run" -ForegroundColor White
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host ""
