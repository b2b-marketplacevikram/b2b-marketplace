# OpenSolr Setup Checklist for B2B Marketplace

## ✅ Step-by-Step Setup Progress

### Step 1: Create OpenSolr Account ⏳

**Current Status**: Registration page opened in browser

**Actions**:
1. Fill in the registration form at https://opensolr.com/register
   - Email: [Your email]
   - Password: [Choose a strong password]
   - Company name: B2B Marketplace
   
2. Click "Register" button

3. Check your email for verification link

4. Click the verification link to activate your account

5. Log in to OpenSolr Control Panel

**✓ Mark complete when**: You can log in to https://opensolr.com/admin

---

### Step 2: Create Solr Index ⏳

**Actions**:
1. In OpenSolr Control Panel, click **"Create New Index"** button

2. Configure your index:
   ```
   Index Name: b2b-products
   Solr Version: 8.11.1 (or latest 8.x)
   Region: [Choose closest to your backend - e.g., US East, EU West]
   Plan: Large (€63/month)
   ```

3. Click **"Create Index"** button

4. Wait for provisioning (usually 30-60 seconds)

5. **Save connection details**:
   - Solr URL: ___________________________________
   - Collection Name: b2b-products
   - Port: 443 (HTTPS)
   - API Key (if shown): ___________________________________

**✓ Mark complete when**: Index status shows "Active"

---

### Step 3: Configure Schema ⏳

You have 2 options:

#### Option A: Upload Configuration (Recommended)

1. **Prepare config files**:
   ```powershell
   cd f:\B2B-MarketPlace\b2b-marketplace\solr-config
   
   # Create zip of configuration
   Compress-Archive -Path * -DestinationPath ..\opensolr-config.zip -Force
   ```

2. **Upload in OpenSolr**:
   - Navigate to your index → **Configuration** tab
   - Click **"Upload Configuration"** or **"Manage Config Files"**
   - Select `opensolr-config.zip`
   - Click **"Upload"** and **"Apply Configuration"**

3. **Reload collection**:
   - Click **"Reload Core"** or **"Restart Collection"**

#### Option B: Use Schema Designer (Manual)

1. Go to index → **Schema** tab

2. Click **"Schema Designer"** or **"Edit Schema"**

3. Add these fields one by one:
   ```
   Field Name: id          | Type: string      | Indexed: ✓ | Stored: ✓ | Required: ✓
   Field Name: name        | Type: text_general | Indexed: ✓ | Stored: ✓
   Field Name: description | Type: text_general | Indexed: ✓ | Stored: ✓
   Field Name: category    | Type: string      | Indexed: ✓ | Stored: ✓
   Field Name: categoryId  | Type: plong       | Indexed: ✓ | Stored: ✓
   Field Name: price       | Type: pdouble     | Indexed: ✓ | Stored: ✓
   Field Name: supplierId  | Type: plong       | Indexed: ✓ | Stored: ✓
   Field Name: supplierName| Type: string      | Indexed: ✓ | Stored: ✓
   Field Name: brand       | Type: string      | Indexed: ✓ | Stored: ✓
   Field Name: inStock     | Type: boolean     | Indexed: ✓ | Stored: ✓
   Field Name: sku         | Type: string      | Indexed: ✓ | Stored: ✓
   Field Name: tags        | Type: string      | Indexed: ✓ | Stored: ✓ | Multi: ✓
   Field Name: rating      | Type: pdouble     | Indexed: ✓ | Stored: ✓
   Field Name: reviewCount | Type: pint        | Indexed: ✓ | Stored: ✓
   Field Name: imageUrl    | Type: string      | Indexed: ✗ | Stored: ✓
   Field Name: createdAt   | Type: pdate       | Indexed: ✓ | Stored: ✓
   Field Name: updatedAt   | Type: pdate       | Indexed: ✓ | Stored: ✓
   ```

4. Set **Unique Key** field to: `id`

5. Click **"Save Schema"**

**✓ Mark complete when**: Schema is saved and collection reloaded

---

### Step 4: Test Connection ⏳

**Run these tests in PowerShell**:

```powershell
# REPLACE WITH YOUR ACTUAL SOLR URL FROM STEP 2
$solrUrl = "https://YOUR_INSTANCE.opensolr.com/solr/b2b-products"

# Test 1: Ping Solr
Write-Host "Testing Solr connection..." -ForegroundColor Cyan
try {
    $ping = Invoke-RestMethod -Uri "$solrUrl/admin/ping" -Method Get
    Write-Host "✓ Solr is responding: $($ping.status)" -ForegroundColor Green
} catch {
    Write-Host "✗ Connection failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Check schema
Write-Host "`nChecking schema..." -ForegroundColor Cyan
try {
    $schema = Invoke-RestMethod -Uri "$solrUrl/schema/fields" -Method Get
    Write-Host "✓ Schema loaded with $($schema.fields.Count) fields" -ForegroundColor Green
} catch {
    Write-Host "✗ Schema check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Index a sample product
Write-Host "`nIndexing test product..." -ForegroundColor Cyan
$testProduct = @{
    id = "TEST001"
    name = "Sample Laptop"
    description = "High-performance laptop for business use"
    price = 1299.99
    category = "Electronics"
    categoryId = 1
    supplierId = 1
    supplierName = "Tech Supplier Inc"
    brand = "TechBrand"
    inStock = $true
    sku = "LAP-001"
    tags = @("laptop", "electronics", "business")
    rating = 4.5
    reviewCount = 120
    imageUrl = "https://example.com/laptop.jpg"
    createdAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
    updatedAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
}

try {
    $json = "[$($testProduct | ConvertTo-Json)]"
    $result = Invoke-RestMethod -Uri "$solrUrl/update?commit=true" `
        -Method Post `
        -ContentType "application/json" `
        -Body $json
    Write-Host "✓ Product indexed successfully (Status: $($result.responseHeader.status))" -ForegroundColor Green
} catch {
    Write-Host "✗ Indexing failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Search for the product
Write-Host "`nSearching for test product..." -ForegroundColor Cyan
try {
    $search = Invoke-RestMethod -Uri "$solrUrl/select?q=*:*&rows=10" -Method Get
    Write-Host "✓ Search successful! Found $($search.response.numFound) documents" -ForegroundColor Green
    if ($search.response.docs.Count -gt 0) {
        Write-Host "  First result: $($search.response.docs[0].name)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Search failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✓ All tests complete!" -ForegroundColor Green
```

**✓ Mark complete when**: All 4 tests pass successfully

---

### Step 5: Update Backend Configuration ⏳

**File**: `backend/search-service/src/main/resources/application.properties`

Add or update:

```properties
# OpenSolr Configuration
solr.host=https://YOUR_INSTANCE.opensolr.com/solr
solr.collection=b2b-products
solr.port=443
solr.protocol=https

# Connection settings
solr.connection.timeout=10000
solr.socket.timeout=60000

# Authentication (if your plan requires it)
# solr.username=${SOLR_USERNAME:}
# solr.password=${SOLR_PASSWORD:}
```

**Save your connection details**:

```powershell
# Create .env file for local development
@"
SOLR_HOST=https://YOUR_INSTANCE.opensolr.com/solr
SOLR_COLLECTION=b2b-products
SOLR_PORT=443
SOLR_PROTOCOL=https
"@ | Set-Content -Path "backend/search-service/.env"
```

**✓ Mark complete when**: Configuration files updated with actual OpenSolr URL

---

### Step 6: Migrate Existing Products ⏳

**If you have existing products in local Solr**:

```powershell
# Export from local Solr
$localSolr = "http://localhost:8983/solr/products"
$openSolr = "https://YOUR_INSTANCE.opensolr.com/solr/b2b-products"

Write-Host "Exporting from local Solr..." -ForegroundColor Cyan
try {
    $products = Invoke-RestMethod -Uri "$localSolr/select?q=*:*&rows=10000&wt=json"
    $count = $products.response.numFound
    Write-Host "✓ Exported $count products" -ForegroundColor Green
    
    if ($count -gt 0) {
        # Import to OpenSolr
        Write-Host "`nImporting to OpenSolr..." -ForegroundColor Cyan
        $docs = $products.response.docs | ConvertTo-Json -Depth 10
        $result = Invoke-RestMethod -Uri "$openSolr/update?commit=true" `
            -Method Post `
            -ContentType "application/json" `
            -Body "[$docs]"
        Write-Host "✓ Imported successfully to OpenSolr!" -ForegroundColor Green
    }
} catch {
    Write-Host "Note: Local Solr not running or no data to migrate" -ForegroundColor Yellow
}
```

**✓ Mark complete when**: Products migrated (or skipped if no local data)

---

### Step 7: Test Application Integration ⏳

**Test search service**:

```powershell
# Start search service
cd backend/search-service
mvn spring-boot:run
```

In another terminal:

```powershell
# Test search API endpoint
Invoke-RestMethod -Uri "http://localhost:8083/api/search/products?query=laptop" `
    -Method Get | ConvertTo-Json
```

**Test frontend**:

```powershell
# Start frontend
cd frontend
npm run dev
```

- Open browser: http://localhost:5173
- Use search bar to search for products
- Verify results are returned from OpenSolr

**✓ Mark complete when**: Frontend search returns results from OpenSolr

---

### Step 8: Deploy to Production ⏳

**Update Railway/Render environment variables**:

```bash
SOLR_HOST=https://YOUR_INSTANCE.opensolr.com/solr
SOLR_COLLECTION=b2b-products
SOLR_PORT=443
SOLR_PROTOCOL=https
```

**Redeploy search-service** with new configuration

**✓ Mark complete when**: Production deployment using OpenSolr

---

### Step 9: Set Up Monitoring ⏳

**In OpenSolr Control Panel**:

1. Navigate to **Analytics** tab
2. Review real-time query monitoring
3. Check performance metrics

**Set up alerts**:

1. Go to **Settings** → **Notifications**
2. Configure alerts for:
   - ✓ High error rate (> 5%)
   - ✓ Slow queries (> 1000ms)
   - ✓ Storage usage (> 80%)
   - ✓ Traffic limits approaching

3. Add your email for notifications

**Optional - Download mobile app**:
- Android: https://opensolr.com/opensolr.apk

**✓ Mark complete when**: Monitoring configured and alerts set up

---

## 🎯 Summary

Once all steps are complete, you will have:

✅ OpenSolr account created and verified
✅ Solr index provisioned and configured
✅ Schema uploaded with all product fields
✅ Connection tested and working
✅ Backend configured to use OpenSolr
✅ Existing data migrated (if applicable)
✅ Application tested and working
✅ Production deployed
✅ Monitoring and alerts configured

---

## 📝 Important Information to Save

**OpenSolr Account**:
- Email: _______________________________________
- Password: [Saved securely]

**Connection Details**:
- Solr URL: _______________________________________
- Collection: b2b-products
- Port: 443
- Plan: Large (€63/month)
- Billing: Monthly

**Control Panel**:
- URL: https://opensolr.com/admin
- Analytics: https://opensolr.com/admin/analytics
- Support: https://opensolr.com/contact

---

## 🆘 Need Help?

**OpenSolr Support**:
- Email: support@opensolr.com
- Schedule meeting: https://doodle.com/bp/opensolrsupport/meetings
- Documentation: https://opensolr.com/faq
- API Docs: https://opensolr.com/faq/view/api-index-management

**Common Issues**:
- Connection timeout → Increase timeout in application.properties
- Schema errors → Re-upload configuration files
- Slow queries → Check analytics for optimization suggestions
- Authentication errors → Verify credentials in .env file

---

## Next Steps After Setup

1. **Optimize Search**:
   - Review query analytics in OpenSolr dashboard
   - Adjust field weights for better relevance
   - Add custom query handlers if needed

2. **Enable AI Features**:
   - Try semantic search with OpenSolr AI
   - Set up AI-powered crawling for product descriptions
   - Enable Smart Hints for better user experience

3. **Scale as Needed**:
   - Monitor usage in analytics
   - Upgrade to Enterprise plan when traffic increases
   - Add more indexes for different product categories

4. **Backup Strategy**:
   - OpenSolr handles automatic backups
   - Document your schema configuration
   - Keep a copy of your product data export

---

**Status**: Setup in progress
**Started**: [Current date/time]
**Estimated completion**: 30-45 minutes
