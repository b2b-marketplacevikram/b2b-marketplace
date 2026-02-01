# Apply Product Classification System Migration
# This script creates the classification-based specification tables

Write-Host "=== Creating Product Classification System Tables ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will create:" -ForegroundColor Yellow
Write-Host "  1. classification_classes (AdditionalDetails, Memory, Display, Camera)" -ForegroundColor White
Write-Host "  2. classification_attributes (Predefined attributes like RAM, Screen Size, etc.)" -ForegroundColor White
Write-Host "  3. product_classifications (Product-to-class assignments)" -ForegroundColor White
Write-Host "  4. product_attribute_values (Supplier-entered values)" -ForegroundColor White
Write-Host ""

# Database configuration
$dbHost = "localhost"
$dbPort = "3306"
$dbName = "b2b_marketplace"
$dbUser = "root"
$dbPassword = "root"

# Path to SQL files (consolidated in database folder)
$schemaFile = "database/schema.sql"
$sampleDataFile = "database/sample_data.sql"

Write-Host "Step 1: Running consolidated database schema..." -ForegroundColor Yellow
Write-Host "   (This includes all tables including classification system)" -ForegroundColor Gray
try {
    Get-Content $schemaFile | & mysql -h $dbHost -P $dbPort -u $dbUser -p$dbPassword
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database schema created successfully" -ForegroundColor Green
        Write-Host "   (Including classification_classes, classification_attributes, etc.)" -ForegroundColor Gray
    } else {
        Write-Host "✗ Failed to create schema" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Error creating schema: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Inserting consolidated sample data..." -ForegroundColor Yellow
Write-Host "   (This includes classification data)" -ForegroundColor Gray
try {
    Get-Content $sampleDataFile | & mysql -h $dbHost -P $dbPort -u $dbUser -p$dbPassword
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Sample data inserted successfully" -ForegroundColor Green
        Write-Host "✓ Pre-populated with default classifications:" -ForegroundColor Green
        Write-Host "    - AdditionalDetails (Operating System, Processor Speed, etc.)" -ForegroundColor Cyan
        Write-Host "    - Memory (RAM, Storage Capacity, etc.)" -ForegroundColor Cyan
        Write-Host "    - Display (Screen Size, Resolution, etc.)" -ForegroundColor Cyan
        Write-Host "    - Camera (Rear Camera, Front Camera, etc.)" -ForegroundColor Cyan
    } else {
        Write-Host "✗ Failed to insert sample data" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Error inserting sample data: $_" -ForegroundColor Red
    exit 1
}
tables = @("classification_classes", "classification_attributes", "product_classifications", "product_attribute_values")
    
    foreach ($table in $tables) {
        $query = "SELECT COUNT(*) as count FROM $table;"
        $result = $query | & mysql -h $dbHost -P $dbPort -u $dbUser -p$dbPassword $dbName -N
        Write-Host "✓ Table '$table' created successfully (rows: $result)" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Sample classification data:" -ForegroundColor Yellow
    $sampleQuery = @"
SELECT 
    cc.display_name as 'Classification',
    COUNT(ca.id) as 'Attributes'
FROM classification_classes cc
LEFT JOIN classification_attributes ca ON cc.id = ca.class_id
GROUP BY cc.id, cc.display_name
ORDER BY cc.display_order;
"@
    $sampleQuery | & mysql -h $dbHost -P $dbPort -u $dbUser -p$dbPassword $dbName -t
    
    Write-Host ""
    Write-Host "✓ All tables verified successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Error verifying tablesP $dbPort -u $dbUser -p$dbPassword $dbName -t
    
    Write-Host ""
    Write-Host "✓ Table structure verified successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Error verifying table: $_" -ForegroundColor Red
}
the classification API: GET http://localhost:8081/api/classifications"
Write-Host "4. Test adding products with classifications from the mobile app"
Write-Host "5. Suppliers will see predefined attributes and only enter values
Write-Host ""
Write-Host "=== Migration Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Rebuild the product-service: cd backend/product-service && mvn clean install"
Write-Host "2. Restart the product service"
Write-Host "3. Test adding products with dynamic specifications from the mobile app"
Write-Host ""
