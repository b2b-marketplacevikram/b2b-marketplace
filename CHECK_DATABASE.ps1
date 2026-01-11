# Check what products are in the MySQL database

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Checking MySQL Database Products" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# MySQL connection details
$mysqlHost = "localhost"
$mysqlPort = "3306"
$mysqlUser = "root"
$mysqlPassword = "root"
$mysqlDatabase = "b2b_marketplace"

Write-Host "Connecting to MySQL database..." -ForegroundColor Yellow

# Check if mysql is available
$mysqlPath = "mysql"
if (Test-Path "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe") {
    $mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
}

# Query to check products
$query = @"
SELECT id, name, category_id, unit_price, moq, stock_quantity, supplier_id, is_active 
FROM products 
ORDER BY id 
LIMIT 10;
"@

Write-Host ""
Write-Host "Running query to fetch products..." -ForegroundColor Yellow
Write-Host ""

try {
    & $mysqlPath -h $mysqlHost -P $mysqlPort -u $mysqlUser -p$mysqlPassword -D $mysqlDatabase -e $query
    
    Write-Host ""
    Write-Host "----------------------------------------" -ForegroundColor Cyan
    Write-Host "Products by Category:" -ForegroundColor Yellow
    
    $categoryQuery = "SELECT category_id, COUNT(*) as count FROM products GROUP BY category_id;"
    & $mysqlPath -h $mysqlHost -P $mysqlPort -u $mysqlUser -p$mysqlPassword -D $mysqlDatabase -e $categoryQuery
    
    Write-Host ""
    Write-Host "----------------------------------------" -ForegroundColor Cyan
    Write-Host "Active vs Inactive Products:" -ForegroundColor Yellow
    
    $statusQuery = "SELECT is_active, COUNT(*) as count FROM products GROUP BY is_active;"
    & $mysqlPath -h $mysqlHost -P $mysqlPort -u $mysqlUser -p$mysqlPassword -D $mysqlDatabase -e $statusQuery
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Test the Product Service API directly" -ForegroundColor Yellow
    Write-Host "Run this in your browser:" -ForegroundColor Cyan
    Write-Host "  http://localhost:8082/api/products" -ForegroundColor White
    Write-Host "  http://localhost:8082/api/products/category/9" -ForegroundColor White
}

Write-Host ""
