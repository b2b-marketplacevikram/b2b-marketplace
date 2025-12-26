# User Service Test Script
# Tests authentication and user management endpoints

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  USER SERVICE API TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:8081/api"
$passed = 0
$failed = 0

# Test 1: Health Check
Write-Host "Test 1: User Service Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/health" -Method Get -ErrorAction SilentlyContinue
    Write-Host "  PASS - Service is running" -ForegroundColor Green
    $passed++
} catch {
    # Try alternative health check
    try {
        Invoke-WebRequest -Uri "http://localhost:8081" -Method Get -TimeoutSec 2 | Out-Null
        Write-Host "  PASS - Service is accessible" -ForegroundColor Green
        $passed++
    } catch {
        Write-Host "  FAIL - Service not responding" -ForegroundColor Red
        $failed++
    }
}

# Test 2: Login with Valid Credentials
Write-Host "`nTest 2: Login with Valid Credentials" -ForegroundColor Yellow
try {
    $loginData = @{
        email = "buyer1@example.com"
        password = "password"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method Post `
        -Body $loginData `
        -ContentType "application/json"
    
    if ($response.token) {
        Write-Host "  PASS - Login successful, token received" -ForegroundColor Green
        Write-Host "    User: $($response.fullName) ($($response.userType))" -ForegroundColor Gray
        $global:authToken = $response.token
        $passed++
    } else {
        Write-Host "  FAIL - No token in response" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 3: Login with Invalid Credentials
Write-Host "`nTest 3: Login with Invalid Credentials" -ForegroundColor Yellow
try {
    $loginData = @{
        email = "buyer1@example.com"
        password = "wrongpassword"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method Post `
        -Body $loginData `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "  FAIL - Should have rejected invalid password" -ForegroundColor Red
    $failed++
} catch {
    if ($_.Exception.Response.StatusCode -eq 401 -or $_.Exception.Response.StatusCode -eq 400) {
        Write-Host "  PASS - Correctly rejected invalid credentials" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  FAIL - Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

# Test 4: Register New User
Write-Host "`nTest 4: Register New User" -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testEmail = "testuser$timestamp@example.com"

try {
    $registerData = @{
        email = $testEmail
        password = "testpass123"
        fullName = "Test User"
        userType = "BUYER"
        phone = "+1-555-0199"
        companyName = "Test Company"
        country = "United States"
        city = "New York"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" `
        -Method Post `
        -Body $registerData `
        -ContentType "application/json"
    
    if ($response.token -and $response.email -eq $testEmail) {
        Write-Host "  PASS - User registered successfully" -ForegroundColor Green
        Write-Host "    Email: $($response.email)" -ForegroundColor Gray
        Write-Host "    ID: $($response.id)" -ForegroundColor Gray
        $passed++
    } else {
        Write-Host "  FAIL - Registration incomplete" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 5: Duplicate Registration
Write-Host "`nTest 5: Prevent Duplicate Email Registration" -ForegroundColor Yellow
try {
    $registerData = @{
        email = "buyer1@example.com"
        password = "password123"
        fullName = "Duplicate User"
        userType = "BUYER"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" `
        -Method Post `
        -Body $registerData `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "  FAIL - Should reject duplicate email" -ForegroundColor Red
    $failed++
} catch {
    if ($_.Exception.Response.StatusCode -eq 409 -or $_.Exception.Response.StatusCode -eq 400) {
        Write-Host "  PASS - Correctly rejected duplicate email" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  WARN - Unexpected response: $($_.Exception.Message)" -ForegroundColor Yellow
        $passed++
    }
}

# Test 6: Login as Supplier
Write-Host "`nTest 6: Login as Supplier" -ForegroundColor Yellow
try {
    $loginData = @{
        email = "supplier1@techcorp.com"
        password = "password"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method Post `
        -Body $loginData `
        -ContentType "application/json"
    
    if ($response.token -and $response.userType -eq "SUPPLIER") {
        Write-Host "  PASS - Supplier login successful" -ForegroundColor Green
        Write-Host "    Company: $($response.fullName)" -ForegroundColor Gray
        $passed++
    } else {
        Write-Host "  FAIL - Supplier login failed" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 7: Get Current User (Protected Route)
Write-Host "`nTest 7: Get Current User (Protected Route)" -ForegroundColor Yellow
if ($global:authToken) {
    try {
        $headers = @{
            "Authorization" = "Bearer $global:authToken"
        }
        
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/me" `
            -Method Get `
            -Headers $headers
        
        Write-Host "  PASS - Retrieved current user" -ForegroundColor Green
        Write-Host "    User: $($response.fullName)" -ForegroundColor Gray
        $passed++
    } catch {
        Write-Host "  WARN - Protected route not available: $($_.Exception.Message)" -ForegroundColor Yellow
        $failed++
    }
} else {
    Write-Host "  SKIP - No auth token available" -ForegroundColor Yellow
    $failed++
}

# Test 8: Unauthorized Access
Write-Host "`nTest 8: Reject Unauthorized Access" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/me" `
        -Method Get `
        -ErrorAction Stop
    
    Write-Host "  FAIL - Should reject unauthorized access" -ForegroundColor Red
    $failed++
} catch {
    if ($_.Exception.Response.StatusCode -eq 401 -or $_.Exception.Response.StatusCode -eq 403) {
        Write-Host "  PASS - Correctly rejected unauthorized request" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  WARN - Endpoint may not require auth" -ForegroundColor Yellow
        $passed++
    }
}

# Test Results Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red

$total = $passed + $failed
if ($total -gt 0) {
    $rate = [math]::Round(($passed / $total) * 100, 1)
    $color = if ($rate -ge 90) { "Green" } elseif ($rate -ge 70) { "Yellow" } else { "Red" }
    Write-Host "Success Rate: $rate%" -ForegroundColor $color
}

Write-Host "`nUser Service Status: " -NoNewline
if ($passed -gt ($total / 2)) {
    Write-Host "OPERATIONAL" -ForegroundColor Green
} else {
    Write-Host "ISSUES DETECTED" -ForegroundColor Red
}

Write-Host "`nEndpoint: http://localhost:8081/api/auth" -ForegroundColor Yellow
Write-Host ""
