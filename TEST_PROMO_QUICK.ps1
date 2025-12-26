# Quick Promotion API Test
$baseUrl = "http://localhost:8082/api"
$passed = 0
$failed = 0

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "  PROMOTION API QUICK TEST" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Test 1: Get Active Promotions
Write-Host "Test 1: Get Active Promotions" -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$baseUrl/promotions/active" -Method Get
    Write-Host "  PASS - Found $($result.Count) active promotions" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 2: Get Order-Level Promotions
Write-Host "`nTest 2: Get Order-Level Promotions" -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$baseUrl/promotions/order-level" -Method Get
    Write-Host "  PASS - Found $($result.Count) order-level promotions" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 3: Get Product-Level Promotions
Write-Host "`nTest 3: Get Product-Level Promotions" -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$baseUrl/promotions/product-level" -Method Get
    Write-Host "  PASS - Found $($result.Count) product-level promotions" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 4: Find Best Promotion for $750
Write-Host "`nTest 4: Find Best Promotion for Order $750" -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$baseUrl/promotions/order-level/best?orderAmount=750" -Method Get
    Write-Host "  PASS - Best: $($result.name)" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 5: Calculate Discount
Write-Host "`nTest 5: Calculate Discount for Promotion ID 1, Order $750" -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$baseUrl/promotions/order-level/calculate?promotionId=1&orderAmount=750" -Method Post
    Write-Host "  PASS - Discount: `$$result" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 6: Get Active Coupons
Write-Host "`nTest 6: Get Active Coupons" -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$baseUrl/coupons/active" -Method Get
    Write-Host "  PASS - Found $($result.Count) active coupons" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 7: Get Coupon by Code
Write-Host "`nTest 7: Get Coupon by Code 'SAVE15'" -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$baseUrl/coupons/code/SAVE15" -Method Get
    Write-Host "  PASS - Code: $($result.code), Discount: $($result.discountValue)%" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 8: Validate Coupon
Write-Host "`nTest 8: Validate Coupon SAVE15 for $500 Order" -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$baseUrl/coupons/validate?code=SAVE15&userId=1&orderAmount=500" -Method Post
    Write-Host "  PASS - Valid: $($result.valid), Discount: `$$($result.discount)" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "  TEST RESULTS" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
$total = $passed + $failed
if ($total -gt 0) {
    $rate = [math]::Round(($passed / $total) * 100, 1)
    Write-Host "Success Rate: $rate%" -ForegroundColor $(if ($rate -ge 90) { "Green" } elseif ($rate -ge 70) { "Yellow" } else { "Red" })
}
Write-Host ""
