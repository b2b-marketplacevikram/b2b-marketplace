# Apply all schema fixes to existing database
Write-Host "Applying database schema fixes..." -ForegroundColor Cyan

$mysqlPath = "mysql"
$database = "b2b_marketplace"
$user = "root"
$password = "root"
$scriptFile = "FIX_ALL_SCHEMA_MISMATCHES.sql"

# Check if MySQL is accessible
try {
    $testConnection = & $mysqlPath -u $user -p$password -e "SELECT 1;" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Cannot connect to MySQL. Is it running?" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ MySQL connection verified" -ForegroundColor Green
}
catch {
    Write-Host "❌ MySQL not found in PATH. Update `$mysqlPath variable." -ForegroundColor Red
    exit 1
}

# Apply fixes
Write-Host "`nApplying schema fixes from $scriptFile..." -ForegroundColor Yellow
& $mysqlPath -u $user -p$password $database < $scriptFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Database schema updated successfully!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. Restart order-service" -ForegroundColor White
    Write-Host "2. Try placing an order again" -ForegroundColor White
}
else {
    Write-Host "`n❌ Failed to apply schema fixes. Check errors above." -ForegroundColor Red
}
