# Start MySQL Service Script
# Right-click this file and select "Run with PowerShell as Administrator"

Write-Host "Starting MySQL service..." -ForegroundColor Cyan

try {
    Start-Service MySQL
    Write-Host "`nMySQL service started successfully!" -ForegroundColor Green
    
    # Check status
    $mysqlService = Get-Service MySQL
    Write-Host "`nService Status:" -ForegroundColor Yellow
    $mysqlService | Format-Table Status, Name, DisplayName -AutoSize
    
    # Test connection
    Write-Host "`nTesting MySQL connection on port 3306..." -ForegroundColor Cyan
    $connection = Test-NetConnection -ComputerName localhost -Port 3306 -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Host "MySQL is accepting connections on port 3306!" -ForegroundColor Green
    } else {
        Write-Host "MySQL service is running but not accepting connections yet. Wait a few seconds." -ForegroundColor Yellow
    }
}
catch {
    Write-Host "`nError starting MySQL service:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`nPossible solutions:" -ForegroundColor Yellow
    Write-Host "1. Make sure you ran this script as Administrator" -ForegroundColor White
    Write-Host "2. Check if MySQL is properly installed" -ForegroundColor White
    Write-Host "3. Check MySQL error logs for configuration issues" -ForegroundColor White
}

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
