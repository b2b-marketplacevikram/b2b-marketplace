Write-Host "Fixing Orders Table Schema..." -ForegroundColor Cyan

# MySQL connection
$mysql = "mysql -u root -proot b2b_marketplace"

Write-Host "`n1. Dropping existing orders tables..." -ForegroundColor Yellow

# Drop tables with foreign key constraints disabled
$sql = @"
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
SET FOREIGN_KEY_CHECKS = 1;
"@

$sql | & mysql -u root -proot b2b_marketplace

Write-Host "✓ Dropped old tables" -ForegroundColor Green

Write-Host "`n2. Tables dropped. Now restart order-service to recreate them with correct schema." -ForegroundColor Cyan
Write-Host "`nSteps:" -ForegroundColor Yellow
Write-Host "  1. Stop order-service (Ctrl+C in its terminal)" -ForegroundColor Gray
Write-Host "  2. Run: cd backend\order-service" -ForegroundColor Gray
Write-Host "  3. Run: mvn spring-boot:run" -ForegroundColor Gray
Write-Host "  4. Hibernate will auto-create tables with correct schema" -ForegroundColor Gray
Write-Host "`nAfter restart, tables will be created correctly!" -ForegroundColor Green
