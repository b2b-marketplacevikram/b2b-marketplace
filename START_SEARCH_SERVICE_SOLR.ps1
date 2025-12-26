# Start Search Service
# This script starts the Solr-based search service for the B2B Marketplace

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Search Service" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Solr is running
Write-Host "Checking Solr status..." -ForegroundColor Yellow
$solrUrl = "http://localhost:8983/solr"

try {
    $response = Invoke-RestMethod -Uri "$solrUrl/admin/cores?action=STATUS" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "Solr is running" -ForegroundColor Green
} catch {
    Write-Host "WARNING: Solr is not running!" -ForegroundColor Yellow
    Write-Host "The search service will start but search functionality will be limited." -ForegroundColor Yellow
    Write-Host "Run .\SETUP_SOLR.ps1 or .\SETUP_SOLR_ENHANCED.ps1 to start Solr." -ForegroundColor Yellow
    Write-Host ""
}

# Navigate to search service directory
$searchServiceDir = "$PSScriptRoot\backend\search-service"

if (-not (Test-Path $searchServiceDir)) {
    Write-Host "ERROR: Search service directory not found at $searchServiceDir" -ForegroundColor Red
    exit 1
}

Write-Host "Starting search service..." -ForegroundColor Yellow
Write-Host "Directory: $searchServiceDir" -ForegroundColor Gray
Write-Host ""

Set-Location $searchServiceDir

# Run Maven Spring Boot
Write-Host "Running: mvn spring-boot:run" -ForegroundColor Cyan
Write-Host ""

mvn spring-boot:run

# If Maven exits, show message
Write-Host ""
Write-Host "Search service stopped." -ForegroundColor Yellow
