# Railway Quick Deploy Script for B2B Marketplace
# This script helps you deploy all services to Railway

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   B2B Marketplace - Railway Deployment Script   " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Railway CLI is installed
Write-Host "Checking for Railway CLI..." -ForegroundColor Yellow
$railwayInstalled = Get-Command railway -ErrorAction SilentlyContinue

if (-not $railwayInstalled) {
    Write-Host "Railway CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g @railway/cli
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install Railway CLI. Please install manually:" -ForegroundColor Red
        Write-Host "  npm install -g @railway/cli" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "Railway CLI found!" -ForegroundColor Green
Write-Host ""

# Login to Railway
Write-Host "Logging in to Railway..." -ForegroundColor Yellow
railway login

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to login to Railway" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Step 1: Create Railway Project                " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$projectName = Read-Host "Enter project name (default: b2b-marketplace)"
if ([string]::IsNullOrWhiteSpace($projectName)) {
    $projectName = "b2b-marketplace"
}

Write-Host "Creating project: $projectName" -ForegroundColor Yellow
railway init --name $projectName

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Step 2: Add MySQL Database                    " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Adding MySQL plugin to Railway..." -ForegroundColor Yellow
Write-Host "Please go to Railway Dashboard and:" -ForegroundColor Yellow
Write-Host "  1. Click '+ New' -> 'Database' -> 'Add MySQL'" -ForegroundColor White
Write-Host "  2. Wait for MySQL to provision" -ForegroundColor White
Write-Host "  3. Note down the connection details" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter when MySQL is ready..."

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Step 3: Initialize Database Schema            " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$initDb = Read-Host "Do you want to initialize database schema? (y/n)"
if ($initDb -eq "y" -or $initDb -eq "Y") {
    Write-Host "Please provide MySQL connection details from Railway:" -ForegroundColor Yellow
    $mysqlHost = Read-Host "MySQL Host"
    $mysqlPort = Read-Host "MySQL Port"
    $mysqlUser = Read-Host "MySQL User (default: root)"
    if ([string]::IsNullOrWhiteSpace($mysqlUser)) { $mysqlUser = "root" }
    $mysqlPassword = Read-Host "MySQL Password" -AsSecureString
    $mysqlPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($mysqlPassword))
    $mysqlDatabase = Read-Host "MySQL Database (default: railway)"
    if ([string]::IsNullOrWhiteSpace($mysqlDatabase)) { $mysqlDatabase = "railway" }

    Write-Host "Importing database schema..." -ForegroundColor Yellow
    
    # Import schema files
    $schemaFiles = @(
        "database\schema.sql",
        "database\sample_data.sql",
        "database\sample_hierarchical_categories.sql"
    )

    foreach ($file in $schemaFiles) {
        if (Test-Path $file) {
            Write-Host "Importing $file..." -ForegroundColor Yellow
            mysql -h $mysqlHost -P $mysqlPort -u $mysqlUser -p$mysqlPasswordPlain $mysqlDatabase < $file
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✓ $file imported successfully" -ForegroundColor Green
            } else {
                Write-Host "  ✗ Failed to import $file" -ForegroundColor Red
            }
        }
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Step 4: Create Environment Variables File     " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Create .env template
$envTemplate = @"
# Railway Environment Variables for B2B Marketplace
# Copy these to Railway Dashboard -> Service -> Variables

# ========================================
# DATABASE CONFIGURATION
# ========================================
SPRING_DATASOURCE_URL=jdbc:mysql://\${{MySQL.MYSQLHOST}}:\${{MySQL.MYSQLPORT}}/\${{MySQL.MYSQLDATABASE}}
SPRING_DATASOURCE_USERNAME=\${{MySQL.MYSQLUSER}}
SPRING_DATASOURCE_PASSWORD=\${{MySQL.MYSQLPASSWORD}}

# ========================================
# JPA/HIBERNATE CONFIGURATION
# ========================================
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_SHOW_SQL=false
SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT=org.hibernate.dialect.MySQLDialect

# ========================================
# JWT CONFIGURATION
# ========================================
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-256-bits
JWT_EXPIRATION=86400000

# ========================================
# LOGGING
# ========================================
LOG_LEVEL=INFO
SPRING_PROFILES_ACTIVE=production

# ========================================
# CORS (Update with your frontend URL)
# ========================================
CORS_ALLOWED_ORIGINS=https://your-frontend.up.railway.app,https://*.railway.app

# ========================================
# PAYMENT GATEWAY (Add your keys)
# ========================================
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# ========================================
# EMAIL CONFIGURATION
# ========================================
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-app-specific-password
SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH=true
SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE=true

# ========================================
# SOLR/SEARCH CONFIGURATION
# ========================================
SOLR_URL=http://localhost:8983/solr
SOLR_COLLECTION=products

# ========================================
# SERVICE URLS (Update after deploying each service)
# ========================================
USER_SERVICE_URL=https://user-service.up.railway.app
PRODUCT_SERVICE_URL=https://product-service.up.railway.app
ORDER_SERVICE_URL=https://order-service.up.railway.app
PAYMENT_SERVICE_URL=https://payment-service.up.railway.app
CART_SERVICE_URL=https://cart-service.up.railway.app
ADMIN_SERVICE_URL=https://admin-service.up.railway.app
SEARCH_SERVICE_URL=https://search-service.up.railway.app
EMAIL_SERVICE_URL=https://email-service.up.railway.app
NOTIFICATION_SERVICE_URL=https://notification-service.up.railway.app
MESSAGING_SERVICE_URL=https://messaging-service.up.railway.app
"@

$envTemplate | Out-File -FilePath "railway.env" -Encoding UTF8
Write-Host "Created railway.env file with environment variable templates" -ForegroundColor Green
Write-Host "Please edit railway.env and add your actual values" -ForegroundColor Yellow

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Step 5: Service Deployment Instructions        " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{Name="api-gateway"; Port=8080; Path="backend/api-gateway"},
    @{Name="user-service"; Port=8081; Path="backend/user-service"},
    @{Name="product-service"; Port=8082; Path="backend/product-service"},
    @{Name="order-service"; Port=8083; Path="backend/order-service"},
    @{Name="payment-service"; Port=8084; Path="backend/payment-service"},
    @{Name="cart-service"; Port=8085; Path="backend/cart-service"},
    @{Name="admin-service"; Port=8086; Path="backend/admin-service"},
    @{Name="search-service"; Port=8087; Path="backend/search-service"},
    @{Name="email-service"; Port=8088; Path="backend/email-service"}
)

Write-Host "To deploy each service to Railway, follow these steps:" -ForegroundColor Yellow
Write-Host ""

foreach ($service in $services) {
    Write-Host "[$($service.Name)]" -ForegroundColor Cyan
    Write-Host "  1. Go to Railway Dashboard" -ForegroundColor White
    Write-Host "  2. Click '+ New' -> 'GitHub Repo'" -ForegroundColor White
    Write-Host "  3. Select this repository" -ForegroundColor White
    Write-Host "  4. Settings -> Root Directory: $($service.Path)" -ForegroundColor White
    Write-Host "  5. Settings -> Dockerfile Path: $($service.Path)/Dockerfile" -ForegroundColor White
    Write-Host "  6. Variables -> Add variables from railway.env" -ForegroundColor White
    Write-Host "  7. Deploy!" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Step 6: Alternative - Use Railway CLI         " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "You can also deploy using Railway CLI:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  # Link project" -ForegroundColor Gray
Write-Host "  railway link" -ForegroundColor White
Write-Host "" -ForegroundColor Gray
Write-Host "  # Deploy a service" -ForegroundColor Gray
Write-Host "  cd backend/api-gateway" -ForegroundColor White
Write-Host "  railway up" -ForegroundColor White
Write-Host ""

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Deployment Summary                             " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✓ Railway CLI installed and logged in" -ForegroundColor Green
Write-Host "✓ Project created: $projectName" -ForegroundColor Green
Write-Host "✓ Environment variables template created: railway.env" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Add MySQL plugin in Railway Dashboard" -ForegroundColor White
Write-Host "  2. Initialize database schema (if not done)" -ForegroundColor White
Write-Host "  3. Edit railway.env with your actual values" -ForegroundColor White
Write-Host "  4. Deploy each microservice using Railway Dashboard or CLI" -ForegroundColor White
Write-Host "  5. Test each service endpoint" -ForegroundColor White
Write-Host "  6. Deploy frontend" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see RAILWAY_DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host ""

# Open Railway dashboard
$openDashboard = Read-Host "Open Railway Dashboard in browser? (y/n)"
if ($openDashboard -eq "y" -or $openDashboard -eq "Y") {
    railway open
}

Write-Host ""
Write-Host "Deployment preparation complete! 🚀" -ForegroundColor Green
Write-Host ""
