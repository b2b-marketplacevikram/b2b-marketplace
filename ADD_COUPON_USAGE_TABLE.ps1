# Add Coupon Usage Table to Database
# This script executes the coupon_promotion_schema.sql which includes the coupon_usage table

Write-Host "Adding coupon_usage table to database..." -ForegroundColor Cyan

try {
    # Execute the coupon promotion schema
    Get-Content "database\coupon_promotion_schema.sql" | mysql -u root -p1234 b2b_marketplace
    
    Write-Host "SUCCESS: coupon_usage table created!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to create table - $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nPlease run this SQL manually in MySQL:" -ForegroundColor Yellow
    Write-Host "mysql -u root -p1234 b2b_marketplace < database\coupon_promotion_schema.sql" -ForegroundColor White
}
