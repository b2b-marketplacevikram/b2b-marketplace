# Enhanced Solr Setup Script for B2B Marketplace
# This script downloads, configures, and starts Apache Solr with the products collection

param(
    [string]$SolrVersion = "8.11.1",
    [int]$Port = 8983,
    [switch]$Force,
    [switch]$SkipDownload
)

$ErrorActionPreference = "Stop"

$solrHome = "$PWD\solr-$SolrVersion"
$solrUrl = "http://localhost:$Port/solr"
$configDir = "$PWD\solr-config"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  B2B Marketplace Solr Setup" -ForegroundColor Cyan
Write-Host "  Version: $SolrVersion" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Download Solr if needed
if (-not $SkipDownload) {
    if (-not (Test-Path "$solrHome") -or $Force) {
        Write-Host "[1/5] Downloading Solr $SolrVersion..." -ForegroundColor Yellow
        
        $zipFile = "solr-$SolrVersion.zip"
        $downloadUrl = "https://archive.apache.org/dist/lucene/solr/$SolrVersion/solr-$SolrVersion.zip"
        
        if (-not (Test-Path $zipFile)) {
            try {
                Invoke-WebRequest -Uri $downloadUrl -OutFile $zipFile -UseBasicParsing
                Write-Host "   Downloaded successfully" -ForegroundColor Green
            } catch {
                Write-Host "   Failed to download from Apache archive, trying alternative..." -ForegroundColor Yellow
                $altUrl = "https://downloads.apache.org/lucene/solr/$SolrVersion/solr-$SolrVersion.zip"
                Invoke-WebRequest -Uri $altUrl -OutFile $zipFile -UseBasicParsing
            }
        }
        
        Write-Host "   Extracting..." -ForegroundColor Yellow
        Expand-Archive -Path $zipFile -DestinationPath $PWD -Force
        Write-Host "   Extraction complete" -ForegroundColor Green
    } else {
        Write-Host "[1/5] Solr already downloaded, skipping..." -ForegroundColor Gray
    }
} else {
    Write-Host "[1/5] Skipping download as requested" -ForegroundColor Gray
}

# Step 2: Check if Solr is already running
Write-Host ""
Write-Host "[2/5] Checking Solr status..." -ForegroundColor Yellow

$solrRunning = $false
try {
    $response = Invoke-RestMethod -Uri "$solrUrl/admin/cores?action=STATUS" -TimeoutSec 5 -ErrorAction SilentlyContinue
    $solrRunning = $true
    Write-Host "   Solr is already running" -ForegroundColor Green
} catch {
    Write-Host "   Solr is not running" -ForegroundColor Yellow
}

# Step 3: Start Solr if not running
if (-not $solrRunning) {
    Write-Host ""
    Write-Host "[3/5] Starting Solr..." -ForegroundColor Yellow
    
    $solrCmd = "$solrHome\bin\solr.cmd"
    if (Test-Path $solrCmd) {
        Start-Process -FilePath $solrCmd -ArgumentList "start", "-p", $Port -NoNewWindow
        Write-Host "   Waiting for Solr to start..." -ForegroundColor Yellow
        
        $maxAttempts = 30
        $attempt = 0
        while ($attempt -lt $maxAttempts) {
            Start-Sleep -Seconds 2
            $attempt++
            try {
                $response = Invoke-RestMethod -Uri "$solrUrl/admin/cores?action=STATUS" -TimeoutSec 5 -ErrorAction SilentlyContinue
                Write-Host "   Solr started successfully!" -ForegroundColor Green
                $solrRunning = $true
                break
            } catch {
                Write-Host "   Waiting... ($attempt/$maxAttempts)" -ForegroundColor Gray
            }
        }
        
        if (-not $solrRunning) {
            Write-Host "   ERROR: Solr failed to start within timeout" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "   ERROR: Solr command not found at $solrCmd" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[3/5] Solr already running, skipping start" -ForegroundColor Gray
}

# Step 4: Create 'products' collection
Write-Host ""
Write-Host "[4/5] Setting up 'products' collection..." -ForegroundColor Yellow

try {
    $listResp = Invoke-RestMethod -Uri "$solrUrl/admin/collections?action=LIST" -ErrorAction Stop
    $collections = $listResp.collections
    
    if ($collections -contains 'products') {
        Write-Host "   Collection 'products' already exists" -ForegroundColor Green
    } else {
        Write-Host "   Creating 'products' collection..." -ForegroundColor Yellow
        $createResp = Invoke-RestMethod -Uri "$solrUrl/admin/collections?action=CREATE&name=products&numShards=1&replicationFactor=1&collection.configName=_default"
        Write-Host "   Collection 'products' created successfully" -ForegroundColor Green
    }
} catch {
    Write-Host "   Warning: Could not check/create collection. Error: $_" -ForegroundColor Yellow
}

# Step 5: Configure schema fields
Write-Host ""
Write-Host "[5/5] Configuring schema fields..." -ForegroundColor Yellow

$fields = @(
    @{ name = 'productId'; type = 'plong'; stored = $true; indexed = $true },
    @{ name = 'name'; type = 'text_general'; stored = $true; indexed = $true },
    @{ name = 'description'; type = 'text_general'; stored = $true; indexed = $true },
    @{ name = 'sku'; type = 'string'; stored = $true; indexed = $true },
    @{ name = 'price'; type = 'pdouble'; stored = $true; indexed = $true },
    @{ name = 'moq'; type = 'pint'; stored = $true; indexed = $true },
    @{ name = 'stockQuantity'; type = 'pint'; stored = $true; indexed = $true },
    @{ name = 'categoryId'; type = 'plong'; stored = $true; indexed = $true },
    @{ name = 'categoryName'; type = 'text_general'; stored = $true; indexed = $true },
    @{ name = 'supplierId'; type = 'plong'; stored = $true; indexed = $true },
    @{ name = 'supplierName'; type = 'text_general'; stored = $true; indexed = $true },
    @{ name = 'origin'; type = 'string'; stored = $true; indexed = $true },
    @{ name = 'rating'; type = 'pdouble'; stored = $true; indexed = $true },
    @{ name = 'reviewCount'; type = 'pint'; stored = $true; indexed = $true },
    @{ name = 'tags'; type = 'strings'; stored = $true; indexed = $true; multiValued = $true },
    @{ name = 'isFeatured'; type = 'boolean'; stored = $true; indexed = $true },
    @{ name = 'isActive'; type = 'boolean'; stored = $true; indexed = $true },
    @{ name = 'createdAt'; type = 'pdate'; stored = $true; indexed = $true },
    @{ name = 'updatedAt'; type = 'pdate'; stored = $true; indexed = $true }
)

$successCount = 0
$skipCount = 0

foreach ($f in $fields) {
    $body = @{ "add-field" = $f } | ConvertTo-Json -Depth 5
    try {
        $response = Invoke-RestMethod -Method Post -Uri "$solrUrl/products/schema" -ContentType "application/json" -Body $body -ErrorAction Stop
        Write-Host "   Added field: $($f.name)" -ForegroundColor Green
        $successCount++
    } catch {
        $errorMsg = $_.Exception.Message
        if ($errorMsg -match "already exists") {
            Write-Host "   Field exists: $($f.name)" -ForegroundColor Gray
            $skipCount++
        } else {
            Write-Host "   Skipped: $($f.name) - $errorMsg" -ForegroundColor Yellow
            $skipCount++
        }
    }
}

Write-Host ""
Write-Host "   Fields added: $successCount, Skipped: $skipCount" -ForegroundColor Cyan

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Solr Admin UI: $solrUrl/" -ForegroundColor White
Write-Host "Products Collection: $solrUrl/products/select?q=*:*" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Start the search-service: cd backend\search-service && mvn spring-boot:run" -ForegroundColor White
Write-Host "  2. Trigger index sync: POST http://localhost:8090/api/search/sync" -ForegroundColor White
Write-Host "  3. Test search: GET http://localhost:8090/api/search?q=test" -ForegroundColor White
Write-Host ""
