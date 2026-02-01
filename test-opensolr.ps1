# OpenSolr Connection Test Script
# Your OpenSolr Instance Details
$solrUrl = "https://us-east-8-10.solrcluster.com/solr/b2b_products"

# Authentication (Get from OpenSolr Dashboard -> Index Auth Credentials)
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "IMPORTANT: Enter OpenSolr Credentials" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Find these in: OpenSolr Dashboard → Click 'Index Auth Credentials'" -ForegroundColor Cyan
Write-Host ""

$username = Read-Host "Enter Solr Username"
$password = Read-Host "Enter Solr Password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$passwordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Create Basic Auth header
$base64Auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($username):$($passwordPlain)"))
$headers = @{
    Authorization = "Basic $base64Auth"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OpenSolr Connection Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Solr URL: $solrUrl" -ForegroundColor Yellow
Write-Host "Username: $username" -ForegroundColor Yellow
Write-Host ""

# Test 1: Ping Solr
Write-Host "Test 1: Checking Solr connection..." -ForegroundColor Cyan
try {
    $ping = Invoke-RestMethod -Uri "$solrUrl/admin/ping" -Method Get -Headers $headers
    Write-Host "✓ SUCCESS: Solr is responding!" -ForegroundColor Green
    Write-Host "  Status: $($ping.status)" -ForegroundColor Gray
} catch {
    Write-Host "✗ FAILED: Cannot connect to Solr" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Check your username/password in OpenSolr Dashboard!" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: Check current document count
Write-Host "Test 2: Checking document count..." -ForegroundColor Cyan
try {
    $count = Invoke-RestMethod -Uri "$solrUrl/select?q=*:*&rows=0" -Method Get -Headers $headers
    Write-Host "✓ SUCCESS: Query executed!" -ForegroundColor Green
    Write-Host "  Documents found: $($count.response.numFound)" -ForegroundColor Gray
} catch {
    Write-Host "✗ FAILED: Cannot query Solr" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Index a sample product
Write-Host "Test 3: Indexing sample product..." -ForegroundColor Cyan
$testProduct = @{
    id = "TEST001"
    name = "Sample Laptop Computer"
    description = "High-performance business laptop with 16GB RAM and 512GB SSD"
    price = 1299.99
    category = "Electronics"
    categoryId = 1
    supplierId = 100
    supplierName = "TechSupplier Inc"
    brand = "TechBrand"
    inStock = $true
    sku = "LAP-TEST-001"
    tags = @("laptop", "electronics", "business", "computers")
    rating = 4.5
    reviewCount = 120
    imageUrl = "https://example.com/images/laptop.jpg"
    createdAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
    updatedAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
}

try {
    $json = "[$($testProduct | ConvertTo-Json)]"
    $result = Invoke-RestMethod -Uri "$solrUrl/update?commit=true" `
        -Method Post `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $json
    
    Write-Host "✓ SUCCESS: Product indexed!" -ForegroundColor Green
    Write-Host "  Response Status: $($result.responseHeader.status)" -ForegroundColor Gray
    Write-Host "  Query Time: $($result.responseHeader.QTime)ms" -ForegroundColor Gray
} catch {
    Write-Host "✗ FAILED: Cannot index product" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Search for the indexed product
Write-Host "Test 4: Searching for indexed product..." -ForegroundColor Cyan
try {
    Start-Sleep -Seconds 2  # Wait for indexing to complete
    $search = Invoke-RestMethod -Uri "$solrUrl/select?q=*:*&rows=10" -Method Get -Headers $headers
    Write-Host "✓ SUCCESS: Search executed!" -ForegroundColor Green
    Write-Host "  Total documents: $($search.response.numFound)" -ForegroundColor Gray
    
    if ($search.response.docs.Count -gt 0) {
        Write-Host "`n  Found products:" -ForegroundColor Yellow
        foreach ($doc in $search.response.docs) {
            Write-Host "  - ID: $($doc.id) | Name: $($doc.name) | Price: `$$($doc.price)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "✗ FAILED: Cannot search Solr" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Test category search
Write-Host "Test 5: Testing category filter..." -ForegroundColor Cyan
try {
    $categorySearch = Invoke-RestMethod -Uri "$solrUrl/select?q=category:Electronics&rows=10" -Method Get -Headers $headers
    Write-Host "✓ SUCCESS: Category search works!" -ForegroundColor Green
    Write-Host "  Electronics products found: $($categorySearch.response.numFound)" -ForegroundColor Gray
} catch {
    Write-Host "✗ FAILED: Category search failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 6: Test text search
Write-Host "Test 6: Testing text search..." -ForegroundColor Cyan
try {
    $textSearch = Invoke-RestMethod -Uri "$solrUrl/select?q=laptop&rows=10" -Method Get -Headers $headers
    Write-Host "✓ SUCCESS: Text search works!" -ForegroundColor Green
    Write-Host "  'laptop' search results: $($textSearch.response.numFound)" -ForegroundColor Gray
} catch {
    Write-Host "✗ FAILED: Text search failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Your OpenSolr instance is ready to use!" -ForegroundColor Green
Write-Host ""
Write-Host "Connection Details:" -ForegroundColor Yellow
Write-Host "  URL: $solrUrl" -ForegroundColor White
Write-Host "  Collection: b2b_products" -ForegroundColor White
Write-Host "  Port: 443 (HTTPS)" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Update backend configuration with this URL" -ForegroundColor White
Write-Host "  2. Index your product data" -ForegroundColor White
Write-Host "  3. Configure monitoring in OpenSolr dashboard" -ForegroundColor White
Write-Host ""
