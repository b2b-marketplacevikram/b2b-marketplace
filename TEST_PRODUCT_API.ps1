# Test Product Service API endpoints

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing Product Service API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8082/api"

# Test 1: Get all products
Write-Host "[1] Testing GET /products (all products)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/products" -Method GET -TimeoutSec 10
    $count = if ($response -is [array]) { $response.Count } else { 1 }
    Write-Host "   ✓ Success! Found $count products" -ForegroundColor Green
    
    if ($count -gt 0) {
        $firstProduct = if ($response -is [array]) { $response[0] } else { $response }
        Write-Host "   Sample product:" -ForegroundColor Gray
        Write-Host "     ID: $($firstProduct.id)" -ForegroundColor Gray
        Write-Host "     Name: $($firstProduct.name)" -ForegroundColor Gray
        Write-Host "     CategoryId: $($firstProduct.categoryId)" -ForegroundColor Yellow
        Write-Host "     IsActive: $($firstProduct.isActive)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Get products by category 9
Write-Host "[2] Testing GET /products/category/9..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/products/category/9" -Method GET -TimeoutSec 10
    $count = if ($response -is [array]) { $response.Count } else { if ($response) { 1 } else { 0 } }
    Write-Host "   ✓ Found $count products in category 9" -ForegroundColor Green
    
    if ($count -gt 0) {
        Write-Host "   Products:" -ForegroundColor Gray
        if ($response -is [array]) {
            foreach ($p in $response) {
                Write-Host "     - ID: $($p.id), Name: $($p.name)" -ForegroundColor Gray
            }
        } else {
            Write-Host "     - ID: $($response.id), Name: $($response.name)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ⚠ No products found in category 9!" -ForegroundColor Yellow
        Write-Host "   This explains why search returns 0 results!" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Get products by category 1
Write-Host "[3] Testing GET /products/category/1 (Electronics)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/products/category/1" -Method GET -TimeoutSec 10
    $count = if ($response -is [array]) { $response.Count } else { if ($response) { 1 } else { 0 } }
    Write-Host "   ✓ Found $count products in category 1" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "If category 9 has 0 products in the database," -ForegroundColor Yellow
Write-Host "then the issue is NOT with Solr but with the" -ForegroundColor Yellow
Write-Host "database itself. Check which category your" -ForegroundColor Yellow
Write-Host "products are actually in!" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
