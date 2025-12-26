# Test Order-Level and Product-Level Promotions

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Testing Promotion System" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8082/api/promotions"

# Test 1: Get Order-Level Promotions
Write-Host "Test 1: Get All Order-Level Promotions" -ForegroundColor Yellow
Write-Host "GET $baseUrl/order-level" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/order-level" -Method Get
    Write-Host "Found $($response.Count) order-level promotions:" -ForegroundColor Green
    $response | ForEach-Object {
        Write-Host "  - $($_.name): $($_.description)" -ForegroundColor White
        if ($_.minOrderAmount) {
            Write-Host "    Min Order: `$$($_.minOrderAmount)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Get Product-Level Promotions
Write-Host "Test 2: Get All Product-Level Promotions" -ForegroundColor Yellow
Write-Host "GET $baseUrl/product-level" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/product-level" -Method Get
    Write-Host "Found $($response.Count) product-level promotions:" -ForegroundColor Green
    $response | ForEach-Object {
        Write-Host "  - $($_.name): $($_.description)" -ForegroundColor White
        if ($_.type -eq "BUY_X_GET_Y") {
            Write-Host "    Buy $($_.buyQuantity) Get $($_.getQuantity) Free" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Find Best Order-Level Promotion for $750 order
Write-Host "Test 3: Find Best Order-Level Promotion for `$750 Order" -ForegroundColor Yellow
Write-Host "GET $baseUrl/order-level/best?orderAmount=750.00" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/order-level/best?orderAmount=750.00" -Method Get
    Write-Host "Best Promotion: $($response.name)" -ForegroundColor Green
    Write-Host "  Type: $($response.type)" -ForegroundColor White
    Write-Host "  Discount: $($response.discountPercentage)%" -ForegroundColor White
    Write-Host "  Min Order: `$$($response.minOrderAmount)" -ForegroundColor White
    Write-Host "  Max Discount: `$$($response.maxDiscountAmount)" -ForegroundColor White
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Calculate Order-Level Discount
Write-Host "Test 4: Calculate Discount for Order-Level Promotion" -ForegroundColor Yellow
Write-Host "POST $baseUrl/order-level/calculate?promotionId=1&orderAmount=750.00" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/order-level/calculate?promotionId=1&orderAmount=750.00" -Method Post
    Write-Host "Calculated Discount: `$$response" -ForegroundColor Green
    Write-Host "  (10% of `$750 = `$75)" -ForegroundColor Gray
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 5: Calculate Order-Level Discount with Cap
Write-Host "Test 5: Calculate Discount with Max Cap (Order `$2000)" -ForegroundColor Yellow
Write-Host "POST $baseUrl/order-level/calculate?promotionId=1&orderAmount=2000.00" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/order-level/calculate?promotionId=1&orderAmount=2000.00" -Method Post
    Write-Host "Calculated Discount: `$$response" -ForegroundColor Green
    Write-Host "  (10% of `$2000 = `$200, but capped at `$100)" -ForegroundColor Gray
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 6: Calculate Product-Level Discount (Buy 2 Get 1)
Write-Host "Test 6: Calculate Product-Level Discount (Buy 2 Get 1 Free)" -ForegroundColor Yellow
Write-Host "POST $baseUrl/product-level/calculate?promotionId=5&productPrice=100.00&quantity=3" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/product-level/calculate?promotionId=5&productPrice=100.00&quantity=3" -Method Post
    Write-Host "Calculated Discount: `$$response" -ForegroundColor Green
    Write-Host "  (Buy 2 Get 1: Quantity 3 gets 1 free item worth `$100)" -ForegroundColor Gray
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 7: Best Promotion for Different Order Amounts
Write-Host "Test 7: Best Promotions for Various Order Amounts" -ForegroundColor Yellow
$orderAmounts = @(250, 400, 750, 1200, 2500)
foreach ($amount in $orderAmounts) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/order-level/best?orderAmount=$amount" -Method Get
        $discount = Invoke-RestMethod -Uri "$baseUrl/order-level/calculate?promotionId=$($response.id)&orderAmount=$amount" -Method Post
        Write-Host "  Order `$$amount : $($response.name) - Save `$$discount" -ForegroundColor Green
    } catch {
        Write-Host "  Order `$$amount : No applicable promotion" -ForegroundColor Gray
    }
}
Write-Host ""

# Test 8: Get All Active Promotions
Write-Host "Test 8: Get All Active Promotions" -ForegroundColor Yellow
Write-Host "GET $baseUrl/active" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/active" -Method Get
    Write-Host "Total Active Promotions: $($response.Count)" -ForegroundColor Green
    
    $orderLevel = $response | Where-Object { $_.promotionLevel -eq "ORDER_LEVEL" }
    $productLevel = $response | Where-Object { $_.promotionLevel -eq "PRODUCT_LEVEL" }
    
    Write-Host "  Order-Level: $($orderLevel.Count)" -ForegroundColor White
    Write-Host "  Product-Level: $($productLevel.Count)" -ForegroundColor White
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
