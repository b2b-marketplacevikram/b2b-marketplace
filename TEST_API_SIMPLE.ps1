# Comprehensive Test Script for Promotion and Coupon APIs
Write-Host "`n================================================================================" -ForegroundColor Cyan
Write-Host "    PROMOTION & COUPON API TESTING" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "`n"

$baseUrl = "http://localhost:8082/api"
$testsPassed = 0
$testsFailed = 0

function Test-Endpoint {
    param($name, $method, $uri)
    Write-Host "TEST: $name" -ForegroundColor Yellow
    Write-Host "  $method $uri" -ForegroundColor Gray
    try {
        $result = Invoke-RestMethod -Uri $uri -Method $method -ErrorAction Stop
        Write-Host "  PASS" -ForegroundColor Green
        $script:testsPassed++
        return $result
    } catch {
        Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
        $script:testsFailed++
        return $null
    }
}

Write-Host "--- PART 1: PROMOTION API TESTS ---`n" -ForegroundColor Magenta

# Test 1
$result = Test-Endpoint "Get All Promotions" "GET" "$baseUrl/promotions"
if ($result) { Write-Host "  Found: $($result.Count) promotions`n" -ForegroundColor White }

# Test 2
$result = Test-Endpoint "Get Active Promotions" "GET" "$baseUrl/promotions/active"
if ($result) { Write-Host "  Active: $($result.Count) promotions`n" -ForegroundColor White }

# Test 3
$result = Test-Endpoint "Get Order-Level Promotions" "GET" "$baseUrl/promotions/order-level"
if ($result) { 
    Write-Host "  Order-Level:" -ForegroundColor White
    foreach ($promo in $result) {
        Write-Host "    - $($promo.name)" -ForegroundColor Gray
    }
    Write-Host ""
}

# Test 4
$result = Test-Endpoint "Get Product-Level Promotions" "GET" "$baseUrl/promotions/product-level"
if ($result) { 
    Write-Host "  Product-Level:" -ForegroundColor White
    foreach ($promo in $result) {
        Write-Host "    - $($promo.name)" -ForegroundColor Gray
    }
    Write-Host ""
}

# Test 5
$result = Test-Endpoint "Get Promotion by ID 1" "GET" "$baseUrl/promotions/1"
if ($result) { Write-Host "  Name: $($result.name)`n" -ForegroundColor White }

# Test 6
$result = Test-Endpoint "Find Best Promotion for Order 750" "GET" "$baseUrl/promotions/order-level/best?orderAmount=750.00"
if ($result) { Write-Host "  Best: $($result.name)`n" -ForegroundColor White }

# Test 7
$uri = "$baseUrl/promotions/order-level/calculate?promotionId=1&orderAmount=750.00"
$result = Test-Endpoint "Calculate Order Discount for 750" "POST" $uri
if ($result) { Write-Host "  Discount: `$$result`n" -ForegroundColor White }

# Test 8
$uri = "$baseUrl/promotions/order-level/calculate?promotionId=1&orderAmount=2000.00"
$result = Test-Endpoint "Calculate Order Discount for 2000" "POST" $uri
if ($result) { Write-Host "  Discount: `$$result (capped)`n" -ForegroundColor White }

# Test 9
$uri = "$baseUrl/promotions/product-level/calculate?promotionId=5&productPrice=100.00&quantity=3"
$result = Test-Endpoint "Calculate Product Discount Buy 2 Get 1" "POST" $uri
if ($result) { Write-Host "  Discount: `$$result`n" -ForegroundColor White }

# Test 10
$result = Test-Endpoint "Get Promotions for Product 1" "GET" "$baseUrl/promotions/product/1"
if ($result) { Write-Host "  Applicable: $($result.Count) promotions`n" -ForegroundColor White }

# Test 11
Write-Host "TEST: Best Promotions for Various Amounts" -ForegroundColor Yellow
$amounts = @(250, 350, 600, 1100, 2500)
foreach ($amt in $amounts) {
    try {
        $best = Invoke-RestMethod -Uri "$baseUrl/promotions/order-level/best?orderAmount=$amt" -Method GET -ErrorAction Stop
        $calcUri = "$baseUrl/promotions/order-level/calculate?promotionId=$($best.id)&orderAmount=$amt"
        $disc = Invoke-RestMethod -Uri $calcUri -Method POST -ErrorAction Stop
        Write-Host "  Order $amt -> $($best.name) -> Save `$$disc" -ForegroundColor White
    } catch {
        Write-Host "  Order $amt -> No promotion" -ForegroundColor Gray
    }
}
$script:testsPassed++
Write-Host ""

Write-Host "`n--- PART 2: COUPON API TESTS ---`n" -ForegroundColor Magenta

# Test 12
$result = Test-Endpoint "Get All Coupons" "GET" "$baseUrl/coupons"
if ($result) { Write-Host "  Found: $($result.Count) coupons`n" -ForegroundColor White }

# Test 13
$result = Test-Endpoint "Get Active Coupons" "GET" "$baseUrl/coupons/active"
if ($result) { 
    Write-Host "  Active Coupons:" -ForegroundColor White
    foreach ($coupon in $result) {
        Write-Host "    - Code: $($coupon.code) | $($coupon.name)" -ForegroundColor Gray
    }
    Write-Host ""
}

# Test 14
$result = Test-Endpoint "Get Coupon by Code SAVE15" "GET" "$baseUrl/coupons/code/SAVE15"
if ($result) { Write-Host "  Name: $($result.name)`n" -ForegroundColor White }

# Test 15
$uri = "$baseUrl/coupons/validate?code=SAVE15&userId=1&orderAmount=500.00"
$result = Test-Endpoint "Validate Coupon SAVE15 for 500" "POST" $uri
if ($result) { 
    Write-Host "  Valid: $($result.valid)" -ForegroundColor White
    Write-Host "  Discount: `$$($result.discount)`n" -ForegroundColor White
}

# Test 16
$uri = "$baseUrl/coupons/validate?code=SAVE15&userId=1&orderAmount=100.00"
$result = Test-Endpoint "Validate SAVE15 Below Minimum" "POST" $uri
if ($result) { 
    Write-Host "  Valid: $($result.valid)" -ForegroundColor White
    Write-Host "  Message: $($result.message)`n" -ForegroundColor White
}

# Test 17
$result = Test-Endpoint "Get Coupon by Code FLAT30" "GET" "$baseUrl/coupons/code/FLAT30"
if ($result) { Write-Host "  Type: $($result.discountType)`n" -ForegroundColor White }

# Test 18
$uri = "$baseUrl/coupons/validate?code=FLAT30&userId=2&orderAmount=200.00"
$result = Test-Endpoint "Validate FLAT30 Coupon" "POST" $uri
if ($result) { 
    Write-Host "  Valid: $($result.valid)" -ForegroundColor White
    Write-Host "  Discount: `$$($result.discount)`n" -ForegroundColor White
}

# Test 19
$result = Test-Endpoint "Get Coupon by Code FREESHIP" "GET" "$baseUrl/coupons/code/FREESHIP"
if ($result) { Write-Host "  Type: $($result.discountType)`n" -ForegroundColor White }

# Test 20
$uri = "$baseUrl/coupons/validate?code=FREESHIP&userId=3&orderAmount=75.00"
$result = Test-Endpoint "Validate FREESHIP Coupon" "POST" $uri
if ($result) { 
    Write-Host "  Valid: $($result.valid)`n" -ForegroundColor White
}

# Test 21
$result = Test-Endpoint "Get Coupon by ID 1" "GET" "$baseUrl/coupons/1"
if ($result) { 
    Write-Host "  Code: $($result.code)" -ForegroundColor White
    Write-Host "  Usage: $($result.usageCount) / $($result.usageLimit)`n" -ForegroundColor White
}

# Test 22
Write-Host "TEST: Create New Coupon TEST50" -ForegroundColor Yellow
Write-Host "  POST $baseUrl/coupons" -ForegroundColor Gray
$newCoupon = @{
    code = "TEST50"
    name = "Test Coupon 50 Off"
    description = "Test coupon for 50 discount"
    discountType = "PERCENTAGE"
    discountValue = 50.00
    minOrderAmount = 100.00
    maxDiscountAmount = 200.00
    usageLimit = 100
    perUserLimit = 1
    validFrom = "2024-01-01T00:00:00"
    validUntil = "2025-12-31T23:59:59"
    isActive = $true
    applicableTo = "ALL"
} | ConvertTo-Json

try {
    $created = Invoke-RestMethod -Uri "$baseUrl/coupons" -Method POST -Body $newCoupon -ContentType "application/json" -ErrorAction Stop
    Write-Host "  PASS" -ForegroundColor Green
    Write-Host "  Created: $($created.code) with ID $($created.id)`n" -ForegroundColor White
    $script:testsPassed++
    
    # Test 23
    $uri = "$baseUrl/coupons/validate?code=TEST50&userId=5&orderAmount=300.00"
    $val = Test-Endpoint "Validate New Coupon TEST50" "POST" $uri
    if ($val) { Write-Host "  Discount: `$$($val.discount)`n" -ForegroundColor White }
    
    # Test 24
    $uri = "$baseUrl/coupons/validate?code=TEST50&userId=5&orderAmount=500.00"
    $val = Test-Endpoint "Validate TEST50 with Cap" "POST" $uri
    if ($val) { Write-Host "  Discount: `$$($val.discount) (capped)`n" -ForegroundColor White }
    
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $script:testsFailed++
}

Write-Host "`n--- TEST SUMMARY ---`n" -ForegroundColor Magenta
Write-Host "Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "Tests Failed: $testsFailed" -ForegroundColor Red
$total = $testsPassed + $testsFailed
if ($total -gt 0) {
    $successRate = [math]::Round(($testsPassed / $total) * 100, 2)
    Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" })
}

Write-Host "`n================================================================================" -ForegroundColor Cyan
Write-Host "    TESTING COMPLETE!" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
