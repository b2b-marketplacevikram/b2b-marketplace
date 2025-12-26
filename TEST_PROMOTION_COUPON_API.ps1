# Comprehensive Test Script for Promotion and Coupon APIs
# Run this after starting Product Service: mvn spring-boot:run

Write-Host "`n" + "="*80 -ForegroundColor Cyan
Write-Host "    PROMOTION & COUPON API TESTING" -ForegroundColor Cyan
Write-Host "="*80 -ForegroundColor Cyan
Write-Host "`n"

$baseUrl = "http://localhost:8082/api"
$testsPassed = 0
$testsFailed = 0

function Test-API {
    param($testName, $method, $url, $body = $null)
    
    Write-Host "Test: $testName" -ForegroundColor Yellow
    Write-Host "$method $url" -ForegroundColor Gray
    
    try {
        if ($body) {
            $response = Invoke-RestMethod -Uri $url -Method $method -Body ($body | ConvertTo-Json) -ContentType "application/json"
        } else {
            $response = Invoke-RestMethod -Uri $url -Method $method
        }
        
        Write-Host "✓ PASS" -ForegroundColor Green
        $script:testsPassed++
        return $response
    } catch {
        Write-Host "✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
        $script:testsFailed++
        return $null
    }
}

Write-Host "`n--- PART 1: PROMOTION API TESTS ---`n" -ForegroundColor Magenta

# Test 1: Get All Promotions
Write-Host "[1] Get All Promotions" -ForegroundColor Cyan
$allPromotions = Test-API "Get all promotions" "GET" "$baseUrl/promotions"
if ($allPromotions) {
    Write-Host "   Found $($allPromotions.Count) promotions" -ForegroundColor White
    Write-Host ""
}

# Test 2: Get Active Promotions
Write-Host "[2] Get Active Promotions" -ForegroundColor Cyan
$activePromotions = Test-API "Get active promotions" "GET" "$baseUrl/promotions/active"
if ($activePromotions) {
    Write-Host "   Active: $($activePromotions.Count) promotions" -ForegroundColor White
    Write-Host ""
}

# Test 3: Get Order-Level Promotions
Write-Host "[3] Get Order-Level Promotions" -ForegroundColor Cyan
$orderPromotions = Test-API "Get order-level promotions" "GET" "$baseUrl/promotions/order-level"
if ($orderPromotions) {
    Write-Host "   Order-Level Promotions:" -ForegroundColor White
    $orderPromotions | ForEach-Object {
        Write-Host "      • $($_.name) - $($_.type)" -ForegroundColor Gray
        if ($_.minOrderAmount) {
            Write-Host "        Min: `$$($_.minOrderAmount), Discount: $($_.discountPercentage)%" -ForegroundColor DarkGray
        }
    }
    Write-Host ""
}

# Test 4: Get Product-Level Promotions
Write-Host "[4] Get Product-Level Promotions" -ForegroundColor Cyan
$productPromotions = Test-API "Get product-level promotions" "GET" "$baseUrl/promotions/product-level"
if ($productPromotions) {
    Write-Host "   Product-Level Promotions:" -ForegroundColor White
    $productPromotions | ForEach-Object {
        Write-Host "      • $($_.name) - $($_.type)" -ForegroundColor Gray
        if ($_.buyQuantity) {
            Write-Host "        Buy $($_.buyQuantity) Get $($_.getQuantity) Free" -ForegroundColor DarkGray
        }
    }
    Write-Host ""
}

# Test 5: Get Specific Promotion by ID
Write-Host "[5] Get Promotion by ID (ID=1)" -ForegroundColor Cyan
$promotion = Test-API "Get promotion ID 1" "GET" "$baseUrl/promotions/1"
if ($promotion) {
    Write-Host "   Name: $($promotion.name)" -ForegroundColor White
    Write-Host "   Type: $($promotion.type)" -ForegroundColor White
    Write-Host "   Level: $($promotion.promotionLevel)" -ForegroundColor White
    Write-Host ""
}

# Test 6: Find Best Order-Level Promotion for $750
Write-Host "[6] Find Best Promotion for `$750 Order" -ForegroundColor Cyan
$bestPromo = Test-API "Best promotion for `$750" "GET" "$baseUrl/promotions/order-level/best?orderAmount=750.00"
if ($bestPromo) {
    Write-Host "   Best: $($bestPromo.name)" -ForegroundColor White
    Write-Host "   Priority: $($bestPromo.priority), Discount: $($bestPromo.discountPercentage)%" -ForegroundColor White
    Write-Host ""
}

# Test 7: Calculate Order-Level Discount
Write-Host "[7] Calculate Order-Level Discount (ID=1, Amount=`$750)" -ForegroundColor Cyan
$discount = Test-API "Calculate order discount" "POST" "$baseUrl/promotions/order-level/calculate?promotionId=1``&orderAmount=750.00"
if ($discount) {
    Write-Host "   Discount: `$$discount" -ForegroundColor White
    Write-Host "   (10 percent of `$750 = `$75)" -ForegroundColor Gray
    Write-Host ""
}

# Test 8: Calculate Order-Level Discount with Max Cap
Write-Host "[8] Calculate Discount with Cap (ID=1, Amount=`$2000)" -ForegroundColor Cyan
$discount = Test-API "Calculate with cap" "POST" "$baseUrl/promotions/order-level/calculate?promotionId=1``&orderAmount=2000.00"
if ($discount) {
    Write-Host "   Discount: `$$discount" -ForegroundColor White
    Write-Host "   (10 percent of `$2000 = `$200, capped at `$100)" -ForegroundColor Gray
    Write-Host ""
}

# Test 9: Calculate Product-Level Discount (Buy 2 Get 1)
Write-Host "[9] Calculate Product-Level Discount (Buy 2 Get 1)" -ForegroundColor Cyan
$discount = Test-API "Calculate product discount" "POST" "$baseUrl/promotions/product-level/calculate?promotionId=5``&productPrice=100.00``&quantity=3"
if ($discount) {
    Write-Host "   Discount: `$$discount" -ForegroundColor White
    Write-Host "   (Buy 2 Get 1: 3 items = 1 free worth `$100)" -ForegroundColor Gray
    Write-Host ""
}

# Test 10: Get Promotions for Specific Product
Write-Host "[10] Get Promotions for Product ID=1" -ForegroundColor Cyan
$productPromos = Test-API "Get promotions for product 1" "GET" "$baseUrl/promotions/product/1"
if ($productPromos) {
    Write-Host "   Found $($productPromos.Count) applicable promotions" -ForegroundColor White
    Write-Host ""
}

# Test 11: Test Different Order Amounts
Write-Host "[11] Best Promotions for Various Order Amounts" -ForegroundColor Cyan
$amounts = @(250, 350, 600, 1100, 2500)
foreach ($amount in $amounts) {
    $best = Test-API "Best for `$$amount" "GET" "$baseUrl/promotions/order-level/best?orderAmount=$amount"
    if ($best) {
        $discUrl = "$baseUrl/promotions/order-level/calculate?promotionId=$($best.id)``&orderAmount=$amount"
        $disc = Invoke-RestMethod -Uri $discUrl -Method POST
        Write-Host "   `$$amount → $($best.name) → Save `$$disc" -ForegroundColor White
    } else {
        Write-Host "   `$$amount → No applicable promotion" -ForegroundColor Gray
    }
}
Write-Host ""

Write-Host "`n--- PART 2: COUPON API TESTS ---`n" -ForegroundColor Magenta

# Test 12: Get All Coupons
Write-Host "[12] Get All Coupons" -ForegroundColor Cyan
$allCoupons = Test-API "Get all coupons" "GET" "$baseUrl/coupons"
if ($allCoupons) {
    Write-Host "   Found $($allCoupons.Count) coupons" -ForegroundColor White
    Write-Host ""
}

# Test 13: Get Active Coupons
Write-Host "[13] Get Active Coupons" -ForegroundColor Cyan
$activeCoupons = Test-API "Get active coupons" "GET" "$baseUrl/coupons/active"
if ($activeCoupons) {
    Write-Host "   Active Coupons:" -ForegroundColor White
    $activeCoupons | ForEach-Object {
        Write-Host "      • Code: $($_.code) - $($_.name)" -ForegroundColor Gray
        Write-Host "        Type: $($_.discountType), Value: $($_.discountValue)" -ForegroundColor DarkGray
    }
    Write-Host ""
}

# Test 14: Get Coupon by Code
Write-Host "[14] Get Coupon by Code (SAVE15)" -ForegroundColor Cyan
$coupon = Test-API "Get coupon SAVE15" "GET" "$baseUrl/coupons/code/SAVE15"
if ($coupon) {
    Write-Host "   Name: $($coupon.name)" -ForegroundColor White
    Write-Host "   Type: $($coupon.discountType), Value: $($coupon.discountValue)" -ForegroundColor White
    Write-Host "   Min Order: `$$($coupon.minOrderAmount)" -ForegroundColor White
    Write-Host ""
}

# Test 15: Validate Coupon - Valid Case
Write-Host "[15] Validate Coupon (SAVE15, User=1, Amount=`$500)" -ForegroundColor Cyan
$validation = Test-API "Validate SAVE15" "POST" "$baseUrl/coupons/validate?code=SAVE15``&userId=1``&orderAmount=500.00"
if ($validation) {
    Write-Host "   Valid: $($validation.valid)" -ForegroundColor White
    Write-Host "   Discount: `$$($validation.discount)" -ForegroundColor White
    Write-Host "   Message: $($validation.message)" -ForegroundColor White
    Write-Host ""
}

# Test 16: Validate Coupon - Below Minimum
Write-Host "[16] Validate Coupon (Below Minimum - `$100)" -ForegroundColor Cyan
$validation = Test-API "Validate below minimum" "POST" "$baseUrl/coupons/validate?code=SAVE15``&userId=1``&orderAmount=100.00"
if ($validation) {
    Write-Host "   Valid: $($validation.valid)" -ForegroundColor White
    Write-Host "   Message: $($validation.message)" -ForegroundColor White
    Write-Host ""
}

# Test 17: Get Coupon by Code (FLAT30)
Write-Host "[17] Get Coupon by Code (FLAT30)" -ForegroundColor Cyan
$coupon = Test-API "Get coupon FLAT30" "GET" "$baseUrl/coupons/code/FLAT30"
if ($coupon) {
    Write-Host "   Name: $($coupon.name)" -ForegroundColor White
    Write-Host "   Type: $($coupon.discountType), Amount: `$$($coupon.discountValue)" -ForegroundColor White
    Write-Host ""
}

# Test 18: Validate Fixed Amount Coupon
Write-Host "[18] Validate Fixed Amount Coupon (FLAT30)" -ForegroundColor Cyan
$validation = Test-API "Validate FLAT30" "POST" "$baseUrl/coupons/validate?code=FLAT30``&userId=2``&orderAmount=200.00"
if ($validation) {
    Write-Host "   Valid: $($validation.valid)" -ForegroundColor White
    Write-Host "   Discount: `$$($validation.discount)" -ForegroundColor White
    Write-Host ""
}

# Test 19: Get Free Shipping Coupon
Write-Host "[19] Get Free Shipping Coupon (FREESHIP)" -ForegroundColor Cyan
$coupon = Test-API "Get coupon FREESHIP" "GET" "$baseUrl/coupons/code/FREESHIP"
if ($coupon) {
    Write-Host "   Name: $($coupon.name)" -ForegroundColor White
    Write-Host "   Type: $($coupon.discountType)" -ForegroundColor White
    Write-Host "   Min Order: `$$($coupon.minOrderAmount)" -ForegroundColor White
    Write-Host ""
}

# Test 20: Validate Free Shipping Coupon
Write-Host "[20] Validate Free Shipping Coupon (FREESHIP)" -ForegroundColor Cyan
$validation = Test-API "Validate FREESHIP" "POST" "$baseUrl/coupons/validate?code=FREESHIP``&userId=3``&orderAmount=75.00"
if ($validation) {
    Write-Host "   Valid: $($validation.valid)" -ForegroundColor White
    Write-Host "   Discount: `$$($validation.discount)" -ForegroundColor White
    Write-Host "   Message: $($validation.message)" -ForegroundColor White
    Write-Host ""
}

# Test 21: Get Specific Coupon by ID
Write-Host "[21] Get Coupon by ID (ID=1)" -ForegroundColor Cyan
$coupon = Test-API "Get coupon ID 1" "GET" "$baseUrl/coupons/1"
if ($coupon) {
    Write-Host "   Code: $($coupon.code)" -ForegroundColor White
    Write-Host "   Usage: $($coupon.usageCount) / $($coupon.usageLimit)" -ForegroundColor White
    Write-Host ""
}

# Test 22: Create New Coupon
Write-Host "[22] Create New Coupon (TEST50)" -ForegroundColor Cyan
$newCoupon = @{
    code = "TEST50"
    name = "Test Coupon 50% Off"
    description = "Test coupon for 50% discount"
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
}
$created = Test-API "Create coupon" "POST" "$baseUrl/coupons" $newCoupon
if ($created) {
    Write-Host "   Created: $($created.code)" -ForegroundColor White
    Write-Host "   ID: $($created.id)" -ForegroundColor White
    Write-Host ""
}

# Test 23: Validate Newly Created Coupon
if ($created) {
    Write-Host "[23] Validate Newly Created Coupon (TEST50)" -ForegroundColor Cyan
    $validation = Test-API "Validate TEST50" "POST" "$baseUrl/coupons/validate?code=TEST50``&userId=5``&orderAmount=300.00"
    if ($validation) {
        Write-Host "   Valid: $($validation.valid)" -ForegroundColor White
        Write-Host "   Discount: `$$($validation.discount)" -ForegroundColor White
        Write-Host "   (50 percent of `$300 = `$150)" -ForegroundColor Gray
        Write-Host ""
    }
}

# Test 24: Test Percentage Discount with Cap
Write-Host "[24] Test Percentage with Cap (TEST50, `$500 order)" -ForegroundColor Cyan
$validation = Test-API "Validate with cap" "POST" "$baseUrl/coupons/validate?code=TEST50``&userId=5``&orderAmount=500.00"
if ($validation) {
    Write-Host "   Valid: $($validation.valid)" -ForegroundColor White
    Write-Host "   Discount: `$$($validation.discount)" -ForegroundColor White
    Write-Host "   (50 percent of `$500 = `$250, capped at `$200)" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "`n--- TEST SUMMARY ---`n" -ForegroundColor Magenta
Write-Host "Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "Tests Failed: $testsFailed" -ForegroundColor Red
$total = $testsPassed + $testsFailed
$successRate = [math]::Round(($testsPassed / $total) * 100, 2)
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } else { "Yellow" })

Write-Host "`n" + "="*80 -ForegroundColor Cyan
Write-Host "    TESTING COMPLETE!" -ForegroundColor Cyan
Write-Host "="*80 -ForegroundColor Cyan
Write-Host "`n"

# Additional: Display Summary Tables
Write-Host "`n--- AVAILABLE COUPONS ---" -ForegroundColor Magenta
if ($activeCoupons) {
    $activeCoupons | Format-Table -Property @{
        Label="Code"; Expression={$_.code}
    }, @{
        Label="Name"; Expression={$_.name}
    }, @{
        Label="Type"; Expression={$_.discountType}
    }, @{
        Label="Value"; Expression={$_.discountValue}
    }, @{
        Label="Min Order"; Expression={"`$" + $_.minOrderAmount}
    } -AutoSize
}

Write-Host "`n--- ORDER-LEVEL PROMOTIONS ---" -ForegroundColor Magenta
if ($orderPromotions) {
    $orderPromotions | Format-Table -Property @{
        Label="ID"; Expression={$_.id}
    }, @{
        Label="Name"; Expression={$_.name}
    }, @{
        Label="Type"; Expression={$_.type}
    }, @{
        Label="Discount"; Expression={
            if ($_.discountPercentage) { "$($_.discountPercentage)%" }
            else { "`$$($_.discountAmount)" }
        }
    }, @{
        Label="Min Order"; Expression={"`$" + $_.minOrderAmount}
    }, @{
        Label="Priority"; Expression={$_.priority}
    } -AutoSize
}

Write-Host "`n--- PRODUCT-LEVEL PROMOTIONS ---" -ForegroundColor Magenta
if ($productPromotions) {
    $productPromotions | Format-Table -Property @{
        Label="ID"; Expression={$_.id}
    }, @{
        Label="Name"; Expression={$_.name}
    }, @{
        Label="Type"; Expression={$_.type}
    }, @{
        Label="Details"; Expression={
            if ($_.buyQuantity) { "Buy $($_.buyQuantity) Get $($_.getQuantity)" }
            elseif ($_.discountPercentage) { "$($_.discountPercentage)% OFF" }
            else { "`$$($_.discountAmount) OFF" }
        }
    }, @{
        Label="Priority"; Expression={$_.priority}
    } -AutoSize
}
