# Add a product image to the database

# MySQL connection details
$mysqlUser = "root"
$mysqlPassword = "root"
$mysqlDatabase = "b2b_marketplace"

Write-Host "Adding product image to database..." -ForegroundColor Yellow

# SQL to insert a product image
$query = @"
INSERT INTO product_images (product_id, image_url, is_primary, display_order, created_at) 
VALUES (1, 'https://via.placeholder.com/400x400/4A90E2/ffffff?text=JKNTV', 1, 1, NOW());

SELECT * FROM product_images WHERE product_id = 1;
"@

# Check if mysql is available
$mysqlPath = "mysql"
if (Test-Path "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe") {
    $mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
}

try {
    & $mysqlPath -u $mysqlUser -p$mysqlPassword -D $mysqlDatabase -e $query
    
    Write-Host ""
    Write-Host "✓ Product image added successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now restart the search-service to re-index the product with images:" -ForegroundColor Yellow
    Write-Host "  cd backend\search-service" -ForegroundColor White
    Write-Host "  mvn spring-boot:run" -ForegroundColor White
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host ""
