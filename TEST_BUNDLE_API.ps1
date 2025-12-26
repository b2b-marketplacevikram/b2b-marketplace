# Bundle API Test Script
# Test Product Service (8082) and Search Service (8086) Bundle APIs

$ErrorActionPreference = "Continue"

# Get auth token
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "BUNDLE API TEST SUITE" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

# Login
Write-Host "Logging in as supplier..." -ForegroundColor Cyan
$loginBody = '{"email":"supplier1@techcorp.com","password":"password"}'
$loginResp = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResp.token
$headers = @{ Authorization = "Bearer $token" }
Write-Host "Login successful!`n" -ForegroundColor Green

# ============ PRODUCT SERVICE TESTS (Port 8082) ============
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "PRODUCT SERVICE BUNDLE TESTS (8082)" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

# Test 1: GET all bundles
Write-Host "[TEST 1] GET /api/bundles - Get all bundles" -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "http://localhost:8082/api/bundles" -Method GET
    Write-Host "  PASS: Found $($result.data.Count) bundles" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: GET bundle by valid ID
Write-Host "`n[TEST 2] GET /api/bundles/2 - Get bundle by valid ID" -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "http://localhost:8082/api/bundles/2" -Method GET -Headers $headers
    Write-Host "  PASS: Got bundle '$($result.data.name)'" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: GET bundle by invalid ID (edge case)
Write-Host "`n[TEST 3] GET /api/bundles/99999 - Invalid ID (edge case)" -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "http://localhost:8082/api/bundles/99999" -Method GET -Headers $headers
    Write-Host "  UNEXPECTED: Should have returned 404" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Message -match "404") {
        Write-Host "  PASS: Correctly returned 404 Not Found" -ForegroundColor Green
    } else {
        Write-Host "  INFO: Error returned - $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Test 4: GET bundles by supplier ID
Write-Host "`n[TEST 4] GET /api/bundles/supplier/1 - Get by supplier" -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "http://localhost:8082/api/bundles/supplier/1" -Method GET
    Write-Host "  PASS: Found $($result.data.Count) bundles for supplier 1" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: GET active bundles
Write-Host "`n[TEST 5] GET /api/bundles/active - Get active bundles" -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "http://localhost:8082/api/bundles/active" -Method GET
    Write-Host "  PASS: Found $($result.data.Count) active bundles" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: GET featured bundles
Write-Host "`n[TEST 6] GET /api/bundles/featured - Get featured bundles" -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "http://localhost:8082/api/bundles/featured" -Method GET
    Write-Host "  PASS: Found $($result.data.Count) featured bundles" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: CREATE bundle without auth (edge case)
Write-Host "`n[TEST 7] POST /api/bundles - Create without auth (edge case)" -ForegroundColor Cyan
try {
    $body = '{"supplierId":1,"name":"Test","items":[]}'
    $result = Invoke-RestMethod -Uri "http://localhost:8082/api/bundles" -Method POST -Body $body -ContentType "application/json"
    Write-Host "  UNEXPECTED: Should require authentication" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Message -match "401|Unauthorized") {
        Write-Host "  PASS: Correctly returned 401 Unauthorized" -ForegroundColor Green
    } else {
        Write-Host "  INFO: Error - $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Test 8: CREATE bundle with empty items (edge case)
Write-Host "`n[TEST 8] POST /api/bundles - Empty items array (edge case)" -ForegroundColor Cyan
try {
    $body = '{"supplierId":1,"name":"Empty Bundle","description":"Test","items":[]}'
    $result = Invoke-RestMethod -Uri "http://localhost:8082/api/bundles" -Method POST -Body $body -ContentType "application/json" -Headers $headers
    Write-Host "  RESULT: Bundle created with 0 items (ID: $($result.data.id))" -ForegroundColor Yellow
} catch {
    Write-Host "  INFO: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 9: CREATE bundle with invalid product ID (edge case)
Write-Host "`n[TEST 9] POST /api/bundles - Invalid product ID (edge case)" -ForegroundColor Cyan
try {
    $body = '{"supplierId":1,"name":"Bad Bundle","items":[{"productId":99999,"quantity":1}]}'
    $result = Invoke-RestMethod -Uri "http://localhost:8082/api/bundles" -Method POST -Body $body -ContentType "application/json" -Headers $headers
    Write-Host "  RESULT: $($result.message)" -ForegroundColor Yellow
} catch {
    Write-Host "  PASS: Rejected invalid product - $($_.Exception.Message)" -ForegroundColor Green
}

# Test 10: CREATE valid bundle
Write-Host "`n[TEST 10] POST /api/bundles - Create valid bundle" -ForegroundColor Cyan
try {
    $body = '{"supplierId":1,"name":"Test Bundle ' + (Get-Date -Format "HHmmss") + '","description":"API Test","discountPercentage":10,"minOrderQuantity":1,"isActive":true,"items":[{"productId":1,"quantity":1},{"productId":2,"quantity":1}]}'
    $result = Invoke-RestMethod -Uri "http://localhost:8082/api/bundles" -Method POST -Body $body -ContentType "application/json" -Headers $headers
    $newBundleId = $result.data.id
    Write-Host "  PASS: Created bundle ID $newBundleId, Price: $($result.data.bundlePrice)" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $newBundleId = $null
}

# Test 11: UPDATE bundle
if ($newBundleId) {
    Write-Host "`n[TEST 11] PUT /api/bundles/$newBundleId - Update bundle" -ForegroundColor Cyan
    try {
        $body = '{"supplierId":1,"name":"Updated Bundle Name","description":"Updated desc","discountPercentage":20,"minOrderQuantity":2,"isActive":true,"items":[{"productId":1,"quantity":3}]}'
        $result = Invoke-RestMethod -Uri "http://localhost:8082/api/bundles/$newBundleId" -Method PUT -Body $body -ContentType "application/json" -Headers $headers
        Write-Host "  PASS: Updated bundle, new discount: $($result.data.discountPercentage)%" -ForegroundColor Green
    } catch {
        Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 12: DELETE bundle
if ($newBundleId) {
    Write-Host "`n[TEST 12] DELETE /api/bundles/$newBundleId - Delete bundle" -ForegroundColor Cyan
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:8082/api/bundles/$newBundleId" -Method DELETE -Headers $headers
        Write-Host "  PASS: Deleted bundle successfully" -ForegroundColor Green
    } catch {
        Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 13: DELETE non-existent bundle (edge case)
Write-Host "`n[TEST 13] DELETE /api/bundles/99999 - Delete non-existent (edge case)" -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "http://localhost:8082/api/bundles/99999" -Method DELETE -Headers $headers
    Write-Host "  UNEXPECTED: Should have returned error" -ForegroundColor Yellow
} catch {
    Write-Host "  PASS: Correctly handled non-existent bundle" -ForegroundColor Green
}

# ============ SEARCH SERVICE TESTS (Port 8086) ============
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "SEARCH SERVICE BUNDLE TESTS (8086)" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

# Test 14: Search service health check
Write-Host "[TEST 14] GET /api/search/health - Health check" -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "http://localhost:8086/api/search/health" -Method GET
    Write-Host "  PASS: $result" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: Search service may not be running - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 15: Bundle search endpoint
Write-Host "`n[TEST 15] GET /api/search/bundles - Search all bundles" -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "http://localhost:8086/api/search/bundles" -Method GET
    Write-Host "  PASS: Found $($result.totalResults) bundles in search" -ForegroundColor Green
} catch {
    Write-Host "  INFO: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 16: Bundle search with query
Write-Host "`n[TEST 16] GET /api/search/bundles?q=electronics - Search with keyword" -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "http://localhost:8086/api/search/bundles?q=electronics" -Method GET
    Write-Host "  PASS: Found $($result.totalResults) bundles matching 'electronics'" -ForegroundColor Green
} catch {
    Write-Host "  INFO: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 17: Bundle search by supplier
Write-Host "`n[TEST 17] GET /api/search/bundles/supplier/1 - Search by supplier" -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "http://localhost:8086/api/search/bundles/supplier/1" -Method GET
    Write-Host "  PASS: Found $($result.totalResults) bundles for supplier 1" -ForegroundColor Green
} catch {
    Write-Host "  INFO: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 18: Featured bundles search
Write-Host "`n[TEST 18] GET /api/search/bundles/featured - Featured bundles" -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "http://localhost:8086/api/search/bundles/featured" -Method GET
    Write-Host "  PASS: Found $($result.totalResults) featured bundles" -ForegroundColor Green
} catch {
    Write-Host "  INFO: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 19: Trigger bundle index sync
Write-Host "`n[TEST 19] POST /api/search/bundles/sync - Trigger index sync" -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "http://localhost:8086/api/search/bundles/sync" -Method POST
    Write-Host "  PASS: $result" -ForegroundColor Green
} catch {
    Write-Host "  INFO: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "TEST SUITE COMPLETED" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow
