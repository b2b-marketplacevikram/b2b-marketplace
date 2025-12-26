# Download and start Solr, then create `products` collection
# Usage: Run in an elevated PowerShell on Windows

$solrVersion = "8.11.1"
$solrHome = "$PWD\solr-$solrVersion"
$solrUrl = "http://localhost:8983/solr"

Write-Host "This script will download and start Solr $solrVersion and create 'products' collection"

if (-not (Test-Path "$solrHome")) {
    Write-Host "Downloading Solr..."
    $zip = "https://downloads.apache.org/lucene/solr/$solrVersion/solr-$solrVersion.zip"
    Invoke-WebRequest -Uri $zip -OutFile "solr-$solrVersion.zip"
    Expand-Archive -Path "solr-$solrVersion.zip" -DestinationPath $PWD
}

Write-Host "Starting Solr in background..."
Start-Process -FilePath "$solrHome\bin\solr.cmd" -ArgumentList "start" -NoNewWindow

Write-Host "Waiting for Solr to start..."
Start-Sleep -Seconds 8

# Create collection 'products' with 1 shard 1 replica
Write-Host "Creating 'products' collection (if not exists)..."
$createResp = Invoke-RestMethod -Method Get -Uri "$solrUrl/admin/collections?action=LIST"
if ($createResp.collections -notcontains 'products') {
    Invoke-RestMethod -Method Get -Uri "$solrUrl/admin/collections?action=CREATE&name=products&numShards=1&replicationFactor=1&collection.configName=_default"
    Write-Host "Created 'products' collection"
} else {
    Write-Host "Collection 'products' already exists"
}

# Add basic fields via Schema API
Write-Host "Adding basic fields to 'products' schema"
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
    @{ name = 'tags'; type = 'strings'; stored = $true; indexed = $true },
    @{ name = 'isFeatured'; type = 'boolean'; stored = $true; indexed = $true },
    @{ name = 'isActive'; type = 'boolean'; stored = $true; indexed = $true },
    @{ name = 'createdAt'; type = 'pdate'; stored = $true; indexed = $true },
    @{ name = 'updatedAt'; type = 'pdate'; stored = $true; indexed = $true }
)

foreach ($f in $fields) {
    $body = @{ "add-field" = $f } | ConvertTo-Json -Depth 5
    try {
        Invoke-RestMethod -Method Post -Uri "$solrUrl/products/schema" -ContentType "application/json" -Body $body -ErrorAction Stop
        Write-Host "Added field $($f.name)"
    } catch {
        Write-Host "Skipping field $($f.name) (may already exist)"
    }
}

Write-Host "Solr setup finished. Verify: $solrUrl/"