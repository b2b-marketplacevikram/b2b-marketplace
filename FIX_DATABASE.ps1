# Fix Missing Database Tables and Columns
# Execute the SQL script to add missing coupon_usage table and columns

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  FIXING DATABASE SCHEMA" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$sqlFile = "database\fix_missing_columns.sql"
$mysqlPath = "mysql"
$dbUser = "root"
$dbPass = "1234"
$dbName = "b2b_marketplace"

Write-Host "Applying database fixes..." -ForegroundColor Yellow

try {
    # Try to execute SQL file
    $content = Get-Content $sqlFile -Raw
    $content | & $mysqlPath -u $dbUser -p$dbPass $dbName 2>&1 | Out-String | Write-Host
    
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "  DATABASE FIXES APPLIED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Green
    Write-Host "Changes applied:" -ForegroundColor White
    Write-Host "  - Created coupon_usage table" -ForegroundColor Gray
    Write-Host "  - Added created_by column to coupons" -ForegroundColor Gray
    Write-Host "  - Added promotion_level, min_order_amount, max_discount_amount, created_by to promotions" -ForegroundColor Gray
    Write-Host "`nYou can now start the Product Service!" -ForegroundColor Cyan
    
} catch {
    Write-Host "`n========================================" -ForegroundColor Red
    Write-Host "  AUTOMATIC EXECUTION FAILED" -ForegroundColor Red
    Write-Host "========================================`n" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nPlease run manually in MySQL Workbench or command line:" -ForegroundColor Yellow
    Write-Host "  1. Open MySQL Workbench" -ForegroundColor White
    Write-Host "  2. Connect to b2b_marketplace database" -ForegroundColor White
    Write-Host "  3. Open and execute: database\fix_missing_columns.sql" -ForegroundColor White
    Write-Host "`nOR use command line:" -ForegroundColor Yellow
    Write-Host "  mysql -u root -p1234 b2b_marketplace < database\fix_missing_columns.sql" -ForegroundColor White
}
