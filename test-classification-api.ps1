# Test Classification API Save Operation

Write-Host "`n=== Testing Product Classification Save ===`n" -ForegroundColor Cyan

# First, check if product service is running
Write-Host "1. Checking if product service is running..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8082/api/products" -Method GET -TimeoutSec 5
    Write-Host "   Product service is running!" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: Product service is not running on port 8082" -ForegroundColor Red
    Write-Host "   Please start the backend first!" -ForegroundColor Red
    exit
}

# Prepare test data with classifications
Write-Host "`n2. Preparing test data..." -ForegroundColor Yellow
$productData = @{
    supplierId = 1
    categoryId = 10
    name = "HPLaptop - With Classifications"
    description = "Test laptop with Memory and Display specs"
    unitPrice = 34000
    unit = "piece"
    moq = 11
    stockQuantity = 134
    leadTimeDays = 7
    origin = "USA"
    brand = "HP"
    model = "ProBook 450"
    isActive = $true
    isFeatured = $false
    imageUrls = @()
    classificationIds = @(2, 3)  # 2=Memory, 3=Display
    attributeValues = @(
        @{ attributeId = 5; attributeValue = "8 GB" }
        @{ attributeId = 6; attributeValue = "SSD" }
        @{ attributeId = 7; attributeValue = "256 GB" }
        @{ attributeId = 9; attributeValue = "15.6 inches" }
        @{ attributeId = 10; attributeValue = "1920x1080" }
    )
}

Write-Host "   Data prepared with 2 classifications and 5 attribute values" -ForegroundColor Green

# Send UPDATE request
Write-Host "`n3. Sending PUT request to update product 4..." -ForegroundColor Yellow
try {
    $json = $productData | ConvertTo-Json -Depth 5
    $response = Invoke-RestMethod -Uri "http://localhost:8082/api/products/4" `
        -Method PUT `
        -Body $json `
        -ContentType "application/json"
    
    Write-Host "   SUCCESS! Product updated" -ForegroundColor Green
    
} catch {
    Write-Host "   ERROR!" -ForegroundColor Red
    Write-Host "   Message: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
    Write-Host "`n   Check if the backend terminal shows any errors!" -ForegroundColor Yellow
    exit
}

# Verify the saved data
Write-Host "`n4. Verifying saved classifications..." -ForegroundColor Yellow
Start-Sleep -Seconds 1  # Give backend time to save

try {
    $product = Invoke-RestMethod -Uri "http://localhost:8082/api/products/4" -Method GET
    
    if ($product.data.classifications -and $product.data.classifications.Count -gt 0) {
        Write-Host "   SUCCESS! Found $($product.data.classifications.Count) classifications" -ForegroundColor Green
        
        foreach ($class in $product.data.classifications) {
            Write-Host "`n   Classification: $($class.displayName)" -ForegroundColor Cyan
            if ($class.attributes) {
                foreach ($attr in $class.attributes) {
                    if ($attr.value) {
                        Write-Host "      $($attr.name): $($attr.value) $($attr.unit)" -ForegroundColor White
                    }
                }
            }
        }
    } else {
        Write-Host "   WARNING: No classifications found in response" -ForegroundColor Red
        Write-Host "   Check backend logs for saveProductClassifications" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "   ERROR retrieving product!" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===`n" -ForegroundColor Cyan
