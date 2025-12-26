# Real-World B2B Marketplace Test Scenarios
# Tests complete user journeys from registration to order completion

$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost"

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "     B2B MARKETPLACE - REAL-WORLD TEST SCENARIOS            " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# Test counters
$global:passCount = 0
$global:failCount = 0
$global:totalTests = 0

function Test-Endpoint {
    param($name, $method, $url, $body = $null, $headers = @{}, $expectedStatus = 200)
    
    $global:totalTests++
    Write-Host "`n[$global:totalTests] Testing: $name" -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = $url
            Method = $method
            ContentType = "application/json"
            UseBasicParsing = $true
        }
        
        if ($headers.Count -gt 0) {
            $params.Headers = $headers
        }
        
        if ($body) {
            $params.Body = ($body | ConvertTo-Json -Depth 10)
            Write-Host "Request: $($params.Body)" -ForegroundColor Gray
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -eq $expectedStatus) {
            Write-Host "✓ PASSED - Status: $($response.StatusCode)" -ForegroundColor Green
            $global:passCount++
            
            if ($response.Content) {
                $result = $response.Content | ConvertFrom-Json
                return $result
            }
            return $response
        } else {
            Write-Host "✗ FAILED - Expected: $expectedStatus, Got: $($response.StatusCode)" -ForegroundColor Red
            $global:failCount++
            return $null
        }
    } catch {
        Write-Host "✗ FAILED - Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
        $global:failCount++
        return $null
    }
}

# ============================================================================
# SCENARIO 1: New Supplier Registration and Product Listing
# ============================================================================
Write-Host "`n`n============================================================" -ForegroundColor Magenta
Write-Host "SCENARIO 1: Tech Supplier Journey" -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta

# 1.1 Supplier registers
$supplierData = @{
    email = "techsupplier@example.com"
    password = "SecurePass123"
    fullName = "Tech Solutions Ltd"
    userType = "SUPPLIER"
}

$supplier = Test-Endpoint -name "Supplier Registration" `
    -method "POST" `
    -url "$baseUrl:8081/api/auth/register" `
    -body $supplierData `
    -expectedStatus 200

if ($supplier) {
    $supplierToken = $supplier.token
    $supplierUserId = $supplier.id
    Write-Host "Supplier registered - User ID: $supplierUserId" -ForegroundColor Cyan
    
    # 1.2 Supplier creates first product
    $product1 = @{
        supplierId = $supplierUserId
        categoryId = 1
        name = "Industrial Laptop - 500 Units Bulk"
        description = "Rugged laptops for industrial use, bulk order"
        unitPrice = 450.00
        unit = "piece"
        moq = 500
        stockQuantity = 5000
        leadTimeDays = 15
        origin = "Taiwan"
        brand = "TechPro"
        model = "TP-500"
        specifications = "Intel i7, 16GB RAM, 512GB SSD"
        isActive = $true
        isFeatured = $true
    }
    
    $createdProduct1 = Test-Endpoint -name "Create Product 1 (Laptops)" `
        -method "POST" `
        -url "$baseUrl:8082/api/products" `
        -body $product1 `
        -headers @{ "Authorization" = "Bearer $supplierToken" } `
        -expectedStatus 200
    
    # 1.3 Supplier creates second product
    $product2 = @{
        supplierId = $supplierUserId
        categoryId = 1
        name = "Wireless Mouse - Bulk Pack"
        description = "Ergonomic wireless mouse, wholesale"
        unitPrice = 8.50
        unit = "piece"
        moq = 1000
        stockQuantity = 10000
        leadTimeDays = 7
        origin = "China"
        brand = "TechPro"
        model = "TP-M100"
        specifications = "2.4GHz wireless, 3 buttons, ergonomic design"
        isActive = $true
        isFeatured = $false
    }
    
    $createdProduct2 = Test-Endpoint -name "Create Product 2 (Mouse)" `
        -method "POST" `
        -url "$baseUrl:8082/api/products" `
        -body $product2 `
        -headers @{ "Authorization" = "Bearer $supplierToken" } `
        -expectedStatus 200
    
    # 1.4 Supplier views their products
    Test-Endpoint -name "Supplier Views Own Products" `
        -method "GET" `
        -url "$baseUrl:8082/api/products/supplier/$supplierUserId" `
        -headers @{ "Authorization" = "Bearer $supplierToken" } `
        -expectedStatus 200
}

# ============================================================================
# SCENARIO 2: New Buyer Registration and Shopping Journey
# ============================================================================
Write-Host "`n`n═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "SCENARIO 2: Corporate Buyer Journey" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta

# 2.1 Buyer registers
$buyerData = @{
    email = "corpbuyer@example.com"
    password = "BuyerPass123"
    fullName = "Corporate Procurement Inc"
    userType = "BUYER"
}

$buyer = Test-Endpoint -name "Buyer Registration" `
    -method "POST" `
    -url "$baseUrl:8081/api/auth/register" `
    -body $buyerData `
    -expectedStatus 200

if ($buyer) {
    $buyerToken = $buyer.token
    $buyerUserId = $buyer.id
    Write-Host "Buyer registered - User ID: $buyerUserId" -ForegroundColor Cyan
    
    # 2.2 Buyer browses products
    Test-Endpoint -name "Browse All Products" `
        -method "GET" `
        -url "$baseUrl:8082/api/products" `
        -headers @{ "Authorization" = "Bearer $buyerToken" } `
        -expectedStatus 200
    
    # 2.3 Buyer searches for laptops
    Test-Endpoint -name "Search for 'Laptop'" `
        -method "GET" `
        -url "$baseUrl:8082/api/products/search?keyword=laptop" `
        -headers @{ "Authorization" = "Bearer $buyerToken" } `
        -expectedStatus 200
    
    # 2.4 Buyer views product details
    if ($createdProduct1 -and $createdProduct1.id) {
        Test-Endpoint -name "View Laptop Product Details" `
            -method "GET" `
            -url "$baseUrl:8082/api/products/$($createdProduct1.id)" `
            -headers @{ "Authorization" = "Bearer $buyerToken" } `
            -expectedStatus 200
    }
    
    # 2.5 Buyer adds laptop to cart (500 units = MOQ)
    if ($createdProduct1 -and $createdProduct1.id) {
        $addToCart1 = @{
            buyerId = $buyerUserId
            productId = $createdProduct1.id
            quantity = 500
        }
        
        Test-Endpoint -name "Add Laptops to Cart (500 units)" `
            -method "POST" `
            -url "$baseUrl:8081/api/cart/add" `
            -body $addToCart1 `
            -headers @{ "Authorization" = "Bearer $buyerToken" } `
            -expectedStatus 200
    }
    
    # 2.6 Buyer adds mouse to cart (2000 units)
    if ($createdProduct2 -and $createdProduct2.id) {
        $addToCart2 = @{
            buyerId = $buyerUserId
            productId = $createdProduct2.id
            quantity = 2000
        }
        
        Test-Endpoint -name "Add Mouse to Cart (2000 units)" `
            -method "POST" `
            -url "$baseUrl:8081/api/cart/add" `
            -body $addToCart2 `
            -headers @{ "Authorization" = "Bearer $buyerToken" } `
            -expectedStatus 200
    }
    
    # 2.7 Buyer views cart
    $cart = Test-Endpoint -name "View Shopping Cart" `
        -method "GET" `
        -url "$baseUrl:8081/api/cart?userId=$buyerUserId" `
        -headers @{ "Authorization" = "Bearer $buyerToken" } `
        -expectedStatus 200
    
    if ($cart) {
        Write-Host "Cart Total: $($cart.totalAmount)" -ForegroundColor Cyan
        Write-Host "Total Items: $($cart.totalItems)" -ForegroundColor Cyan
    }
}

# ============================================================================
# SCENARIO 3: Order Placement and Processing
# ============================================================================
Write-Host "`n`n═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "SCENARIO 3: Order Creation and Processing" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta

if ($buyer -and $supplier -and $createdProduct1) {
    # 3.1 Buyer creates order
    $orderData = @{
        buyerId = $buyerUserId
        supplierId = $supplierUserId
        items = @(
            @{
                productId = $createdProduct1.id
                quantity = 500
                unitPrice = 450.00
            }
        )
        subtotal = 225000.00
        taxAmount = 22500.00
        shippingCost = 500.00
        totalAmount = 248000.00
        shippingAddress = "123 Business Park, New York, NY 10001, USA"
        billingAddress = "123 Business Park, New York, NY 10001, USA"
        paymentMethod = "Bank Transfer"
        shippingMethod = "Air Freight"
        notes = "Urgent order - Please expedite shipping"
    }
    
    $order = Test-Endpoint -name "Create Order (500 Laptops)" `
        -method "POST" `
        -url "$baseUrl:8083/api/orders" `
        -body $orderData `
        -headers @{ "Authorization" = "Bearer $buyerToken" } `
        -expectedStatus 200
    
    if ($order) {
        $orderId = $order.id
        $orderNumber = $order.orderNumber
        Write-Host "Order Created - Order #: $orderNumber, Total: $($order.totalAmount)" -ForegroundColor Cyan
        
        # 3.2 Buyer views order details
        Test-Endpoint -name "View Order Details" `
            -method "GET" `
            -url "$baseUrl:8083/api/orders/$orderId" `
            -headers @{ "Authorization" = "Bearer $buyerToken" } `
            -expectedStatus 200
        
        # 3.3 Buyer views all their orders
        Test-Endpoint -name "View All Buyer Orders" `
            -method "GET" `
            -url "$baseUrl:8083/api/orders/buyer/$buyerUserId" `
            -headers @{ "Authorization" = "Bearer $buyerToken" } `
            -expectedStatus 200
        
        # 3.4 Supplier views orders for their products
        Test-Endpoint -name "View Supplier Orders" `
            -method "GET" `
            -url "$baseUrl:8083/api/orders/supplier/$supplierUserId" `
            -headers @{ "Authorization" = "Bearer $supplierToken" } `
            -expectedStatus 200
        
        # 3.5 Supplier confirms order
        $confirmData = @{
            status = "CONFIRMED"
            notes = "Order confirmed. Production started."
        }
        
        Test-Endpoint -name "Supplier Confirms Order" `
            -method "PUT" `
            -url "$baseUrl:8083/api/orders/$orderId/status" `
            -body $confirmData `
            -headers @{ "Authorization" = "Bearer $supplierToken" } `
            -expectedStatus 200
        
        Start-Sleep -Seconds 1
        
        # 3.6 Supplier marks as shipped
        $shipData = @{
            status = "SHIPPED"
            notes = "Shipped via DHL - Tracking: DHL123456789"
        }
        
        Test-Endpoint -name "Supplier Ships Order" `
            -method "PUT" `
            -url "$baseUrl:8083/api/orders/$orderId/status" `
            -body $shipData `
            -headers @{ "Authorization" = "Bearer $supplierToken" } `
            -expectedStatus 200
        
        Start-Sleep -Seconds 1
        
        # 3.7 Buyer marks as delivered
        $deliverData = @{
            status = "DELIVERED"
            notes = "Goods received in good condition"
        }
        
        Test-Endpoint -name "Mark Order as Delivered" `
            -method "PUT" `
            -url "$baseUrl:8083/api/orders/$orderId/status" `
            -body $deliverData `
            -headers @{ "Authorization" = "Bearer $buyerToken" } `
            -expectedStatus 200
    }
}

# ============================================================================
# SCENARIO 4: Payment Processing
# ============================================================================
Write-Host "`n`n═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "SCENARIO 4: Payment Processing" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta

if ($order -and $orderId) {
    # 4.1 Process bank transfer payment
    $paymentData = @{
        orderId = $orderId
        amount = 248000.00
        paymentMethod = "BANK_TRANSFER"
        currency = "USD"
        transactionReference = "BT-2024-" + (Get-Date -Format "yyyyMMddHHmmss")
    }
    
    Test-Endpoint -name "Process Bank Transfer Payment" `
        -method "POST" `
        -url "$baseUrl:8084/api/payments/process" `
        -body $paymentData `
        -headers @{ "Authorization" = "Bearer $buyerToken" } `
        -expectedStatus 200
    
    # 4.2 View payment history
    Test-Endpoint -name "View Payment Transactions" `
        -method "GET" `
        -url "$baseUrl:8084/api/payments/order/$orderId" `
        -headers @{ "Authorization" = "Bearer $buyerToken" } `
        -expectedStatus 200
}

# ============================================================================
# SCENARIO 5: Messaging Between Buyer and Supplier
# ============================================================================
Write-Host "`n`n═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "SCENARIO 5: Buyer-Supplier Communication" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta

if ($buyer -and $supplier) {
    # 5.1 Buyer sends message to supplier
    $messageData = @{
        buyerId = $buyerUserId
        supplierId = $supplierUserId
        message = "Hi, I need to discuss customization options for bulk orders."
    }
    
    Test-Endpoint -name "Buyer Sends Message to Supplier" `
        -method "POST" `
        -url "$baseUrl:8091/api/messaging/send" `
        -body $messageData `
        -headers @{ "Authorization" = "Bearer $buyerToken" } `
        -expectedStatus 200
    
    # 5.2 Supplier replies
    $replyData = @{
        buyerId = $buyerUserId
        supplierId = $supplierUserId
        message = "Hello! We offer various customization options. What are your requirements?"
    }
    
    Test-Endpoint -name "Supplier Replies to Message" `
        -method "POST" `
        -url "$baseUrl:8091/api/messaging/send" `
        -body $replyData `
        -headers @{ "Authorization" = "Bearer $supplierToken" } `
        -expectedStatus 200
    
    # 5.3 Buyer views conversation
    Test-Endpoint -name "View Conversation History" `
        -method "GET" `
        -url "$baseUrl:8091/api/messaging/conversation/$buyerUserId/$supplierUserId" `
        -headers @{ "Authorization" = "Bearer $buyerToken" } `
        -expectedStatus 200
}

# ============================================================================
# SCENARIO 6: Notifications
# ============================================================================
Write-Host "`n`n═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "SCENARIO 6: User Notifications" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta

if ($buyer -and $supplier) {
    # 6.1 Buyer views notifications
    Test-Endpoint -name "View Buyer Notifications" `
        -method "GET" `
        -url "$baseUrl:8086/api/notifications/user/$buyerUserId" `
        -headers @{ "Authorization" = "Bearer $buyerToken" } `
        -expectedStatus 200
    
    # 6.2 Supplier views notifications
    Test-Endpoint -name "View Supplier Notifications" `
        -method "GET" `
        -url "$baseUrl:8086/api/notifications/user/$supplierUserId" `
        -headers @{ "Authorization" = "Bearer $supplierToken" } `
        -expectedStatus 200
}

# ============================================================================
# SCENARIO 7: Using Existing User Account
# ============================================================================
Write-Host "`n`n═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "SCENARIO 7: Your Registered Account Testing" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta

# 7.1 Login with your account
$yourLogin = @{
    email = "vikramhybriscertified@gmail.com"
    password = "vikram"  # Replace with your actual password if different
}

$yourAccount = Test-Endpoint -name "Login with Your Account" `
    -method "POST" `
    -url "$baseUrl:8081/api/auth/login" `
    -body $yourLogin `
    -expectedStatus 200

if ($yourAccount) {
    $yourToken = $yourAccount.token
    $yourUserId = $yourAccount.id
    Write-Host "Logged in as: $($yourAccount.fullName)" -ForegroundColor Cyan
    
    # 7.2 Browse products
    Test-Endpoint -name "Your Account - Browse Products" `
        -method "GET" `
        -url "$baseUrl:8082/api/products" `
        -headers @{ "Authorization" = "Bearer $yourToken" } `
        -expectedStatus 200
    
    # 7.3 Add to cart
    if ($createdProduct2 -and $createdProduct2.id) {
        $yourCartAdd = @{
            buyerId = $yourUserId
            productId = $createdProduct2.id
            quantity = 1000
        }
        
        Test-Endpoint -name "Your Account - Add to Cart" `
            -method "POST" `
            -url "$baseUrl:8081/api/cart/add" `
            -body $yourCartAdd `
            -headers @{ "Authorization" = "Bearer $yourToken" } `
            -expectedStatus 200
    }
    
    # 7.4 View your cart
    Test-Endpoint -name "Your Account - View Cart" `
        -method "GET" `
        -url "$baseUrl:8081/api/cart?userId=$yourUserId" `
        -headers @{ "Authorization" = "Bearer $yourToken" } `
        -expectedStatus 200
}

# ============================================================================
# TEST SUMMARY
# ============================================================================
Write-Host "`n`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor White
Write-Host "║                    TEST SUMMARY                            ║" -ForegroundColor White
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor White

Write-Host "`nTotal Tests: $global:totalTests" -ForegroundColor Cyan
Write-Host "Passed: $global:passCount" -ForegroundColor Green
Write-Host "Failed: $global:failCount" -ForegroundColor Red

if ($global:failCount -eq 0) {
    Write-Host "`n🎉 ALL TESTS PASSED! 🎉" -ForegroundColor Green -BackgroundColor Black
} else {
    $passRate = [math]::Round(($global:passCount / $global:totalTests) * 100, 2)
    Write-Host "`n⚠ Pass Rate: $passRate%" -ForegroundColor Yellow
}

Write-Host "`n============================================================" -ForegroundColor White
Write-Host "Test Coverage:" -ForegroundColor White
Write-Host "  [OK] User Registration (Buyer and Supplier)" -ForegroundColor Gray
Write-Host "  [OK] Product Creation and Management" -ForegroundColor Gray
Write-Host "  [OK] Product Search and Browse" -ForegroundColor Gray
Write-Host "  [OK] Shopping Cart Operations" -ForegroundColor Gray
Write-Host "  [OK] Order Creation and Processing" -ForegroundColor Gray
Write-Host "  [OK] Order Status Updates (Lifecycle)" -ForegroundColor Gray
Write-Host "  [OK] Payment Processing" -ForegroundColor Gray
Write-Host "  [OK] Messaging (Buyer-Supplier)" -ForegroundColor Gray
Write-Host "  [OK] Notifications" -ForegroundColor Gray
Write-Host "  [OK] Existing User Account Testing" -ForegroundColor Gray
Write-Host "============================================================`n" -ForegroundColor White
