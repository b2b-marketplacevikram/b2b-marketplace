# Apply Category Hierarchical Structure Migrations
Write-Host "Applying category structure migrations..." -ForegroundColor Cyan

# Database connection details
$dbHost = "localhost"
$dbPort = "5432"
$dbName = "b2bmarketplace"
$dbUser = "postgres"
$dbPassword = "postgres"

# Check if database exists
Write-Host "`nChecking database connection..." -ForegroundColor Yellow
$testConnection = docker exec b2b-marketplace-postgres psql -U $dbUser -d $dbName -c "SELECT 1;" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Cannot connect to database. Make sure PostgreSQL is running." -ForegroundColor Red
    exit 1
}

Write-Host "Database connection successful!" -ForegroundColor Green

# 1. Add image_url column to categories
Write-Host "`n1. Adding image_url column to categories table..." -ForegroundColor Yellow
docker exec -i b2b-marketplace-postgres psql -U $dbUser -d $dbName <<'EOF'
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='categories' AND column_name='image_url'
    ) THEN
        ALTER TABLE categories ADD COLUMN image_url VARCHAR(500);
        RAISE NOTICE 'Added image_url column to categories';
    ELSE
        RAISE NOTICE 'image_url column already exists';
    END IF;
END $$;
EOF

# 2. Insert hierarchical category data
Write-Host "`n2. Inserting hierarchical category structure..." -ForegroundColor Yellow
Get-Content ".\database\migrations\hierarchical_electronics_categories.sql" | docker exec -i b2b-marketplace-postgres psql -U $dbUser -d $dbName

# 3. Verify the structure
Write-Host "`n3. Verifying category structure..." -ForegroundColor Yellow
docker exec b2b-marketplace-postgres psql -U $dbUser -d $dbName -c @"
SELECT 
    c1.id as parent_id,
    c1.name as parent_name,
    c2.id as child_id,
    c2.name as child_name,
    c2.image_url
FROM categories c1
LEFT JOIN categories c2 ON c2.parent_id = c1.id
WHERE c1.name = 'Electronics'
ORDER BY c2.display_order;
"@

Write-Host "`nCategory structure migrations completed successfully!" -ForegroundColor Green
Write-Host "You can now browse categories hierarchically in the application." -ForegroundColor Cyan
