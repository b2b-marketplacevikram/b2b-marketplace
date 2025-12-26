# Real-Time Test Suite for Admin, Messaging, and Notification Services

Write-Host "`n=============================================" -ForegroundColor Cyan
Write-Host " ADMIN + MESSAGING + NOTIFICATION SERVICES" -ForegroundColor Cyan
Write-Host " Real-Time Test Suite" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$passed = 0
$failed = 0

# ============================================
# ADMIN SERVICE TESTS (Port 8088)
# ============================================

Write-Host "`n### ADMIN SERVICE TESTS ###" -ForegroundColor Magenta

# Test 1: Admin Service Health Check
Write-Host "`n[TEST 1] Admin Service - Health Check" -ForegroundColor Yellow
Write-Host "  Purpose: Verify Admin Service is running" -ForegroundColor Gray
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8088/api/admin/health" -Method GET
    
    if ($health.status -eq "UP") {
        Write-Host "  ✓ PASS: Admin Service is UP" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  ✗ FAIL: Admin Service status: $($health.status)" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    $failed++
}

# Test 2: Get Dashboard Statistics
Write-Host "`n[TEST 2] Admin Service - Dashboard Stats" -ForegroundColor Yellow
Write-Host "  Purpose: Get overall platform statistics" -ForegroundColor Gray
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:8088/api/admin/dashboard/stats" -Method GET
    
    Write-Host "  ✓ PASS: Dashboard stats retrieved" -ForegroundColor Green
    Write-Host "    Total Users: $($stats.totalUsers)" -ForegroundColor Cyan
    Write-Host "    Total Orders: $($stats.totalOrders)" -ForegroundColor Cyan
    Write-Host "    Total Products: $($stats.totalProducts)" -ForegroundColor Cyan
    Write-Host "    Total Revenue: `$$($stats.totalRevenue)" -ForegroundColor Cyan
    $passed++
} catch {
    Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    $failed++
}

# Test 3: Get All Users
Write-Host "`n[TEST 3] Admin Service - Get All Users" -ForegroundColor Yellow
Write-Host "  Purpose: List all platform users" -ForegroundColor Gray
try {
    $users = Invoke-RestMethod -Uri "http://localhost:8088/api/admin/users" -Method GET
    
    Write-Host "  ✓ PASS: Retrieved $($users.Count) users" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    $failed++
}

# Test 4: Get Users by Type (SUPPLIER)
Write-Host "`n[TEST 4] Admin Service - Get Suppliers" -ForegroundColor Yellow
Write-Host "  Purpose: Filter users by type" -ForegroundColor Gray
try {
    $suppliers = Invoke-RestMethod -Uri "http://localhost:8088/api/admin/users/type/SUPPLIER" -Method GET
    
    Write-Host "  ✓ PASS: Retrieved $($suppliers.Count) suppliers" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    $failed++
}

# Test 5: Get Recent Orders
Write-Host "`n[TEST 5] Admin Service - Recent Orders" -ForegroundColor Yellow
Write-Host "  Purpose: Get latest orders for monitoring" -ForegroundColor Gray
try {
    $recentOrders = Invoke-RestMethod -Uri "http://localhost:8088/api/admin/orders/recent?limit=5" -Method GET
    
    Write-Host "  ✓ PASS: Retrieved $($recentOrders.Count) recent orders" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    $failed++
}

# Test 6: Get Top Products
Write-Host "`n[TEST 6] Admin Service - Top Products" -ForegroundColor Yellow
Write-Host "  Purpose: Get best-selling products" -ForegroundColor Gray
try {
    $topProducts = Invoke-RestMethod -Uri "http://localhost:8088/api/admin/products/top?limit=5" -Method GET
    
    Write-Host "  ✓ PASS: Retrieved $($topProducts.Count) top products" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    $failed++
}

# Test 7: Get Top Suppliers
Write-Host "`n[TEST 7] Admin Service - Top Suppliers" -ForegroundColor Yellow
Write-Host "  Purpose: Get highest-performing suppliers" -ForegroundColor Gray
try {
    $topSuppliers = Invoke-RestMethod -Uri "http://localhost:8088/api/admin/suppliers/top?limit=5" -Method GET
    
    Write-Host "  ✓ PASS: Retrieved $($topSuppliers.Count) top suppliers" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    $failed++
}

# ============================================
# MESSAGING SERVICE TESTS (Port 8091)
# ============================================

Write-Host "`n`n### MESSAGING SERVICE TESTS ###" -ForegroundColor Magenta

# Test 8: Messaging Service Health Check
Write-Host "`n[TEST 8] Messaging Service - Health Check" -ForegroundColor Yellow
Write-Host "  Purpose: Verify Messaging Service is running" -ForegroundColor Gray
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8091/api/messaging/health" -Method GET
    
    if ($health.status -eq "UP") {
        Write-Host "  ✓ PASS: Messaging Service is UP (WebSocket: $($health.websocket))" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  ✗ FAIL: Messaging Service status: $($health.status)" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    $failed++
}

# Test 9: Create Conversation (Buyer-Supplier Chat)
Write-Host "`n[TEST 9] Messaging Service - Create Conversation" -ForegroundColor Yellow
Write-Host "  Purpose: Create chat conversation between buyer and supplier" -ForegroundColor Gray
try {
    # Using existing user IDs from database
    $conversationData = @{
        buyerId = 1
        supplierId = 1
    } | ConvertTo-Json
    
    $conversation = Invoke-RestMethod -Uri "http://localhost:8091/api/conversations/create" `
        -Method POST -Body $conversationData -ContentType "application/json"
    
    Write-Host "  ✓ PASS: Conversation created (ID: $($conversation.id))" -ForegroundColor Green
    $conversationId = $conversation.id
    $passed++
} catch {
    Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    $failed++
}

# Test 10: Send Message via REST
if ($conversationId) {
    Write-Host "`n[TEST 10] Messaging Service - Send Message" -ForegroundColor Yellow
    Write-Host "  Purpose: Send chat message between buyer and supplier" -ForegroundColor Gray
    try {
        $messageData = @{
            conversationId = $conversationId
            senderId = 1
            receiverId = 1
            content = "Hello! I'm interested in your products. Can we discuss bulk pricing?"
        } | ConvertTo-Json
        
        $message = Invoke-RestMethod -Uri "http://localhost:8091/api/messages/send" `
            -Method POST -Body $messageData -ContentType "application/json"
        
        Write-Host "  ✓ PASS: Message sent (ID: $($message.id))" -ForegroundColor Green
        Write-Host "    Content: $($message.content)" -ForegroundColor Cyan
        $passed++
    } catch {
        Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
        $failed++
    }
}

# Test 11: Get User Conversations
Write-Host "`n[TEST 11] Messaging Service - Get User Conversations" -ForegroundColor Yellow
Write-Host "  Purpose: Retrieve all conversations for a user" -ForegroundColor Gray
try {
    $conversations = Invoke-RestMethod -Uri "http://localhost:8091/api/conversations/user/1" -Method GET
    
    Write-Host "  ✓ PASS: Retrieved $($conversations.Count) conversation(s)" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    $failed++
}

# Test 12: Get Conversation Messages
if ($conversationId) {
    Write-Host "`n[TEST 12] Messaging Service - Get Messages" -ForegroundColor Yellow
    Write-Host "  Purpose: Retrieve messages in a conversation" -ForegroundColor Gray
    try {
        $messages = Invoke-RestMethod -Uri "http://localhost:8091/api/conversations/$conversationId/messages?userId=1" -Method GET
        
        Write-Host "  ✓ PASS: Retrieved $($messages.Count) message(s)" -ForegroundColor Green
        $passed++
    } catch {
        Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
        $failed++
    }
}

# ============================================
# NOTIFICATION SERVICE TESTS (Port 8086)
# ============================================

Write-Host "`n`n### NOTIFICATION SERVICE TESTS ###" -ForegroundColor Magenta

# Test 13: Notification Service Health Check
Write-Host "`n[TEST 13] Notification Service - Health Check" -ForegroundColor Yellow
Write-Host "  Purpose: Verify Notification Service is running" -ForegroundColor Gray
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8086/api/notifications/health" -Method GET
    
    if ($health.status -eq "UP") {
        Write-Host "  ✓ PASS: Notification Service is UP (WebSocket: $($health.websocket))" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  ✗ FAIL: Notification Service status: $($health.status)" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    $failed++
}

# Test 14: Send Notification
Write-Host "`n[TEST 14] Notification Service - Send Notification" -ForegroundColor Yellow
Write-Host "  Purpose: Send real-time notification to user" -ForegroundColor Gray
try {
    $notificationData = @{
        userId = 1
        type = "ORDER_UPDATE"
        title = "Order Confirmed"
        message = "Your order has been confirmed and is being processed."
        orderId = 1
        orderStatus = "CONFIRMED"
        severity = "INFO"
    } | ConvertTo-Json
    
    $notification = Invoke-RestMethod -Uri "http://localhost:8086/api/notifications/send" `
        -Method POST -Body $notificationData -ContentType "application/json"
    
    Write-Host "  ✓ PASS: Notification sent (ID: $($notification.id))" -ForegroundColor Green
    Write-Host "    Title: $($notification.title)" -ForegroundColor Cyan
    Write-Host "    Message: $($notification.message)" -ForegroundColor Cyan
    $passed++
} catch {
    Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    $failed++
}

# Test 15: Get User Notifications
Write-Host "`n[TEST 15] Notification Service - Get User Notifications" -ForegroundColor Yellow
Write-Host "  Purpose: Retrieve all notifications for a user" -ForegroundColor Gray
try {
    $notifications = Invoke-RestMethod -Uri "http://localhost:8086/api/notifications/user/1" -Method GET
    
    Write-Host "  ✓ PASS: Retrieved $($notifications.Count) notification(s)" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    $failed++
}

# Test 16: Get Unread Notifications
Write-Host "`n[TEST 16] Notification Service - Get Unread Notifications" -ForegroundColor Yellow
Write-Host "  Purpose: Get only unread notifications" -ForegroundColor Gray
try {
    $unread = Invoke-RestMethod -Uri "http://localhost:8086/api/notifications/user/1/unread" -Method GET
    
    Write-Host "  ✓ PASS: Retrieved $($unread.Count) unread notification(s)" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    $failed++
}

# Test 17: Get Unread Count
Write-Host "`n[TEST 17] Notification Service - Unread Count" -ForegroundColor Yellow
Write-Host "  Purpose: Get count of unread notifications" -ForegroundColor Gray
try {
    $countResult = Invoke-RestMethod -Uri "http://localhost:8086/api/notifications/user/1/unread/count" -Method GET
    
    Write-Host "  ✓ PASS: Unread count: $($countResult.count)" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Error: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    $failed++
}

# ============================================
# FINAL RESULTS
# ============================================

Write-Host "`n`n=============================================" -ForegroundColor White
Write-Host " TEST RESULTS SUMMARY" -ForegroundColor White
Write-Host "=============================================" -ForegroundColor White

Write-Host "`nService Breakdown:" -ForegroundColor Cyan
Write-Host "  Admin Service (8088):        7 tests" -ForegroundColor Gray
Write-Host "  Messaging Service (8091):    5 tests" -ForegroundColor Gray
Write-Host "  Notification Service (8086): 5 tests" -ForegroundColor Gray
Write-Host "  ----------------------------------------" -ForegroundColor Gray
Write-Host "  Total:                      17 tests" -ForegroundColor Gray

Write-Host "`nResults:" -ForegroundColor Cyan
Write-Host "  Passed: $passed" -ForegroundColor Green
Write-Host "  Failed: $failed" -ForegroundColor Red
Write-Host "  Total:  $($passed + $failed)" -ForegroundColor Cyan

if ($failed -eq 0) {
    Write-Host "`n*** ALL TESTS PASSED ***" -ForegroundColor Green -BackgroundColor Black
    Write-Host "`n✓ Admin Service: ALL TESTS WORKING" -ForegroundColor Green
    Write-Host "✓ Messaging Service: ALL TESTS WORKING" -ForegroundColor Green
    Write-Host "✓ Notification Service: ALL TESTS WORKING" -ForegroundColor Green
} else {
    $rate = [math]::Round(($passed / ($passed + $failed)) * 100, 1)
    Write-Host "`nPass Rate: $rate%" -ForegroundColor Yellow
    Write-Host "`nPlease review failed tests above." -ForegroundColor Yellow
}

Write-Host "`n=============================================" -ForegroundColor White
