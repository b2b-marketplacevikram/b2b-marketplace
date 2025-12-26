# Quick Service Health Check and Real-World Tests

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " B2B Marketplace - Service Test Suite" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$passed = 0
$failed = 0

# Test 1: Login with existing account
Write-Host "[1] Testing User Login (buyer1@example.com)..." -ForegroundColor Yellow
try {
    $loginData = @{
        email = "buyer1@example.com"
        password = "password"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" `
        -Method POST -Body $loginData -ContentType "application/json"
    
    if ($response.token) {
        Write-Host "  [PASS] Login successful - Token received" -ForegroundColor Green
        $token1 = $response.token
        $passed++
    }
} catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "         Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    $failed++
}

# Test 2: Browse Products
Write-Host "`n[2] Testing Product Browse..." -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "http://localhost:8082/api/products" `
        -Method GET -Headers @{"Authorization"="Bearer $token1"}
    
    Write-Host "  [PASS] Retrieved $($products.Count) products" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "         Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    $failed++
}

# Test 3: Register New Supplier
Write-Host "`n[3] Testing Supplier Registration..." -ForegroundColor Yellow
try {
    $supplierData = @{
        email = "testsupplier$(Get-Date -Format 'HHmmss')@test.com"
        password = "Test123"
        fullName = "Test Supplier Co"
        userType = "SUPPLIER"
    } | ConvertTo-Json
    
    $supplier = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/register" `
        -Method POST -Body $supplierData -ContentType "application/json"
    
    if ($supplier.token) {
        Write-Host "  [PASS] Supplier registered - ID: $($supplier.id)" -ForegroundColor Green
        $supplierToken = $supplier.token
        $supplierId = $supplier.id
        $passed++
    }
} catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "         Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    $failed++
}

# Test 4: Create Product (tests supplier_id conversion)
if ($supplierToken) {
    Write-Host "`n[4] Testing Product Creation (Foreign Key Test)..." -ForegroundColor Yellow
    try {
        $productData = @{
            supplierId = $supplierId
            categoryId = 1
            name = "Test Product - Auto Test"
            description = "Testing foreign key conversion"
            unitPrice = 100
            unit = "piece"
            moq = 10
            stockQuantity = 1000
            leadTimeDays = 5
            isActive = $true
        } | ConvertTo-Json
        
        $product = Invoke-RestMethod -Uri "http://localhost:8082/api/products" `
            -Method POST -Body $productData -ContentType "application/json" `
            -Headers @{"Authorization"="Bearer $supplierToken"}
        
        if ($product.id) {
            Write-Host "  [PASS] Product created - ID: $($product.id)" -ForegroundColor Green
            $productId = $product.id
            $passed++
        }
    } catch {
        Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "         Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
        $failed++
    }
}

# Test 5: Register New Buyer
Write-Host "`n[5] Testing Buyer Registration..." -ForegroundColor Yellow
try {
    $buyerData = @{
        email = "testbuyer$(Get-Date -Format 'HHmmss')@test.com"
        password = "Test123"
        fullName = "Test Buyer Corp"
        userType = "BUYER"
    } | ConvertTo-Json
    
    $buyer = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/register" `
        -Method POST -Body $buyerData -ContentType "application/json"
    
    if ($buyer.token) {
        Write-Host "  [PASS] Buyer registered - ID: $($buyer.id)" -ForegroundColor Green
        $buyerToken = $buyer.token
        $buyerId = $buyer.id
        $passed++
    }
} catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "         Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    $failed++
}

# Test 6: Add to Cart (tests buyer_id conversion)
if ($buyerToken -and $productId) {
    Write-Host "`n[6] Testing Add to Cart (Foreign Key Test)..." -ForegroundColor Yellow
    try {
        $cartData = @{
            buyerId = $buyerId
            productId = $productId
            quantity = 50
        } | ConvertTo-Json
        
        $cartItem = Invoke-RestMethod -Uri "http://localhost:8081/api/cart/add" `
            -Method POST -Body $cartData -ContentType "application/json" `
            -Headers @{"Authorization"="Bearer $buyerToken"}
        
        Write-Host "  [PASS] Added to cart successfully" -ForegroundColor Green
        $passed++
    } catch {
        Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "         Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
        $failed++
    }
}

# Test 7: View Cart
if ($buyerToken) {
    Write-Host "`n[7] Testing View Cart..." -ForegroundColor Yellow
    try {
        $cart = Invoke-RestMethod -Uri "http://localhost:8085/api/cart/$buyerId" `
            -Method GET -Headers @{"Authorization"="Bearer $buyerToken"}
        
        Write-Host "  [PASS] Cart retrieved - Total: $($cart.totalAmount)" -ForegroundColor Green
        $passed++
    } catch {
        Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "         Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
        $failed++
    }
}

# Test 8: Create Order (tests both buyer_id and supplier_id conversion)
if ($buyerToken -and $supplierId -and $productId) {
    Write-Host "`n[8] Testing Order Creation (Dual Foreign Key Test)..." -ForegroundColor Yellow
    try {
        $orderData = @{
            buyerId = $buyerId
            supplierId = $supplierId
            items = @(@{
                productId = $productId
                quantity = 50
                unitPrice = 100
            })
            subtotal = 5000
            taxAmount = 500
            shippingCost = 100
            totalAmount = 5600
            shippingAddress = "123 Test St, Test City"
            billingAddress = "123 Test St, Test City"
            paymentMethod = "Bank Transfer"
            shippingMethod = "Standard"
        } | ConvertTo-Json -Depth 5
        
        $order = Invoke-RestMethod -Uri "http://localhost:8083/api/orders" `
            -Method POST -Body $orderData -ContentType "application/json" `
            -Headers @{"Authorization"="Bearer $buyerToken"}
        
        if ($order.id) {
            Write-Host "  [PASS] Order created - Order #: $($order.orderNumber)" -ForegroundColor Green
            $orderId = $order.id
            $passed++
        }
    } catch {
        Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "         Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
        $failed++
    }
}

# Test 9: Your Account Test
Write-Host "`n[9] Testing Your Account (vikramhybriscertified@gmail.com)..." -ForegroundColor Yellow
try {
    $yourData = @{
        email = "vikramhybriscertified@gmail.com"
        password = "12345678"
    } | ConvertTo-Json
    
    $yourAccount = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" `
        -Method POST -Body $yourData -ContentType "application/json"
    
    if ($yourAccount.token) {
        Write-Host "  [PASS] Your account login successful" -ForegroundColor Green
        Write-Host "         Name: $($yourAccount.fullName)" -ForegroundColor Cyan
        Write-Host "         User ID: $($yourAccount.id)" -ForegroundColor Cyan
        $passed++
    }
} catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "         Error Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    $failed++
}

# Summary
Write-Host "`n========================================" -ForegroundColor White
Write-Host " TEST RESULTS" -ForegroundColor White
Write-Host "========================================" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host "Total: $($passed + $failed)" -ForegroundColor Cyan

if ($failed -eq 0) {
    Write-Host "`n*** ALL TESTS PASSED ***" -ForegroundColor Green -BackgroundColor Black
    Write-Host "`nAll foreign key edge cases working correctly!" -ForegroundColor Green
} else {
    $rate = [math]::Round(($passed / ($passed + $failed)) * 100, 1)
    Write-Host "`nPass Rate: $rate%" -ForegroundColor Yellow
}

Write-Host "`n========================================`n" -ForegroundColor White
