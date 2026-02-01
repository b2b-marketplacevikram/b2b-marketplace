# Start API Gateway Service
# This provides a single entry point (port 8080) for all backend services

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Starting API Gateway Service (Port 8080)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to api-gateway directory
Set-Location -Path "backend\api-gateway"

Write-Host "Starting API Gateway..." -ForegroundColor Yellow
Write-Host "All services will be accessible through: http://localhost:8080" -ForegroundColor Green
Write-Host ""
Write-Host "Routes:" -ForegroundColor Cyan
Write-Host "  /api/users/**      -> User Service (8081)" -ForegroundColor Gray
Write-Host "  /api/products/**   -> Product Service (8082)" -ForegroundColor Gray
Write-Host "  /api/orders/**     -> Order Service (8083)" -ForegroundColor Gray
Write-Host "  /api/payments/**   -> Payment Service (8084)" -ForegroundColor Gray
Write-Host "  /api/cart/**       -> Cart Service (8085)" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Run with Maven
mvn spring-boot:run
