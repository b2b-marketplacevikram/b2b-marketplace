# Quick script to check what's actually in Solr

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Checking Solr Data" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get all products
Write-Host "Fetching all products from Solr..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:8983/solr/products/select?q=*:*&rows=100&wt=json"

$products = $response.response.docs
$total = $response.response.numFound

Write-Host "Found $total products in Solr" -ForegroundColor Green
Write-Host ""

if ($products.Count -gt 0) {
    Write-Host "Product Details:" -ForegroundColor Cyan
    Write-Host "----------------" -ForegroundColor Cyan
    
    foreach ($product in $products) {
        Write-Host ""
        Write-Host "Product ID: $($product.productId)" -ForegroundColor White
        Write-Host "  Name: $($product.name)" -ForegroundColor Gray
        Write-Host "  Category ID: $($product.categoryId)" -ForegroundColor Yellow
        Write-Host "  Category Name: $($product.categoryName)" -ForegroundColor Yellow
        Write-Host "  Price: $($product.price)" -ForegroundColor Gray
        Write-Host "  Supplier ID: $($product.supplierId)" -ForegroundColor Gray
        Write-Host "  Is Active: $($product.isActive)" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Category Summary:" -ForegroundColor Cyan
    $categories = $products | Group-Object -Property categoryId
    foreach ($cat in $categories) {
        Write-Host "  Category ID $($cat.Name): $($cat.Count) products" -ForegroundColor White
    }
} else {
    Write-Host "No products found in Solr!" -ForegroundColor Red
    Write-Host "You may need to restart the search-service to trigger indexing" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "To search for a specific category, use:" -ForegroundColor Yellow
Write-Host "http://localhost:8983/solr/products/select?q=categoryId:9&wt=json" -ForegroundColor White
Write-Host ""
