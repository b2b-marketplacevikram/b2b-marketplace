Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "REBUILDING SERVICES WITH MESSAGING FIX" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Rebuild User Service..." -ForegroundColor Yellow
cd backend\user-service
mvn clean package -DskipTests
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build User Service!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ User Service built successfully" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Rebuild Messaging Service..." -ForegroundColor Yellow
cd ..\messaging-service
mvn clean package -DskipTests
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build Messaging Service!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Messaging Service built successfully" -ForegroundColor Green
Write-Host ""

Write-Host "Step 3: Restart User Service..." -ForegroundColor Yellow
cd ..\..
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\START_USER_SERVICE.ps1" -WindowStyle Minimized
Start-Sleep -Seconds 5
Write-Host "✓ User Service started" -ForegroundColor Green
Write-Host ""

Write-Host "Step 4: Restart Messaging Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\START_MESSAGING_SERVICE.ps1" -WindowStyle Minimized
Start-Sleep -Seconds 5
Write-Host "✓ Messaging Service started" -ForegroundColor Green
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "MESSAGING FIX DEPLOYED!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Changes Applied:" -ForegroundColor Cyan
Write-Host "  ✓ Company names now displayed in messages" -ForegroundColor White
Write-Host "  ✓ Conversation filtering fixed" -ForegroundColor White
Write-Host "  ✓ Messages cleared when switching conversations" -ForegroundColor White
Write-Host "  ✓ Typing indicator only shown for current conversation" -ForegroundColor White
Write-Host ""
Write-Host "Services Running:" -ForegroundColor Cyan
Write-Host "  - User Service: http://localhost:8081" -ForegroundColor White
Write-Host "  - Messaging Service: http://localhost:8091" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Refresh your browser" -ForegroundColor White
Write-Host "  2. Login as a buyer" -ForegroundColor White
Write-Host "  3. Click 'Contact Supplier' on a product" -ForegroundColor White
Write-Host "  4. You should now see the supplier's company name!" -ForegroundColor White
Write-Host ""
