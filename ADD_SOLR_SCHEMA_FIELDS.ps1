# Add all required fields to Solr products core schema

Write-Host "Adding fields to Solr products core schema..." -ForegroundColor Cyan

$headers = @{
    "Content-Type" = "application/json"
}

$fields = @(
    @{name="productId"; type="plong"; stored=$true; indexed=$true},
    @{name="name"; type="string"; stored=$true; indexed=$true},
    @{name="description"; type="text_general"; stored=$true; indexed=$true},
    @{name="sku"; type="string"; stored=$true; indexed=$true},
    @{name="price"; type="pdouble"; stored=$true; indexed=$true},
    @{name="moq"; type="pint"; stored=$true; indexed=$true},
    @{name="stockQuantity"; type="pint"; stored=$true; indexed=$true},
    @{name="categoryId"; type="plong"; stored=$true; indexed=$true},
    @{name="categoryName"; type="string"; stored=$true; indexed=$true},
    @{name="supplierId"; type="plong"; stored=$true; indexed=$true},
    @{name="supplierName"; type="string"; stored=$true; indexed=$true},
    @{name="origin"; type="string"; stored=$true; indexed=$true},
    @{name="rating"; type="pdouble"; stored=$true; indexed=$true},
    @{name="reviewCount"; type="pint"; stored=$true; indexed=$true},
    @{name="isFeatured"; type="boolean"; stored=$true; indexed=$true},
    @{name="isActive"; type="boolean"; stored=$true; indexed=$true},
    @{name="createdAt"; type="pdate"; stored=$true; indexed=$true},
    @{name="updatedAt"; type="pdate"; stored=$true; indexed=$true},
    @{name="imageUrl"; type="text_general"; stored=$true; indexed=$false}
)

# Also add tags as a multivalued field
$tagsField = @{
    "add-field" = @{
        name = "tags"
        type = "strings"
        stored = $true
        indexed = $true
        multiValued = $true
    }
}

$successCount = 0
$failCount = 0

# Add regular fields
foreach($field in $fields) {
    $body = @{"add-field" = $field} | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8983/solr/products/schema" -Method Post -Headers $headers -Body $body
        Write-Host "✓ Added field: $($field.name)" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host "✗ Failed to add field: $($field.name) - $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
    }
    
    Start-Sleep -Milliseconds 100
}

# Add tags field
try {
    $body = $tagsField | ConvertTo-Json -Depth 3
    $response = Invoke-RestMethod -Uri "http://localhost:8983/solr/products/schema" -Method Post -Headers $headers -Body $body
    Write-Host "✓ Added field: tags (multivalued)" -ForegroundColor Green
    $successCount++
}
catch {
    Write-Host "✗ Failed to add field: tags - $($_.Exception.Message)" -ForegroundColor Red
    $failCount++
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Schema Setup Complete!" -ForegroundColor Cyan
Write-Host "Success: $successCount fields" -ForegroundColor Green
Write-Host "Failed: $failCount fields" -ForegroundColor Red
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Verifying schema..." -ForegroundColor Yellow
try {
    $schema = Invoke-RestMethod -Uri "http://localhost:8983/solr/products/schema/fields" -Method Get
    $addedFields = $schema.fields | Where-Object { $_.name -in @("productId", "name", "description", "sku", "price", "moq", "stockQuantity", "categoryId", "categoryName", "supplierId", "supplierName", "origin", "rating", "reviewCount", "tags", "isFeatured", "isActive", "createdAt", "updatedAt", "imageUrl") }
    
    Write-Host "`nVerified fields in schema:" -ForegroundColor Cyan
    foreach($f in $addedFields) {
        Write-Host "  - $($f.name) [$($f.type)]" -ForegroundColor Gray
    }
}
catch {
    Write-Host "Could not verify schema: $($_.Exception.Message)" -ForegroundColor Yellow
}
