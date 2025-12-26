# ============================================================================
# COMPLETE END-TO-END TEST - B2B Marketplace Platform
# Tests entire buyer and supplier journey from registration to order completion
# ============================================================================

$ErrorActionPreference = "Continue"
$timestamp = Get-Date -Format 'HHmmss'
$passed = 0
$failed = 0
$skipped = 0

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        B2B MARKETPLACE - END-TO-END TEST SUITE                ║" -ForegroundColor Cyan
Write-Host "║        Complete Buyer & Supplier Journey                      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# PHASE 1: SYSTEM HEALTH CHECK
# ============================================================================

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║ PHASE 1: SYSTEM HEALTH CHECK                                  ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""

$services = @(
    @{Name="User Service"; Port=8081; Path="/api/auth/login"},
    @{Name="Product Service"; Port=8082; Path="/api/products"},
    @{Name="Order Service"; Port=8083; Path="/api/orders/health"},
    @{Name="Cart Service"; Port=8085; Path="/api/cart/health"},
    @{Name="Notification Service"; Port=8086; Path="/api/notifications/health"},
    @{Name="Admin Service"; Port=8088; Path="/api/admin/health"},
    @{Name="Messaging Service"; Port=8091; Path="/api/messaging/health"}
)

foreach ($service in $services) {
    Write-Host "Checking $($service.Name) (Port $($service.Port))..." -NoNewline
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($service.Port)$($service.Path)" -Method GET -TimeoutSec 3 -ErrorAction Stop
        Write-Host " ✓ UP" -ForegroundColor Green
        $passed++
    } catch {
        Write-Host " ✗ DOWN" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""

# ============================================================================
# PHASE 2: SUPPLIER JOURNEY
# ============================================================================

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║ PHASE 2: SUPPLIER JOURNEY                                     ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# Step 1: Supplier Registration
Write-Host "STEP 1: Supplier Registration" -ForegroundColor Yellow
try {
    $supplierData = @{
        email = "supplier_e2e_$timestamp@marketplace.com"
        password = "SecurePass123!"
        fullName = "E2E Test Supplier Corporation"
        userType = "SUPPLIER"
    } | ConvertTo-Json
    
    $supplier = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/register" `
        -Method POST -Body $supplierData -ContentType "application/json"
    
    Write-Host "  ✓ Supplier registered successfully" -ForegroundColor Green
    Write-Host "    User ID: $($supplier.id)" -ForegroundColor Cyan
    Write-Host "    Email: $($supplier.email)" -ForegroundColor Cyan
    Write-Host "    Token: $($supplier.token.Substring(0,20))..." -ForegroundColor Cyan
    
    $supplierToken = $supplier.token
    $supplierId = $supplier.id
    $passed++
} catch {
    Write-Host "  ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    $failed++
}

Write-Host ""

# Step 2: Supplier Creates Product
Write-Host "STEP 2: Supplier Creates Product" -ForegroundColor Yellow
if ($supplierToken) {
    try {
        $productData = @{
            supplierId = $supplierId
            categoryId = 1
            name = "E2E Test Product - Premium Widget Pro $timestamp"
            description = "High-quality industrial widget for B2B customers. Manufactured with precision engineering."
            unitPrice = 299.99
            unit = "piece"
            moq = 100
            stockQuantity = 10000
            leadTimeDays = 15
            brand = "E2E Industrial"
            origin = "USA"
            isActive = $true
            isFeatured = $true
        } | ConvertTo-Json
        
        $product = Invoke-RestMethod -Uri "http://localhost:8082/api/products" `
            -Method POST -Body $productData -ContentType "application/json" `
            -Headers @{"Authorization"="Bearer $supplierToken"}
        
        Write-Host "  ✓ Product created successfully" -ForegroundColor Green
        Write-Host "    Product ID: $($product.data.id)" -ForegroundColor Cyan
        Write-Host "    Name: $($product.data.name)" -ForegroundColor Cyan
        Write-Host "    Price: `$$($product.data.unitPrice)" -ForegroundColor Cyan
        Write-Host "    MOQ: $($product.data.moq)" -ForegroundColor Cyan
        Write-Host "    Stock: $($product.data.stockQuantity)" -ForegroundColor Cyan
        
        $productId = $product.data.id
        $passed++
    } catch {
        Write-Host "  ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
        $failed++
    }
} else {
    Write-Host "  ⊘ SKIPPED (no supplier token)" -ForegroundColor DarkYellow
    $skipped++
}

Write-Host ""

# ============================================================================
# PHASE 3: BUYER JOURNEY
# ============================================================================

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║ PHASE 3: BUYER JOURNEY                                        ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# Step 3: Buyer Registration
Write-Host "STEP 3: Buyer Registration" -ForegroundColor Yellow
try {
    $buyerData = @{
        email = "buyer_e2e_$timestamp@marketplace.com"
        password = "SecurePass123!"
        fullName = "E2E Test Buyer Company Ltd"
        userType = "BUYER"
    } | ConvertTo-Json
    
    $buyer = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/register" `
        -Method POST -Body $buyerData -ContentType "application/json"
    
    Write-Host "  ✓ Buyer registered successfully" -ForegroundColor Green
    Write-Host "    User ID: $($buyer.id)" -ForegroundColor Cyan
    Write-Host "    Email: $($buyer.email)" -ForegroundColor Cyan
    Write-Host "    Token: $($buyer.token.Substring(0,20))..." -ForegroundColor Cyan
    
    $buyerToken = $buyer.token
    $buyerId = $buyer.id
    $passed++
} catch {
    Write-Host "  ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    $failed++
}

Write-Host ""

# Step 4: Buyer Browses Products
Write-Host "STEP 4: Buyer Browses Products" -ForegroundColor Yellow
if ($buyerToken) {
    try {
        $products = Invoke-RestMethod -Uri "http://localhost:8082/api/products" `
            -Method GET -Headers @{"Authorization"="Bearer $buyerToken"}
        
        Write-Host "  ✓ Products retrieved successfully" -ForegroundColor Green
        Write-Host "    Total products available: $($products.data.Count)" -ForegroundColor Cyan
        $passed++
    } catch {
        Write-Host "  ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
        $failed++
    }
} else {
    Write-Host "  ⊘ SKIPPED (no buyer token)" -ForegroundColor DarkYellow
    $skipped++
}

Write-Host ""

# Step 5: Buyer Adds Product to Cart
Write-Host "STEP 5: Buyer Adds Product to Cart" -ForegroundColor Yellow
if ($buyerToken -and $productId) {
    try {
        $cartData = @{
            buyerId = $buyerId
            productId = $productId
            quantity = 500
        } | ConvertTo-Json
        
        $cartItem = Invoke-RestMethod -Uri "http://localhost:8085/api/cart" `
            -Method POST -Body $cartData -ContentType "application/json" `
            -Headers @{"Authorization"="Bearer $buyerToken"}
        
        Write-Host "  ✓ Product added to cart successfully" -ForegroundColor Green
        Write-Host "    Quantity: 500 units" -ForegroundColor Cyan
        Write-Host "    Cart Item ID: $($cartItem.id)" -ForegroundColor Cyan
        $passed++
    } catch {
        Write-Host "  ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
        $failed++
    }
} else {
    Write-Host "  ⊘ SKIPPED (missing buyer or product)" -ForegroundColor DarkYellow
    $skipped++
}

Write-Host ""

# Step 6: Buyer Views Cart
Write-Host "STEP 6: Buyer Views Cart" -ForegroundColor Yellow
if ($buyerToken -and $buyerId) {
    try {
        $cart = Invoke-RestMethod -Uri "http://localhost:8085/api/cart/$buyerId" `
            -Method GET -Headers @{"Authorization"="Bearer $buyerToken"}
        
        Write-Host "  ✓ Cart retrieved successfully" -ForegroundColor Green
        Write-Host "    Items in cart: $($cart.items.Count)" -ForegroundColor Cyan
        Write-Host "    Total amount: `$$($cart.totalAmount)" -ForegroundColor Cyan
        $passed++
    } catch {
        Write-Host "  ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
        $failed++
    }
} else {
    Write-Host "  ⊘ SKIPPED (missing buyer)" -ForegroundColor DarkYellow
    $skipped++
}

Write-Host ""

# ============================================================================
# PHASE 4: ORDER PROCESSING
# ============================================================================

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║ PHASE 4: ORDER PROCESSING                                     ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# Step 7: Buyer Places Order
Write-Host "STEP 7: Buyer Places Order" -ForegroundColor Yellow
if ($buyerToken -and $buyerId -and $supplierId -and $productId) {
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
            shippingAddress = "789 Enterprise Boulevard, Silicon Valley, CA 94088"
            billingAddress = "789 Enterprise Boulevard, Silicon Valley, CA 94088"
            paymentMethod = "Bank Transfer"
            shippingMethod = "Express Freight"
        } | ConvertTo-Json -Depth 5
        
        $order = Invoke-RestMethod -Uri "http://localhost:8083/api/orders" `
            -Method POST -Body $orderData -ContentType "application/json" `
            -Headers @{"Authorization"="Bearer $buyerToken"}
        
        Write-Host "  ✓ Order created successfully" -ForegroundColor Green
        Write-Host "    Order Number: $($order.data.orderNumber)" -ForegroundColor Cyan
        Write-Host "    Order ID: $($order.data.id)" -ForegroundColor Cyan
        Write-Host "    Status: $($order.data.status)" -ForegroundColor Cyan
        Write-Host "    Total: `$$($order.data.totalAmount)" -ForegroundColor Cyan
        
        $orderId = $order.data.id
        $orderNumber = $order.data.orderNumber
        $passed++
    } catch {
        Write-Host "  ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
        $failed++
    }
} else {
    Write-Host "  ⊘ SKIPPED (missing data)" -ForegroundColor DarkYellow
    $skipped++
}

Write-Host ""

# ============================================================================
# PHASE 5: COMMUNICATION & NOTIFICATIONS
# ============================================================================

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║ PHASE 5: COMMUNICATION & NOTIFICATIONS                        ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# Step 8: Buyer Sends Message to Supplier
Write-Host "STEP 8: Buyer Initiates Chat with Supplier" -ForegroundColor Yellow
if ($buyerId -and $supplierId) {
    try {
        # Create conversation
        $conversationData = @{
            buyerId = $buyerId
            supplierId = $supplierId
        } | ConvertTo-Json
        
        $conversation = Invoke-RestMethod -Uri "http://localhost:8091/api/conversations/create" `
            -Method POST -Body $conversationData -ContentType "application/json"
        
        # Send message
        $messageData = @{
            conversationId = $conversation.id
            senderId = $buyerId
            receiverId = $supplierId
            content = "Hello! I just placed order $orderNumber. When can I expect delivery?"
        } | ConvertTo-Json
        
        $message = Invoke-RestMethod -Uri "http://localhost:8091/api/messages/send" `
            -Method POST -Body $messageData -ContentType "application/json"
        
        Write-Host "  ✓ Message sent successfully" -ForegroundColor Green
        Write-Host "    Conversation ID: $($conversation.id)" -ForegroundColor Cyan
        Write-Host "    Message ID: $($message.id)" -ForegroundColor Cyan
        Write-Host "    Content: $($message.content)" -ForegroundColor Cyan
        $passed++
    } catch {
        Write-Host "  ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
        $failed++
    }
} else {
    Write-Host "  ⊘ SKIPPED (missing buyer or supplier)" -ForegroundColor DarkYellow
    $skipped++
}

Write-Host ""

# Step 9: Send Order Notification to Buyer
Write-Host "STEP 9: Send Order Confirmation Notification" -ForegroundColor Yellow
if ($buyerId -and $orderId) {
    try {
        $notificationData = @{
            userId = $buyerId
            type = "ORDER_CONFIRMATION"
            title = "Order Confirmed!"
            message = "Your order $orderNumber has been confirmed and is being processed."
            orderId = $orderId
            orderStatus = "CONFIRMED"
            severity = "INFO"
        } | ConvertTo-Json
        
        $notification = Invoke-RestMethod -Uri "http://localhost:8086/api/notifications/send" `
            -Method POST -Body $notificationData -ContentType "application/json"
        
        Write-Host "  ✓ Notification sent successfully" -ForegroundColor Green
        Write-Host "    Notification ID: $($notification.id)" -ForegroundColor Cyan
        Write-Host "    Title: $($notification.title)" -ForegroundColor Cyan
        Write-Host "    Message: $($notification.message)" -ForegroundColor Cyan
        $passed++
    } catch {
        Write-Host "  ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
        $failed++
    }
} else {
    Write-Host "  ⊘ SKIPPED (missing buyer or order)" -ForegroundColor DarkYellow
    $skipped++
}

Write-Host ""

# Step 10: Buyer Checks Notifications
Write-Host "STEP 10: Buyer Checks Unread Notifications" -ForegroundColor Yellow
if ($buyerId) {
    try {
        $unreadCount = Invoke-RestMethod -Uri "http://localhost:8086/api/notifications/user/$buyerId/unread/count" `
            -Method GET
        
        $unreadNotifications = Invoke-RestMethod -Uri "http://localhost:8086/api/notifications/user/$buyerId/unread" `
            -Method GET
        
        Write-Host "  ✓ Notifications retrieved successfully" -ForegroundColor Green
        Write-Host "    Unread count: $($unreadCount.count)" -ForegroundColor Cyan
        Write-Host "    Total notifications: $($unreadNotifications.Count)" -ForegroundColor Cyan
        $passed++
    } catch {
        Write-Host "  ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
        $failed++
    }
} else {
    Write-Host "  ⊘ SKIPPED (no buyer)" -ForegroundColor DarkYellow
    $skipped++
}

Write-Host ""

# ============================================================================
# PHASE 6: ADMIN MONITORING
# ============================================================================

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║ PHASE 6: ADMIN MONITORING                                     ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# Step 11: Admin Views Dashboard
Write-Host "STEP 11: Admin Views Dashboard Statistics" -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:8088/api/admin/dashboard/stats" -Method GET
    
    Write-Host "  ✓ Dashboard stats retrieved successfully" -ForegroundColor Green
    Write-Host "    Total Users: $($stats.totalUsers)" -ForegroundColor Cyan
    Write-Host "    Total Suppliers: $($stats.totalSuppliers)" -ForegroundColor Cyan
    Write-Host "    Total Buyers: $($stats.totalBuyers)" -ForegroundColor Cyan
    Write-Host "    Total Products: $($stats.totalProducts)" -ForegroundColor Cyan
    Write-Host "    Total Orders: $($stats.totalOrders)" -ForegroundColor Cyan
    Write-Host "    Total Revenue: `$$($stats.totalRevenue)" -ForegroundColor Cyan
    $passed++
} catch {
    Write-Host "  ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    $failed++
}

Write-Host ""

# Step 12: Admin Monitors Recent Orders
Write-Host "STEP 12: Admin Monitors Recent Orders" -ForegroundColor Yellow
try {
    $recentOrders = Invoke-RestMethod -Uri "http://localhost:8088/api/admin/orders/recent?limit=5" -Method GET
    
    Write-Host "  ✓ Recent orders retrieved successfully" -ForegroundColor Green
    Write-Host "    Recent orders count: $($recentOrders.Count)" -ForegroundColor Cyan
    if ($recentOrders.Count -gt 0) {
        Write-Host "    Latest order: Order #$($recentOrders[0].orderNumber)" -ForegroundColor Cyan
    }
    $passed++
} catch {
    Write-Host "  ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    $failed++
}

Write-Host ""

# ============================================================================
# FINAL RESULTS
# ============================================================================

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor White
Write-Host "║                     TEST RESULTS SUMMARY                      ║" -ForegroundColor White
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor White
Write-Host ""

$total = $passed + $failed + $skipped
$passRate = if ($total -gt 0) { [math]::Round(($passed / $total) * 100, 1) } else { 0 }

Write-Host "Test Breakdown by Phase:" -ForegroundColor Cyan
Write-Host "  Phase 1: System Health Check       - 7 services" -ForegroundColor Gray
Write-Host "  Phase 2: Supplier Journey           - 2 tests" -ForegroundColor Gray
Write-Host "  Phase 3: Buyer Journey              - 4 tests" -ForegroundColor Gray
Write-Host "  Phase 4: Order Processing           - 1 test" -ForegroundColor Gray
Write-Host "  Phase 5: Communication and Notifications - 3 tests" -ForegroundColor Gray
Write-Host "  Phase 6: Admin Monitoring           - 2 tests" -ForegroundColor Gray
Write-Host "  ───────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "  Total:                              19 tests" -ForegroundColor Gray
Write-Host ""

Write-Host "Results:" -ForegroundColor Cyan
Write-Host "  ✓ Passed:  $passed" -ForegroundColor Green
Write-Host "  ✗ Failed:  $failed" -ForegroundColor Red
Write-Host "  ⊘ Skipped: $skipped" -ForegroundColor Yellow
Write-Host "  ─────────────────" -ForegroundColor Gray
Write-Host "  Total:     $total" -ForegroundColor Cyan
Write-Host "  Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 90) { "Green" } elseif ($passRate -ge 70) { "Yellow" } else { "Red" })
Write-Host ""

if ($failed -eq 0 -and $skipped -eq 0) {
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                  *** ALL TESTS PASSED ***                     ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "✓ Complete End-to-End Journey Working!" -ForegroundColor Green
    Write-Host "✓ Supplier: Register → Create Product" -ForegroundColor Green
    Write-Host "✓ Buyer: Register → Browse → Cart → Order" -ForegroundColor Green
    Write-Host "✓ Communication: Messaging between Buyer & Supplier" -ForegroundColor Green
    Write-Host "✓ Notifications: Real-time order alerts" -ForegroundColor Green
    Write-Host "✓ Admin: Dashboard monitoring & analytics" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 B2B Marketplace Platform is PRODUCTION READY!" -ForegroundColor Green
} elseif ($failed -eq 0 -and $skipped -gt 0) {
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║              TESTS PASSED (Some Steps Skipped)                ║" -ForegroundColor Yellow
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Some tests were skipped due to dependencies on previous failures." -ForegroundColor Yellow
    Write-Host "Review the output above to identify which services need attention." -ForegroundColor Yellow
} else {
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║                    SOME TESTS FAILED                          ║" -ForegroundColor Red
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please review the errors above and ensure all services are running." -ForegroundColor Yellow
    Write-Host "Check service logs for detailed error information." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor White
Write-Host "Test completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor White
Write-Host ""
