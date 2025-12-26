# Setup Database for B2B Marketplace
# This script creates the database schema and inserts sample data

Write-Host "=== B2B Marketplace - Database Setup ===" -ForegroundColor Cyan
Write-Host ""

$mysqlPassword = "1234"
$databaseName = "b2b_marketplace"

# Check if MySQL is running
Write-Host "Checking MySQL service..." -ForegroundColor Yellow
$mysqlService = Get-Service MySQL -ErrorAction SilentlyContinue
if ($mysqlService.Status -ne 'Running') {
    Write-Host "ERROR: MySQL service is not running!" -ForegroundColor Red
    Write-Host "Please start MySQL service first." -ForegroundColor Yellow
    exit 1
}
Write-Host "MySQL service is running!" -ForegroundColor Green
Write-Host ""

# Find MySQL installation
Write-Host "Looking for MySQL installation..." -ForegroundColor Yellow
$mysqlPaths = @(
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe",
    "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\xampp\mysql\bin\mysql.exe"
)

$mysqlExe = $null
foreach ($path in $mysqlPaths) {
    if (Test-Path $path) {
        $mysqlExe = $path
        break
    }
}

if (-not $mysqlExe) {
    Write-Host "ERROR: Could not find mysql.exe" -ForegroundColor Red
    Write-Host "Please install MySQL or update the path in this script." -ForegroundColor Yellow
    exit 1
}

Write-Host "Found MySQL at: $mysqlExe" -ForegroundColor Green
Write-Host ""

# Create database schema
Write-Host "Creating database schema..." -ForegroundColor Yellow
$schemaFile = "C:\b2b_sample\database\schema.sql"
if (Test-Path $schemaFile) {
    & $mysqlExe -u root -p$mysqlPassword -e "source $schemaFile" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database schema created successfully!" -ForegroundColor Green
    } else {
        Write-Host "Warning: There might have been issues creating the schema." -ForegroundColor Yellow
    }
} else {
    Write-Host "ERROR: schema.sql not found at $schemaFile" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Insert sample data
Write-Host "Inserting sample data..." -ForegroundColor Yellow
$sampleDataFile = "C:\b2b_sample\database\sample_data.sql"
if (Test-Path $sampleDataFile) {
    & $mysqlExe -u root -p$mysqlPassword -e "source $sampleDataFile" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Sample data inserted successfully!" -ForegroundColor Green
    } else {
        Write-Host "Warning: There might have been issues inserting sample data." -ForegroundColor Yellow
    }
} else {
    Write-Host "ERROR: sample_data.sql not found at $sampleDataFile" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Verify database
Write-Host "Verifying database..." -ForegroundColor Yellow
$verifyQuery = "USE $databaseName; SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = '$databaseName';"
$result = & $mysqlExe -u root -p$mysqlPassword -e $verifyQuery 2>&1

Write-Host "Database verification:" -ForegroundColor Green
Write-Host $result
Write-Host ""

Write-Host "=== Database Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Build backend: cd backend; mvn clean install" -ForegroundColor White
Write-Host "2. Start user service: cd backend\user-service; mvn spring-boot:run" -ForegroundColor White
Write-Host ""
