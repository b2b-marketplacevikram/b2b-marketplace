# Elasticsearch Setup and Start Script for B2B Marketplace

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Elasticsearch Setup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan

$elasticsearchVersion = "8.11.1"
$installDir = "C:\elasticsearch"
$downloadUrl = "https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-$elasticsearchVersion-windows-x86_64.zip"
$zipFile = "elasticsearch.zip"

# Check if Elasticsearch is already installed
if (Test-Path "$installDir\elasticsearch-$elasticsearchVersion") {
    Write-Host "`nElasticsearch is already installed at $installDir" -ForegroundColor Green
    Write-Host "Starting Elasticsearch..." -ForegroundColor Yellow
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $installDir\elasticsearch-$elasticsearchVersion\bin; .\elasticsearch.bat"
    
    Write-Host "`nElasticsearch is starting..." -ForegroundColor Green
    Write-Host "It will be available at: http://localhost:9200" -ForegroundColor Cyan
    Write-Host "Wait 30-60 seconds for it to fully start" -ForegroundColor Yellow
    exit
}

Write-Host "`nElasticsearch not found. Would you like to download and install it?" -ForegroundColor Yellow
Write-Host "Download size: ~350 MB" -ForegroundColor Gray
Write-Host "Installation path: $installDir" -ForegroundColor Gray
$response = Read-Host "`nProceed with installation? (Y/N)"

if ($response -ne 'Y' -and $response -ne 'y') {
    Write-Host "`nInstallation cancelled." -ForegroundColor Red
    Write-Host "You can install Elasticsearch manually from: https://www.elastic.co/downloads/elasticsearch" -ForegroundColor Yellow
    exit
}

# Create installation directory
New-Item -ItemType Directory -Force -Path $installDir | Out-Null

Write-Host "`nDownloading Elasticsearch $elasticsearchVersion..." -ForegroundColor Yellow
Write-Host "This may take several minutes..." -ForegroundColor Gray

try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile "$installDir\$zipFile" -UseBasicParsing
    Write-Host "Download complete!" -ForegroundColor Green
} catch {
    Write-Host "`nDownload failed: $_" -ForegroundColor Red
    Write-Host "Please download manually from: $downloadUrl" -ForegroundColor Yellow
    exit
}

Write-Host "`nExtracting Elasticsearch..." -ForegroundColor Yellow
try {
    Expand-Archive -Path "$installDir\$zipFile" -DestinationPath $installDir -Force
    Remove-Item "$installDir\$zipFile" -Force
    Write-Host "Extraction complete!" -ForegroundColor Green
} catch {
    Write-Host "`nExtraction failed: $_" -ForegroundColor Red
    exit
}

# Configure Elasticsearch
Write-Host "`nConfiguring Elasticsearch..." -ForegroundColor Yellow
$configFile = "$installDir\elasticsearch-$elasticsearchVersion\config\elasticsearch.yml"

# Disable security for local development
Add-Content -Path $configFile -Value "`n# Development settings"
Add-Content -Path $configFile -Value "xpack.security.enabled: false"
Add-Content -Path $configFile -Value "xpack.security.enrollment.enabled: false"
Add-Content -Path $configFile -Value "xpack.security.http.ssl.enabled: false"
Add-Content -Path $configFile -Value "xpack.security.transport.ssl.enabled: false"

Write-Host "Configuration complete!" -ForegroundColor Green

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "  Installation Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan

Write-Host "`nStarting Elasticsearch..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $installDir\elasticsearch-$elasticsearchVersion\bin; .\elasticsearch.bat"

Write-Host "`nElasticsearch is starting..." -ForegroundColor Green
Write-Host "URL: http://localhost:9200" -ForegroundColor Cyan
Write-Host "`nWait 30-60 seconds, then test with:" -ForegroundColor Yellow
Write-Host "  Invoke-RestMethod http://localhost:9200" -ForegroundColor White

Write-Host "`nTo start Elasticsearch in the future, run:" -ForegroundColor Gray
Write-Host "  .\SETUP_ELASTICSEARCH.ps1" -ForegroundColor White
