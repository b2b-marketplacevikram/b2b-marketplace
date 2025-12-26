# Cart Service Verification Script
# This script checks if the Cart Service is running and tests its endpoints

Write-Host "`n=== B2B Marketplace - Cart Service Verification ===" -ForegroundColor Cyan
Write-Host "Testing Cart Service on port 8085...`n" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "[1/4] Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod "http://localhost:8085/api/cart/health" -TimeoutSec 5
    Write-Host "✓ Health Check: $health" -ForegroundColor Green
} catch {
    Write-Host "✗ Cart Service is not running on port 8085" -ForegroundColor Red
    Write-Host "  Start it with: .\START_CART_SERVICE.ps1" -ForegroundColor Yellow
    exit 1
}

# Test 2: Get Cart (for test user ID 1)
Write-Host "`n[2/4] Testing Get Cart Endpoint..." -ForegroundColor Yellow
try {
    $cart = Invoke-RestMethod "http://localhost:8085/api/cart/1" -TimeoutSec 5
    $itemCount = $cart.items.Count
    $totalQty = $cart.totalQuantity
    $subtotal = $cart.subtotal
    Write-Host "✓ Get Cart: $itemCount items, $totalQty total quantity, `$$subtotal subtotal" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to get cart" -ForegroundColor Red
}

# Test 3: Get Cart Count
Write-Host "`n[3/4] Testing Get Cart Count Endpoint..." -ForegroundColor Yellow
try {
    $count = Invoke-RestMethod "http://localhost:8085/api/cart/1/count" -TimeoutSec 5
    Write-Host "✓ Cart Count: $count items" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to get cart count" -ForegroundColor Red
}

# Test 4: Add to Cart (Test Product ID 1, Quantity 10)
Write-Host "`n[4/4] Testing Add to Cart Endpoint..." -ForegroundColor Yellow
try {
    $body = @{
        buyerId = 1
        productId = 1
        quantity = 10
    } | ConvertTo-Json
    
    $result = Invoke-RestMethod -Uri "http://localhost:8085/api/cart" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -TimeoutSec 5
    
    Write-Host "✓ Add to Cart: Added product '$($result.productName)' (ID: $($result.productId)), Qty: $($result.quantity)" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✗ Product Service not running (needed to fetch product details)" -ForegroundColor Yellow
        Write-Host "  Start it with: .\START_PRODUCT_SERVICE.ps1" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Failed to add to cart: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n=== Cart Service Verification Complete ===" -ForegroundColor Cyan
Write-Host @"

Cart Service Status: ✓ RUNNING

Key Features:
- Database-backed cart (MySQL)
- User-specific cart isolation
- Automatic cart loading on login
- Cross-device synchronization
- Cart persistence across sessions

Frontend Integration:
- CartContext.jsx integrated with AuthContext
- No localStorage dependency
- Automatic sync on login/logout

API Endpoints Available:
- GET    /api/cart/{buyerId}         - Get user's cart
- GET    /api/cart/{buyerId}/count   - Get item count
- POST   /api/cart                   - Add item to cart
- PUT    /api/cart/items/{id}        - Update item quantity
- DELETE /api/cart/items/{id}        - Remove item
- DELETE /api/cart/{buyerId}         - Clear cart
- GET    /api/cart/health            - Health check

Database Table: cart_items
Columns: id, buyer_id, product_id, product_name, unit_price, quantity, 
         created_at, updated_at, product_image, supplier_name, available_stock

Documentation: See CART_BACKEND_GUIDE.md

"@ -ForegroundColor White

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Start frontend: npm run dev" -ForegroundColor White
Write-Host "2. Login as buyer: buyer1@example.com / password123" -ForegroundColor White
Write-Host "3. Add products to cart" -ForegroundColor White
Write-Host "4. Logout and login again - cart persists!" -ForegroundColor White
Write-Host ""
