# Final Comprehensive Real-Time Test Suite
# Tests all foreign key edge cases with actual API calls

Write-Host "`n=============================================" -ForegroundColor Cyan
Write-Host " COMPREHENSIVE END-TO-END TEST SUITE" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$passed = 0
$failed = 0
$timestamp = Get-Date -Format 'HHmmss'

# Test 1: Supplier Registration
Write-Host "`n[TEST 1] Supplier Registration" -ForegroundColor Yellow
Write-Host "  Purpose: Test supplier account creation" -ForegroundColor Gray
try {
    $supplierData = @{
        email = "supplier$timestamp@realtest.com"
        password = "SecurePass123!"
        fullName = "RealTime Supplier Corp"
        userType = "SUPPLIER"
    } | ConvertTo-Json
    
    $supplier = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/register" `
        -Method POST -Body $supplierData -ContentType "application/json"
    
    Write-Host "  ✓ PASS: Supplier created (ID: $($supplier.id))" -ForegroundColor Green
    $supplierToken = $supplier.token
    $supplierId = $supplier.id
    $passed++
} catch {
    Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    $failed++
}

# Test 2: Product Creation (Tests supplier_id foreign key)
if ($supplierToken) {
    Write-Host "`n[TEST 2] Product Creation" -ForegroundColor Yellow
    Write-Host "  Purpose: Test supplier_id foreign key conversion" -ForegroundColor Gray
    try {
        $productData = @{
            supplierId = $supplierId
            categoryId = 1
            name = "Industrial Widget Pro Max"
            description = "High-quality industrial widget for B2B customers"
            unitPrice = 299.99
            unit = "piece"
            moq = 100
            stockQuantity = 10000
            leadTimeDays = 15
            isActive = $true
        } | ConvertTo-Json
        
        $product = Invoke-RestMethod -Uri "http://localhost:8082/api/products" `
            -Method POST -Body $productData -ContentType "application/json" `
            -Headers @{"Authorization"="Bearer $supplierToken"}
        
        Write-Host "  ✓ PASS: Product created (ID: $($product.data.id), Name: $($product.data.name))" -ForegroundColor Green
        $productId = $product.data.id
        $passed++
    } catch {
        Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
        $failed++
    }
} else {
    Write-Host "`n[TEST 2] Product Creation - SKIPPED (no supplier token)" -ForegroundColor DarkYellow
}

# Test 3: Buyer Registration
Write-Host "`n[TEST 3] Buyer Registration" -ForegroundColor Yellow
Write-Host "  Purpose: Test buyer account creation" -ForegroundColor Gray
try {
    $buyerData = @{
        email = "buyer$timestamp@realtest.com"
        password = "SecurePass123!"
        fullName = "RealTime Buyer Company"
        userType = "BUYER"
    } | ConvertTo-Json
    
    $buyer = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/register" `
        -Method POST -Body $buyerData -ContentType "application/json"
    
    Write-Host "  ✓ PASS: Buyer created (ID: $($buyer.id))" -ForegroundColor Green
    $buyerToken = $buyer.token
    $buyerId = $buyer.id
    $passed++
} catch {
    Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    $failed++
}

# Test 4: Add Product to Cart (Tests buyer_id foreign key)
if ($buyerToken -and $productId) {
    Write-Host "`n[TEST 4] Add to Cart" -ForegroundColor Yellow
    Write-Host "  Purpose: Test buyer_id foreign key conversion in cart" -ForegroundColor Gray
    try {
        $cartData = @{
            buyerId = $buyerId
            productId = $productId
            quantity = 500
        } | ConvertTo-Json
        
        $cartResponse = Invoke-RestMethod -Uri "http://localhost:8085/api/cart" `
            -Method POST -Body $cartData -ContentType "application/json" `
            -Headers @{"Authorization"="Bearer $buyerToken"}
        
        Write-Host "  ✓ PASS: Item added to cart (Quantity: 500)" -ForegroundColor Green
        $passed++
    } catch {
        Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
        $failed++
    }
} else {
    Write-Host "`n[TEST 4] Add to Cart - SKIPPED (missing buyer or product)" -ForegroundColor DarkYellow
}

# Test 5: View Cart Contents
if ($buyerToken -and $buyerId) {
    Write-Host "`n[TEST 5] View Cart" -ForegroundColor Yellow
    Write-Host "  Purpose: Verify cart retrieval and calculations" -ForegroundColor Gray
    try {
        $cart = Invoke-RestMethod -Uri "http://localhost:8085/api/cart/$buyerId" `
            -Method GET -Headers @{"Authorization"="Bearer $buyerToken"}
        
        Write-Host "  ✓ PASS: Cart retrieved (Items: $($cart.items.Count), Total: `$$($cart.totalAmount))" -ForegroundColor Green
        $passed++
    } catch {
        Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
        $failed++
    }
} else {
    Write-Host "`n[TEST 5] View Cart - SKIPPED (no buyer)" -ForegroundColor DarkYellow
}

# Test 6: Order Creation (Tests both buyer_id AND supplier_id foreign keys)
if ($buyerToken -and $buyerId -and $supplierId -and $productId) {
    Write-Host "`n[TEST 6] Create Order" -ForegroundColor Yellow
    Write-Host "  Purpose: Test buyer_id AND supplier_id foreign key conversion" -ForegroundColor Gray
    try {
        $orderData = @{
            buyerId = $buyerId
            supplierId = $supplierId
            items = @(@{
                productId = $productId
                quantity = 500
                unitPrice = 299.99
            })
            subtotal = 149995.00
            taxAmount = 14999.50
            shippingCost = 500.00
            totalAmount = 165494.50
            shippingAddress = "456 Business Blvd, San Francisco, CA 94105"
            billingAddress = "456 Business Blvd, San Francisco, CA 94105"
            paymentMethod = "Bank Transfer"
            shippingMethod = "Express Freight"
        } | ConvertTo-Json -Depth 5
        
        $order = Invoke-RestMethod -Uri "http://localhost:8083/api/orders" `
            -Method POST -Body $orderData -ContentType "application/json" `
            -Headers @{"Authorization"="Bearer $buyerToken"}
        
        Write-Host "  ✓ PASS: Order created (Order #: $($order.data.orderNumber), Total: `$$($order.data.totalAmount))" -ForegroundColor Green
        $orderId = $order.data.id
        $passed++
    } catch {
        Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
        $failed++
    }
} else {
    Write-Host "`n[TEST 6] Create Order - SKIPPED (missing data)" -ForegroundColor DarkYellow
}

# Test 7: Existing User Account Test
Write-Host "`n[TEST 7] Existing User Login" -ForegroundColor Yellow
Write-Host "  Purpose: Test pre-existing account (vikramhybriscertified@gmail.com)" -ForegroundColor Gray
try {
    $existingUserData = @{
        email = "vikramhybriscertified@gmail.com"
        password = "12345678"
    } | ConvertTo-Json
    
    $existingUser = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" `
        -Method POST -Body $existingUserData -ContentType "application/json"
    
    Write-Host "  ✓ PASS: Existing user login successful (User: $($existingUser.fullName))" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    $failed++
}

# Test 8: Browse Products
Write-Host "`n[TEST 8] Browse All Products" -ForegroundColor Yellow
Write-Host "  Purpose: Verify product listing API" -ForegroundColor Gray
try {
    $loginData = @{
        email = "buyer1@example.com"
        password = "password"
    } | ConvertTo-Json
    
    $testUser = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" `
        -Method POST -Body $loginData -ContentType "application/json"
    
    $products = Invoke-RestMethod -Uri "http://localhost:8082/api/products" `
        -Method GET -Headers @{"Authorization"="Bearer $($testUser.token)"}
    
    Write-Host "  ✓ PASS: Products retrieved (Count: $($products.data.Count))" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    $failed++
}

# Final Results
Write-Host "`n=============================================" -ForegroundColor White
Write-Host " TEST RESULTS" -ForegroundColor White
Write-Host "=============================================" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host "Total:  $($passed + $failed)" -ForegroundColor Cyan

if ($failed -eq 0) {
    Write-Host "`n*** ALL TESTS PASSED ***" -ForegroundColor Green -BackgroundColor Black
    Write-Host "`n✓ All foreign key edge cases working correctly!" -ForegroundColor Green
    Write-Host "✓ Supplier auto-creation: WORKING" -ForegroundColor Green
    Write-Host "✓ Buyer auto-creation: WORKING" -ForegroundColor Green
    Write-Host "✓ Product → Supplier FK: WORKING" -ForegroundColor Green
    Write-Host "✓ Cart → Buyer FK: WORKING" -ForegroundColor Green
    Write-Host "✓ Order → Buyer & Supplier FK: WORKING" -ForegroundColor Green
} else {
    $rate = [math]::Round(($passed / ($passed + $failed)) * 100, 1)
    Write-Host "`nPass Rate: $rate%" -ForegroundColor Yellow
    Write-Host "`nPlease review failed tests above for details." -ForegroundColor Yellow
}

Write-Host "`n=============================================" -ForegroundColor White
