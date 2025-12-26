# Real Scenario Test - Complete Buyer/Supplier Journey
$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:8081"
$productUrl = "http://localhost:8082"
$orderUrl = "http://localhost:8083"

Write-Host "`n=== REAL SCENARIO TEST ===" -ForegroundColor Cyan
Write-Host "Testing: Supplier creates product -> Buyer purchases -> Supplier sees order`n" -ForegroundColor Yellow

$testEmail = "testsupp_$(Get-Random)@test.com"
$buyerEmail = "testbuyer_$(Get-Random)@test.com"

# Step 1: Register Supplier
Write-Host "[1] Registering Supplier: $testEmail" -ForegroundColor White
$supplierReg = @{
    email = $testEmail
    password = "Test@1234"
    fullName = "Test Supplier"
    userType = "SUPPLIER"
    companyName = "Test Company"
} | ConvertTo-Json

try {
    $supplierResp = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $supplierReg -ContentType "application/json"
    $supplierToken = $supplierResp.token
    $supplierId = $supplierResp.id
    Write-Host "   ✓ Supplier registered - User ID: $supplierId" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Failed to register supplier: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Create Product as Supplier
Write-Host "[2] Creating Product as Supplier (User ID: $supplierId)" -ForegroundColor White
$productData = @{
    name = "Test Product $(Get-Random)"
    description = "Test product description"
    unitPrice = 100
    moq = 10
    categoryId = 1
    supplierId = $supplierId  # Frontend sends this but backend should use JWT
} | ConvertTo-Json

try {
    $headers = @{
        "Authorization" = "Bearer $supplierToken"
        "Content-Type" = "application/json"
    }
    $productResp = Invoke-RestMethod -Uri "$productUrl/api/products" -Method Post -Body $productData -Headers $headers
    $productId = $productResp.data.id
    Write-Host "   ✓ Product created - ID: $productId" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Failed to create product: $_" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Check Product's Supplier ID in Database
Write-Host "[3] Verifying Product's Supplier ID in Database" -ForegroundColor White
$dbCheck = mysql -u root -p1234 -D b2b_marketplace -se "SELECT p.id, p.supplier_id, s.user_id FROM products p JOIN suppliers s ON p.supplier_id = s.id WHERE p.id = $productId" 2>&1 | Select-Object -Skip 1
Write-Host "   DB: Product ID=$productId, Data: $dbCheck" -ForegroundColor Gray
if ($dbCheck -match $supplierId) {
    Write-Host "   ✓ Product correctly linked to Supplier (user_id=$supplierId)" -ForegroundColor Green
} else {
    Write-Host "   ✗ MISMATCH! Product NOT linked to correct supplier!" -ForegroundColor Red
}

# Step 4: Register Buyer
Write-Host "[4] Registering Buyer: $buyerEmail" -ForegroundColor White
$buyerReg = @{
    email = $buyerEmail
    password = "Test@1234"
    fullName = "Test Buyer"
    userType = "BUYER"
} | ConvertTo-Json

try {
    $buyerResp = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $buyerReg -ContentType "application/json"
    $buyerToken = $buyerResp.token
    $buyerId = $buyerResp.id
    Write-Host "   ✓ Buyer registered - User ID: $buyerId" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Failed to register buyer: $_" -ForegroundColor Red
    exit 1
}

# Step 5: Create Order as Buyer
Write-Host "[5] Creating Order as Buyer (User ID: $buyerId)" -ForegroundColor White
$orderData = @{
    buyerId = $buyerId  # Frontend sends this but backend should use JWT
    items = @(
        @{
            productId = $productId
            quantity = 10
            unitPrice = 100
        }
    )
    shippingAddress = "123 Test St"
    paymentMethod = "CREDIT_CARD"
} | ConvertTo-Json -Depth 10

try {
    $headers = @{
        "Authorization" = "Bearer $buyerToken"
        "Content-Type" = "application/json"
    }
    $orderResp = Invoke-RestMethod -Uri "$orderUrl/api/orders" -Method Post -Body $orderData -Headers $headers
    $orderNumber = $orderResp.orderNumber
    Write-Host "   ✓ Order created - Order #: $orderNumber" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Failed to create order: $_" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 6: Check Order's Supplier ID in Database
Write-Host "[6] Verifying Order's Supplier ID in Database" -ForegroundColor White
$orderDbCheck = mysql -u root -p1234 -D b2b_marketplace -se "SELECT o.id, o.order_number, o.supplier_id, s.user_id FROM orders o JOIN suppliers s ON o.supplier_id = s.id WHERE o.order_number = '$orderNumber'" 2>&1 | Select-Object -Skip 1
Write-Host "   DB: Order $orderNumber, Data: $orderDbCheck" -ForegroundColor Gray
if ($orderDbCheck -match $supplierId) {
    Write-Host "   ✓ Order correctly linked to Supplier (user_id=$supplierId)" -ForegroundColor Green
} else {
    Write-Host "   ✗ MISMATCH! Order NOT linked to correct supplier!" -ForegroundColor Red
}

# Step 7: Fetch Supplier's Products via API
Write-Host "[7] Fetching Supplier's Products via API" -ForegroundColor White
try {
    $headers = @{
        "Authorization" = "Bearer $supplierToken"
    }
    $myProducts = Invoke-RestMethod -Uri "$productUrl/api/products/supplier/user/$supplierId" -Headers $headers
    $foundProduct = $myProducts.data | Where-Object { $_.id -eq $productId }
    
    if ($foundProduct) {
        Write-Host "   ✓ Product found in Supplier's product list!" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Product NOT found in Supplier's list!" -ForegroundColor Red
        Write-Host "   Found $($myProducts.data.Count) products total" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ✗ Failed to fetch supplier products: $_" -ForegroundColor Red
}

# Step 8: Fetch Supplier's Orders via API
Write-Host "[8] Fetching Supplier's Orders via API" -ForegroundColor White
try {
    $headers = @{
        "Authorization" = "Bearer $supplierToken"
    }
    $myOrders = Invoke-RestMethod -Uri "$orderUrl/api/orders/supplier/user/$supplierId" -Headers $headers
    $foundOrder = $myOrders | Where-Object { $_.orderNumber -eq $orderNumber }
    
    if ($foundOrder) {
        Write-Host "   ✓ Order found in Supplier's order list!" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Order NOT found in Supplier's list!" -ForegroundColor Red
        Write-Host "   Found $($myOrders.Count) orders total" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ✗ Failed to fetch supplier orders: $_" -ForegroundColor Red
}

Write-Host "`n=== TEST COMPLETE ===" -ForegroundColor Cyan
Write-Host "Supplier: $testEmail (ID: $supplierId)" -ForegroundColor White
Write-Host "Product: ID $productId" -ForegroundColor White
Write-Host "Buyer: $buyerEmail (ID: $buyerId)" -ForegroundColor White
Write-Host "Order: $orderNumber" -ForegroundColor White
