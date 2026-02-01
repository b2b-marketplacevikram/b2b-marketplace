# Complete Category Setup Script
# This script sets up categories with hierarchical structure and images

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  B2B Marketplace Category Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Database connection details
$dbContainer = "b2b-marketplace-postgres"
$dbUser = "postgres"
$dbName = "b2bmarketplace"

# Check if Docker is running
Write-Host "`n[1/5] Checking Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker is running" -ForegroundColor Green

# Check if database container exists
Write-Host "`n[2/5] Checking database container..." -ForegroundColor Yellow
$containerExists = docker ps -a --filter "name=$dbContainer" --format "{{.Names}}" | Select-String -Pattern $dbContainer
if (-not $containerExists) {
    Write-Host "Error: Container '$dbContainer' not found." -ForegroundColor Red
    Write-Host "Please start the database using: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

# Check if container is running
$containerRunning = docker ps --filter "name=$dbContainer" --format "{{.Names}}" | Select-String -Pattern $dbContainer
if (-not $containerRunning) {
    Write-Host "Container exists but is not running. Starting it..." -ForegroundColor Yellow
    docker start $dbContainer
    Start-Sleep -Seconds 3
}
Write-Host "✓ Database container is running" -ForegroundColor Green

# Test database connection
Write-Host "`n[3/5] Testing database connection..." -ForegroundColor Yellow
$testConnection = docker exec $dbContainer psql -U $dbUser -d $dbName -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Cannot connect to database." -ForegroundColor Red
    Write-Host $testConnection -ForegroundColor Red
    exit 1
}
Write-Host "✓ Database connection successful" -ForegroundColor Green

# Step 1: Add image_url column if not exists
Write-Host "`n[4/5] Adding image_url column to categories table..." -ForegroundColor Yellow
$addColumnSQL = @"
DO `$`$ 
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
END `$`$;
"@

$addColumnSQL | docker exec -i $dbContainer psql -U $dbUser -d $dbName
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Column added/verified successfully" -ForegroundColor Green
} else {
    Write-Host "! Warning: Could not add column (may already exist)" -ForegroundColor Yellow
}

# Step 2: Update existing categories with images
Write-Host "`n[5/5] Updating categories with image URLs..." -ForegroundColor Yellow

# Check if migration file exists
$migrationFile = ".\database\migrations\update_categories_images.sql"
if (Test-Path $migrationFile) {
    Get-Content $migrationFile | docker exec -i $dbContainer psql -U $dbUser -d $dbName
    Write-Host "✓ Updated existing categories with images" -ForegroundColor Green
} else {
    Write-Host "! Migration file not found, applying inline updates..." -ForegroundColor Yellow
    
    $updateSQL = @"
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400' WHERE slug = 'electronics' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400' WHERE slug = 'machinery' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1558769132-cb1aea27c2e2?w=400' WHERE slug = 'textiles' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400' WHERE slug = 'chemicals' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400' WHERE slug = 'construction-materials' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400' WHERE slug = 'automotive-parts' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400' WHERE slug = 'food-beverages' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400' WHERE slug = 'packaging' AND image_url IS NULL;
"@
    
    $updateSQL | docker exec -i $dbContainer psql -U $dbUser -d $dbName
    Write-Host "✓ Inline updates applied" -ForegroundColor Green
}

# Optional: Add hierarchical Electronics categories
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Optional: Add Hierarchical Categories" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
$addHierarchy = Read-Host "Do you want to add hierarchical Electronics categories? (y/n)"

if ($addHierarchy -eq 'y' -or $addHierarchy -eq 'Y') {
    Write-Host "`nAdding hierarchical Electronics categories..." -ForegroundColor Yellow
    
    $hierarchyFile = ".\database\migrations\hierarchical_electronics_categories.sql"
    if (Test-Path $hierarchyFile) {
        Get-Content $hierarchyFile | docker exec -i $dbContainer psql -U $dbUser -d $dbName
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Hierarchical categories added successfully" -ForegroundColor Green
        } else {
            Write-Host "! Error adding hierarchical categories" -ForegroundColor Red
        }
    } else {
        Write-Host "! Hierarchy file not found: $hierarchyFile" -ForegroundColor Red
    }
}

# Display current categories
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Current Categories in Database" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

docker exec $dbContainer psql -U $dbUser -d $dbName -c @"
SELECT 
    id,
    name,
    slug,
    CASE 
        WHEN parent_id IS NULL THEN 'Top Level'
        ELSE CONCAT('Child of ', parent_id::text)
    END as level,
    CASE 
        WHEN image_url IS NOT NULL THEN '✓ Has Image'
        ELSE '✗ No Image'
    END as image_status
FROM categories
ORDER BY parent_id NULLS FIRST, display_order, id;
"@

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Category Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Restart the product-service to load new schema" -ForegroundColor White
Write-Host "2. Restart the frontend: npm run dev" -ForegroundColor White
Write-Host "3. Visit http://localhost:3000 to see the categories" -ForegroundColor White
