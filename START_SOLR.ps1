# Simple Solr Startup Script
# This script starts Apache Solr on port 8983

param(
    [string]$SolrVersion = "8.11.1",
    [int]$Port = 8983
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Apache Solr" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$solrHome = "$PWD\solr-$SolrVersion"
$solrCmd = "$solrHome\bin\solr.cmd"

# Check if Solr is already running
Write-Host "Checking if Solr is already running..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:$Port/solr/admin/cores?action=STATUS" -TimeoutSec 3 -ErrorAction SilentlyContinue
    Write-Host "✓ Solr is already running at http://localhost:$Port/solr" -ForegroundColor Green
    Write-Host ""
    Write-Host "Solr Admin UI: http://localhost:$Port/solr/#/" -ForegroundColor Cyan
    exit 0
} catch {
    Write-Host "Solr is not running. Starting now..." -ForegroundColor Yellow
}

# Check if Solr exists
if (-not (Test-Path $solrCmd)) {
    Write-Host ""
    Write-Host "ERROR: Solr not found at: $solrHome" -ForegroundColor Red
    Write-Host "Please run .\SETUP_SOLR_ENHANCED.ps1 first to download and install Solr" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Quick setup command:" -ForegroundColor Cyan
    Write-Host "  .\SETUP_SOLR_ENHANCED.ps1" -ForegroundColor White
    exit 1
}

# Start Solr
Write-Host "Starting Solr from: $solrHome" -ForegroundColor Yellow
Write-Host ""

try {
    Start-Process -FilePath $solrCmd -ArgumentList "start", "-p", $Port -NoNewWindow -Wait:$false
    
    Write-Host "Waiting for Solr to start..." -ForegroundColor Yellow
    
    # Wait for Solr to be ready
    $maxAttempts = 30
    $attempt = 0
    $started = $false
    
    while ($attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 2
        $attempt++
        
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:$Port/solr/admin/cores?action=STATUS" -TimeoutSec 3 -ErrorAction SilentlyContinue
            Write-Host ""
            Write-Host "✓ Solr started successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Solr Admin UI: http://localhost:$Port/solr/#/" -ForegroundColor Cyan
            Write-Host "API Endpoint: http://localhost:$Port/solr" -ForegroundColor Cyan
            $started = $true
            break
        } catch {
            Write-Host "  Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
        }
    }
    
    if (-not $started) {
        Write-Host ""
        Write-Host "ERROR: Solr did not start within expected time" -ForegroundColor Red
        Write-Host "Check the Solr logs at: $solrHome\server\logs\" -ForegroundColor Yellow
        exit 1
    }
    
} catch {
    Write-Host ""
    Write-Host "ERROR: Failed to start Solr" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Verify Solr at: http://localhost:$Port/solr/#/" -ForegroundColor White
Write-Host "2. Make sure 'products' collection exists" -ForegroundColor White
Write-Host "3. Start the search-service" -ForegroundColor White
Write-Host ""
