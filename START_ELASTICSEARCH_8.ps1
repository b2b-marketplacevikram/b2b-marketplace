# Start Elasticsearch 8.11.1 for B2B Marketplace
# Run this script as Administrator

Write-Host "=== Starting Elasticsearch 8.11.1 ===" -ForegroundColor Green

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

$esPath = "C:\elasticsearch-8.11.1"
$configFile = "$esPath\config\elasticsearch.yml"

if (-not (Test-Path $esPath)) {
    Write-Host "ERROR: Elasticsearch 8.11.1 not found at $esPath" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "1. Stopping any running Elasticsearch service..." -ForegroundColor Cyan
try {
    Stop-Service "elasticsearch-service-x64" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
    Write-Host "   Service stopped" -ForegroundColor Green
} catch {
    Write-Host "   No service to stop (this is OK)" -ForegroundColor Yellow
}

Write-Host "`n2. Stopping any running Elasticsearch processes..." -ForegroundColor Cyan
Get-Process | Where-Object {$_.ProcessName -like "*java*" -and $_.Path -like "*elasticsearch*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "`n3. Configuring Elasticsearch (disabling security)..." -ForegroundColor Cyan

# Backup existing config
if (Test-Path $configFile) {
    Copy-Item $configFile "$configFile.backup" -Force -ErrorAction SilentlyContinue
}

# Read current config
$config = Get-Content $configFile -Raw

# Remove any existing security settings
$config = $config -replace "(?m)^xpack\.security\..*$", ""

# Add security disabled settings at the end
$securityConfig = @"


# Security disabled for local development
xpack.security.enabled: false
xpack.security.http.ssl.enabled: false
xpack.security.transport.ssl.enabled: false
"@

$config = $config.TrimEnd() + $securityConfig
Set-Content -Path $configFile -Value $config -Force

Write-Host "   Security disabled in elasticsearch.yml" -ForegroundColor Green

Write-Host "`n4. Starting Elasticsearch 8.11.1..." -ForegroundColor Cyan
Write-Host "   Location: $esPath" -ForegroundColor Gray

# Start Elasticsearch
Set-Location "$esPath\bin"
Start-Process -FilePath ".\elasticsearch.bat" -NoNewWindow -PassThru

Write-Host "`n5. Waiting for Elasticsearch to start (30 seconds)..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

Write-Host "`n6. Testing connection..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:9200" -Method Get
    Write-Host "   SUCCESS! Elasticsearch is running" -ForegroundColor Green
    Write-Host "   Version: $($response.version.number)" -ForegroundColor Green
    Write-Host "   Cluster: $($response.cluster_name)" -ForegroundColor Green
} catch {
    Write-Host "   WARNING: Could not connect to Elasticsearch" -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   Elasticsearch may still be starting up. Wait 30 more seconds and try:" -ForegroundColor Yellow
    Write-Host "   Invoke-RestMethod http://localhost:9200" -ForegroundColor Gray
}

Write-Host "`n=== Elasticsearch Setup Complete ===" -ForegroundColor Green
Write-Host "`nElasticsearch is running at: http://localhost:9200" -ForegroundColor Cyan
Write-Host "Keep this window open. Press Ctrl+C to stop Elasticsearch.`n" -ForegroundColor Yellow

# Keep the window open
Read-Host "Press Enter to stop Elasticsearch and exit"
