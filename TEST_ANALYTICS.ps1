Write-Host "=== TESTING ANALYTICS WITH REAL DATA ===" -ForegroundColor Cyan

# Register a new supplier
Write-Host "`n[1] Registering Supplier"
$supplierBody = @{
    email = "analytics_supplier_$(Get-Random -Maximum 999999999)@test.com"
    password = "password123"
    firstName = "Analytics"
    lastName = "Supplier"
    companyName = "Analytics Test Co"
} | ConvertTo-Json

$supplier = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/register/supplier" -Method Post -Body $supplierBody -ContentType "application/json"
$sId = $supplier.userId
$sToken = $supplier.token
Write-Host "   Supplier User ID: $sId" -ForegroundColor Green

$headers = @{
    "Authorization" = "Bearer $sToken"
    "Content-Type" = "application/json"
}

# Create multiple products
Write-Host "`n[2] Creating Products"
$productIds = @()
for ($i = 1; $i -le 3; $i++) {
    $productBody = @{
        supplierId = 999
        categoryId = 1
        name = "Analytics Product $i"
        description = "Test Product $i"
        unitPrice = 100 * $i
        moq = 10
        stockQuantity = 1000
        unit = "pcs"
    } | ConvertTo-Json

    $product = Invoke-RestMethod -Uri "http://localhost:8082/api/products" -Method Post -Body $productBody -Headers $headers
    $productIds += $product.data.id
    Write-Host "   Product $i ID: $($product.data.id)" -ForegroundColor Green
}

# Register a buyer and create orders
Write-Host "`n[3] Registering Buyer"
$buyerBody = @{
    email = "analytics_buyer_$(Get-Random -Maximum 999999999)@test.com"
    password = "password123"
    firstName = "Analytics"
    lastName = "Buyer"
    companyName = "Buyer Test Co"
} | ConvertTo-Json

$buyer = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/register/buyer" -Method Post -Body $buyerBody -ContentType "application/json"
$bId = $buyer.userId
$bToken = $buyer.token
Write-Host "   Buyer User ID: $bId" -ForegroundColor Green

$buyerHeaders = @{
    "Authorization" = "Bearer $bToken"
    "Content-Type" = "application/json"
}

# Create multiple orders
Write-Host "`n[4] Creating Orders"
$orderNumbers = @()
foreach ($prodId in $productIds) {
    $orderBody = @{
        buyerId = 888
        items = @(
            @{
                productId = $prodId
                productName = "Analytics Product"
                quantity = 10
                unitPrice = 150
                totalPrice = 1500
            }
        )
        subtotal = 1500
        taxAmount = 150
        shippingCost = 50
        totalAmount = 1700
        shippingAddress = "123 Test St"
        billingAddress = "123 Test St"
        shippingMethod = "STANDARD"
        paymentMethod = "CREDIT_CARD"
    } | ConvertTo-Json -Depth 10

    $order = Invoke-RestMethod -Uri "http://localhost:8083/api/orders" -Method Post -Body $orderBody -Headers $buyerHeaders
    $orderNumbers += $order.orderNumber
    Write-Host "   Order Created: $($order.orderNumber)" -ForegroundColor Green
}

# Now check analytics
Write-Host "`n[5] Fetching Analytics Data" -ForegroundColor Yellow
Start-Sleep -Seconds 2

$analytics = Invoke-RestMethod -Uri "http://localhost:8083/api/analytics/supplier/stats" -Headers $headers

Write-Host "`n=== ANALYTICS RESULTS ===" -ForegroundColor Cyan
Write-Host "Revenue:"
Write-Host "  Current Period: `$$($analytics.revenue.current)" -ForegroundColor Green
Write-Host "  Previous Period: `$$($analytics.revenue.previous)"
Write-Host "  Growth: $($analytics.revenue.growth)%"

Write-Host "`nOrders:"
Write-Host "  Current Period: $($analytics.orders.current)" -ForegroundColor Green
Write-Host "  Previous Period: $($analytics.orders.previous)"
Write-Host "  Growth: $($analytics.orders.growth)%"

Write-Host "`nAverage Order Value:"
Write-Host "  Current: `$$($analytics.avgOrderValue.current)" -ForegroundColor Green

Write-Host "`nTop Products: $($analytics.topProducts.Count) found" -ForegroundColor Green
foreach ($product in $analytics.topProducts) {
    Write-Host "  - $($product.name): $($product.sales) sales, `$$($product.revenue) revenue"
}

Write-Host "`nTop Buyers: $($analytics.topBuyers.Count) found" -ForegroundColor Green
foreach ($buyer in $analytics.topBuyers) {
    Write-Host "  - $($buyer.company): $($buyer.orders) orders, `$$($buyer.revenue) revenue"
}

Write-Host "`nRevenue Data Points: $($analytics.revenueData.Count)" -ForegroundColor Green
foreach ($rev in $analytics.revenueData) {
    Write-Host "  - $($rev.month): `$$($rev.revenue)"
}

Write-Host "`nCategory Breakdown: $($analytics.categoryData.Count) categories" -ForegroundColor Green
foreach ($cat in $analytics.categoryData) {
    Write-Host "  - $($cat.category): $($cat.percentage)% (`$$($cat.revenue))"
}

Write-Host "`n=== VERIFICATION ===" -ForegroundColor Yellow
if ($analytics.revenue.current -gt 0) {
    Write-Host "SUCCESS - Revenue data is REAL (found dollar $($analytics.revenue.current))" -ForegroundColor Green
} else {
    Write-Host "FAIL - Revenue data is ZERO" -ForegroundColor Red
}

if ($analytics.orders.current -gt 0) {
    Write-Host "SUCCESS - Order count is REAL (found $($analytics.orders.current) orders)" -ForegroundColor Green
} else {
    Write-Host "FAIL - Order count is ZERO" -ForegroundColor Red
}

if ($analytics.topProducts.Count -gt 0) {
    Write-Host "SUCCESS - Top Products data is REAL (found $($analytics.topProducts.Count) products)" -ForegroundColor Green
} else {
    Write-Host "FAIL - No top products found" -ForegroundColor Red
}

Write-Host "`n=== TEST COMPLETE ===" -ForegroundColor Cyan
