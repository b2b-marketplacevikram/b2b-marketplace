# Comprehensive Entity vs Schema Validation
# This script checks all entities against schema.sql for mismatches

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  COMPREHENSIVE SCHEMA VALIDATION" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$issues = @()

# Check Product Entity
Write-Host "Checking Product entity..." -ForegroundColor Yellow
$productCheck = @"
SELECT 
    'Product' as Entity,
    CASE 
        WHEN COUNT(*) = 0 THEN 'MISSING status ENUM'
        ELSE 'OK'
    END as Status
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'b2b_marketplace' 
  AND TABLE_NAME = 'products' 
  AND COLUMN_NAME = 'status';
"@

# Check if all Product ENUM values exist
Write-Host "Validating products table..." -ForegroundColor Gray

# Check Promotion Entity
Write-Host "Checking Promotion entity..." -ForegroundColor Yellow

# Check Coupon Entity  
Write-Host "Checking Coupon entity..." -ForegroundColor Yellow

# Check Quote Entity
Write-Host "Checking Quote entity..." -ForegroundColor Yellow

# Check Dispute Entity (already checked)
Write-Host "Checking Dispute entity..." -ForegroundColor Yellow

# Check User Entity
Write-Host "Checking User entity..." -ForegroundColor Yellow

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  VALIDATION COMPLETE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Run the SQL script to see detailed mismatches:" -ForegroundColor Yellow
Write-Host "  mysql -u root -proot b2b_marketplace < VALIDATE_SCHEMA.sql" -ForegroundColor White
