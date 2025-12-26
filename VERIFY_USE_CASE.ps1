Write-Host "`n=== COMPLETE USE CASE TEST ===" -ForegroundColor Cyan

$ts = Get-Random
$sEmail = "supplier$ts@test.com"
$bEmail = "buyer$ts@test.com"

# Step 1: Register Supplier
Write-Host "`n[1] Registering Supplier: $sEmail"
$supplierBody = @{
    email = $sEmail
    password = "Test@1234"
    fullName = "Test Supplier"
    userType = "SUPPLIER"
    companyName = "Test Company"
} | ConvertTo-Json

$supplier = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/register" -Method Post -Body $supplierBody -ContentType "application/json"
$sTok = $supplier.token
$sId = $supplier.id
Write-Host "   Supplier User ID: $sId" -ForegroundColor Green

# Step 2: Create Product
Write-Host "`n[2] Creating Product (supplierId sent as 999, should use JWT=$sId)"
$productBody = @{
    name = "TestProduct$ts"
    description = "Test Description"
    unitPrice = 100
    moq = 10
    categoryId = 1
    supplierId = 999
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $sTok"
    "Content-Type" = "application/json"
}

$product = Invoke-RestMethod -Uri "http://localhost:8082/api/products" -Method Post -Body $productBody -Headers $headers
$prodId = $product.data.id
Write-Host "   Product ID: $prodId" -ForegroundColor Green

# Step 3: Verify in DB
Write-Host "`n[3] Checking Product in Database"
$dbCheck = mysql -u root -p1234 -D b2b_marketplace -se "SELECT p.id, p.supplier_id, s.user_id FROM products p JOIN suppliers s ON p.supplier_id = s.id WHERE p.id = $prodId" 2>&1
if ($dbCheck -match $sId) {
    Write-Host "   PASS - Linked to user_id $sId" -ForegroundColor Green
} else {
    Write-Host "   FAIL - $dbCheck" -ForegroundColor Red
}

# Step 4: Check My Products
Write-Host "`n[4] Checking My Products API"
$myProducts = Invoke-RestMethod -Uri "http://localhost:8082/api/products/supplier/user/$sId" -Headers $headers
$found = $myProducts.data | Where-Object { $_.id -eq $prodId }
if ($found) {
    Write-Host "   PASS - Product appears in My Products" -ForegroundColor Green
} else {
    Write-Host "   FAIL - Not found" -ForegroundColor Red
}

# Step 5: Register Buyer
Write-Host "`n[5] Registering Buyer: $bEmail"
$buyerBody = @{
    email = $bEmail
    password = "Test@1234"
    fullName = "Test Buyer"
    userType = "BUYER"
} | ConvertTo-Json

$buyer = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/register" -Method Post -Body $buyerBody -ContentType "application/json"
$bTok = $buyer.token
$bId = $buyer.id
Write-Host "   Buyer User ID: $bId" -ForegroundColor Green

# Step 6: Create Order
Write-Host "`n[6] Creating Order (buyerId sent as 888, should use JWT=$bId)"
$orderBody = @{
    buyerId = 888
    items = @(
        @{
            productId = $prodId
            productName = "TestProduct"
            quantity = 10
            unitPrice = 100
            totalPrice = 1000
        }
    )
    subtotal = 1000
    taxAmount = 100
    shippingCost = 50
    totalAmount = 1150
    shippingAddress = "123 Test Street"
    billingAddress = "123 Test Street"
    shippingMethod = "STANDARD"
    paymentMethod = "CREDIT_CARD"
} | ConvertTo-Json -Depth 10

$buyerHeaders = @{
    "Authorization" = "Bearer $bTok"
    "Content-Type" = "application/json"
}

$order = Invoke-RestMethod -Uri "http://localhost:8083/api/orders" -Method Post -Body $orderBody -Headers $buyerHeaders
$orderNum = $order.orderNumber
Write-Host "   Order Number: $orderNum" -ForegroundColor Green

# Step 7: Verify Order in DB
Write-Host "`n[7] Checking Order in Database"
$orderDbCheck = mysql -u root -p1234 -D b2b_marketplace -se "SELECT o.id, o.order_number, o.supplier_id, s.user_id FROM orders o JOIN suppliers s ON o.supplier_id = s.id WHERE o.order_number = '$orderNum'" 2>&1
if ($orderDbCheck -match $sId) {
    Write-Host "   PASS - Order linked to supplier user_id $sId" -ForegroundColor Green
} else {
    Write-Host "   FAIL - $orderDbCheck" -ForegroundColor Red
}

# Step 8: Check Supplier Orders
Write-Host "`n[8] Checking Supplier's Orders API"
$myOrders = Invoke-RestMethod -Uri "http://localhost:8083/api/orders/supplier/user/$sId" -Headers $headers
$foundOrder = $myOrders | Where-Object { $_.orderNumber -eq $orderNum }
if ($foundOrder) {
    Write-Host "   PASS - Order appears in Supplier Orders" -ForegroundColor Green
} else {
    Write-Host "   FAIL - Not found" -ForegroundColor Red
}

Write-Host "`n=== TEST COMPLETE ===" -ForegroundColor Cyan
