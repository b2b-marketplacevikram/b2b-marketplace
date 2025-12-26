# B2B Marketplace - Real-World End-to-End Tests
# Simulates complete user journeys

$baseUrl = "http://localhost"
$passCount = 0
$failCount = 0

function Run-Test {
    param($name, $method, $url, $body, $token, $expect = 200)
    
    Write-Host "`nTest: $name" -ForegroundColor Yellow
    
    try {
        $headers = @{"Content-Type" = "application/json"}
        if ($token) { $headers["Authorization"] = "Bearer $token" }
        
        $params = @{
            Uri = $url
            Method = $method
            Headers = $headers
            UseBasicParsing = $true
        }
        
        if ($body) {
            $params.Body = ($body | ConvertTo-Json -Depth 5)
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -eq $expect) {
            Write-Host "  [PASS] $($response.StatusCode)" -ForegroundColor Green
            $script:passCount++
            return ($response.Content | ConvertFrom-Json)
        }
    } catch {
        Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
        $script:failCount++
    }
    return $null
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " Real-World B2B Marketplace Test Scenarios" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# SCENARIO 1: New Supplier registers and lists products
Write-Host "`n--- SCENARIO 1: Supplier Creates Products ---" -ForegroundColor Magenta

$supplier = Run-Test "Supplier Registration" POST "$baseUrl:8081/api/auth/register" @{
    email = "newtech@supplier.com"
    password = "Pass123"
    fullName = "NewTech Supplies"
    userType = "SUPPLIER"
}

if ($supplier) {
    $product1 = Run-Test "Create Product (Laptops)" POST "$baseUrl:8082/api/products" @{
        supplierId = $supplier.id
        categoryId = 1
        name = "Bulk Laptop Order - 500 Units"
        description = "Business laptops in bulk"
        unitPrice = 450
        unit = "piece"
        moq = 500
        stockQuantity = 5000
        leadTimeDays = 15
        isActive = $true
    } $supplier.token
    
    $product2 = Run-Test "Create Product (Mice)" POST "$baseUrl:8082/api/products" @{
        supplierId = $supplier.id
        categoryId = 1
        name = "Wireless Mouse - 1000 Units"
        description = "Ergonomic wireless mouse"
        unitPrice = 8.5
        unit = "piece"
        moq = 1000
        stockQuantity = 10000
        leadTimeDays = 7
        isActive = $true
    } $supplier.token
}

# SCENARIO 2: New Buyer shops and places order
Write-Host "`n--- SCENARIO 2: Buyer Shopping Journey ---" -ForegroundColor Magenta

$buyer = Run-Test "Buyer Registration" POST "$baseUrl:8081/api/auth/register" @{
    email = "corporate@buyer.com"
    password = "Buy123"
    fullName = "Corporate Buyer Ltd"
    userType = "BUYER"
}

if ($buyer) {
    Run-Test "Browse Products" GET "$baseUrl:8082/api/products" $null $buyer.token
    
    Run-Test "Search Products" GET "$baseUrl:8082/api/products/search?keyword=laptop" $null $buyer.token
    
    if ($product1) {
        Run-Test "Add to Cart (Laptops)" POST "$baseUrl:8081/api/cart/add" @{
            buyerId = $buyer.id
            productId = $product1.id
            quantity = 500
        } $buyer.token
    }
    
    if ($product2) {
        Run-Test "Add to Cart (Mice)" POST "$baseUrl:8081/api/cart/add" @{
            buyerId = $buyer.id
            productId = $product2.id
            quantity = 2000
        } $buyer.token
    }
    
    $cart = Run-Test "View Cart" GET "$baseUrl:8081/api/cart?userId=$($buyer.id)" $null $buyer.token
    
    if ($cart) {
        Write-Host "  Cart Total: $($cart.totalAmount)" -ForegroundColor Cyan
    }
}

# SCENARIO 3: Place and process order
Write-Host "`n--- SCENARIO 3: Order Processing ---" -ForegroundColor Magenta

if ($buyer -and $supplier -and $product1) {
    $order = Run-Test "Create Order" POST "$baseUrl:8083/api/orders" @{
        buyerId = $buyer.id
        supplierId = $supplier.id
        items = @(@{
            productId = $product1.id
            quantity = 500
            unitPrice = 450
        })
        subtotal = 225000
        taxAmount = 22500
        shippingCost = 500
        totalAmount = 248000
        shippingAddress = "123 Business St, NYC"
        billingAddress = "123 Business St, NYC"
        paymentMethod = "Bank Transfer"
        shippingMethod = "Air Freight"
    } $buyer.token
    
    if ($order) {
        Write-Host "  Order #: $($order.orderNumber)" -ForegroundColor Cyan
        
        Run-Test "View Order Details" GET "$baseUrl:8083/api/orders/$($order.id)" $null $buyer.token
        
        Run-Test "Supplier Confirms" PUT "$baseUrl:8083/api/orders/$($order.id)/status" @{
            status = "CONFIRMED"
            notes = "Order confirmed"
        } $supplier.token
        
        Run-Test "Mark as Shipped" PUT "$baseUrl:8083/api/orders/$($order.id)/status" @{
            status = "SHIPPED"
            notes = "Shipped via DHL"
        } $supplier.token
    }
}

# SCENARIO 4: Test your actual account
Write-Host "`n--- SCENARIO 4: Your Account Test ---" -ForegroundColor Magenta

$yourAccount = Run-Test "Login Your Account" POST "$baseUrl:8081/api/auth/login" @{
    email = "vikramhybriscertified@gmail.com"
    password = "vikram"
}

if ($yourAccount) {
    Run-Test "Your Account - Browse" GET "$baseUrl:8082/api/products" $null $yourAccount.token
    
    if ($product2) {
        Run-Test "Your Account - Add to Cart" POST "$baseUrl:8081/api/cart/add" @{
            buyerId = $yourAccount.id
            productId = $product2.id
            quantity = 1000
        } $yourAccount.token
    }
    
    Run-Test "Your Account - View Cart" GET "$baseUrl:8081/api/cart?userId=$($yourAccount.id)" $null $yourAccount.token
}

# Summary
Write-Host "`n============================================" -ForegroundColor White
Write-Host " TEST SUMMARY" -ForegroundColor White
Write-Host "============================================" -ForegroundColor White
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host "Total: $($passCount + $failCount)" -ForegroundColor Cyan

if ($failCount -eq 0) {
    Write-Host "`n*** ALL TESTS PASSED ***" -ForegroundColor Green
} else {
    $rate = [math]::Round(($passCount / ($passCount + $failCount)) * 100, 1)
    Write-Host "`nPass Rate: $rate%" -ForegroundColor Yellow
}
