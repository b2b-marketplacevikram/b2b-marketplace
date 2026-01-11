# Check existing columns in orders table

Write-Host "`nChecking columns in orders table..." -ForegroundColor Cyan

$sql = @"
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'b2b_marketplace' 
  AND TABLE_NAME = 'orders'
ORDER BY ORDINAL_POSITION;
"@

mysql -u root -p1234 -e "$sql"
