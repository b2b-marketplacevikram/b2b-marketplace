# Your OpenSolr Setup - Quick Reference

## ✅ Connection Details

**Instance Information:**
- **Public Hostname**: `us-east-8-10.solrcluster.com`
- **Collection Name**: `b2b_products`
- **Port**: 443 (HTTPS)
- **Full URL**: `https://us-east-8-10.solrcluster.com/solr/b2b_products`
- **Solr Version**: 8.11
- **Region**: US East
- **Created**: January 31, 2026

## 🧪 Quick Test Commands

### 1. Test Connection (Ping)
```powershell
Invoke-RestMethod -Uri "https://us-east-8-10.solrcluster.com/solr/b2b_products/admin/ping"
```
**Expected**: `{"status":"OK"}`

### 2. Check Document Count
```powershell
Invoke-RestMethod -Uri "https://us-east-8-10.solrcluster.com/solr/b2b_products/select?q=*:*&rows=0"
```

### 3. Index a Test Product
```powershell
$solrUrl = "https://us-east-8-10.solrcluster.com/solr/b2b_products"

$product = @{
    id = "TEST001"
    name = "Test Laptop"
    description = "Sample product"
    price = 999.99
    category = "Electronics"
    categoryId = 1
    inStock = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "$solrUrl/update?commit=true" `
    -Method Post `
    -ContentType "application/json" `
    -Body "[$product]"
```

### 4. Search Products
```powershell
# Search all
Invoke-RestMethod -Uri "https://us-east-8-10.solrcluster.com/solr/b2b_products/select?q=*:*&rows=10"

# Search by name
Invoke-RestMethod -Uri "https://us-east-8-10.solrcluster.com/solr/b2b_products/select?q=name:laptop&rows=10"

# Search by category
Invoke-RestMethod -Uri "https://us-east-8-10.solrcluster.com/solr/b2b_products/select?q=category:Electronics&rows=10"
```

### 5. Delete a Document
```powershell
$deleteQuery = @{
    "delete" = @{
        "id" = "TEST001"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://us-east-8-10.solrcluster.com/solr/b2b_products/update?commit=true" `
    -Method Post `
    -ContentType "application/json" `
    -Body $deleteQuery
```

## 🔧 Backend Configuration

### Update application.properties

**File**: `backend/search-service/src/main/resources/application.properties`

```properties
# OpenSolr Configuration
solr.host=https://us-east-8-10.solrcluster.com/solr
solr.collection=b2b_products
solr.port=443
solr.protocol=https
solr.connection.timeout=10000
solr.socket.timeout=60000
```

### Environment Variables (.env)

Create/update: `backend/search-service/.env`

```env
SOLR_HOST=https://us-east-8-10.solrcluster.com/solr
SOLR_COLLECTION=b2b_products
SOLR_PORT=443
SOLR_PROTOCOL=https
```

### For Railway/Render Deployment

Add these environment variables in your deployment:

```bash
SOLR_HOST=https://us-east-8-10.solrcluster.com/solr
SOLR_COLLECTION=b2b_products
SOLR_PORT=443
SOLR_PROTOCOL=https
```

## 📊 Schema Configuration

Your index should have these fields:

| Field | Type | Indexed | Stored | Required |
|-------|------|---------|--------|----------|
| id | string | ✓ | ✓ | ✓ |
| name | text_general | ✓ | ✓ | |
| description | text_general | ✓ | ✓ | |
| category | string | ✓ | ✓ | |
| categoryId | plong | ✓ | ✓ | |
| price | pdouble | ✓ | ✓ | |
| supplierId | plong | ✓ | ✓ | |
| supplierName | string | ✓ | ✓ | |
| brand | string | ✓ | ✓ | |
| inStock | boolean | ✓ | ✓ | |
| sku | string | ✓ | ✓ | |
| tags | string | ✓ | ✓ | MultiValued |
| rating | pdouble | ✓ | ✓ | |
| reviewCount | pint | ✓ | ✓ | |
| imageUrl | string | ✗ | ✓ | |
| createdAt | pdate | ✓ | ✓ | |
| updatedAt | pdate | ✓ | ✓ | |

## 🚀 Next Steps

### Step 1: Run the Test Script
```powershell
cd f:\B2B-MarketPlace\b2b-marketplace
.\test-opensolr.ps1
```

### Step 2: Configure Schema in OpenSolr Dashboard

1. Log in to: https://opensolr.com/admin
2. Click on `b2b_products` index
3. Go to **"Configuration"** or **"Schema"** tab
4. Upload your schema configuration or add fields manually

**Option A: Upload Config (Recommended)**
```powershell
# Create config zip
cd f:\B2B-MarketPlace\b2b-marketplace\solr-config
Compress-Archive -Path * -DestinationPath ..\opensolr-config.zip -Force
```
Then upload `opensolr-config.zip` in OpenSolr dashboard

**Option B: Manual Configuration**
Add each field from the schema table above using the Schema Designer

### Step 3: Update Backend Configuration

```powershell
# Update application.properties
$configFile = "backend/search-service/src/main/resources/application.properties"

# Add these lines:
@"
# OpenSolr Configuration
solr.host=https://us-east-8-10.solrcluster.com/solr
solr.collection=b2b_products
solr.port=443
solr.protocol=https
solr.connection.timeout=10000
solr.socket.timeout=60000
"@ | Add-Content -Path $configFile
```

### Step 4: Test Backend Integration

```powershell
# Start search service
cd backend/search-service
mvn spring-boot:run
```

In another terminal:
```powershell
# Test API endpoint
Invoke-RestMethod -Uri "http://localhost:8083/api/search/products?query=laptop"
```

### Step 5: Index Your Products

If you have existing products in MySQL:

```powershell
# The search service should auto-index products when they're created/updated
# Or trigger a manual reindex via API endpoint
Invoke-RestMethod -Uri "http://localhost:8083/api/search/reindex" -Method Post
```

## 📈 Monitoring

### Access OpenSolr Dashboard
- **URL**: https://opensolr.com/admin
- **Your Index**: Click on `b2b_products`

### Available Tools:
- **Dashboard**: Overview of usage and stats
- **Query Analytics**: Real-time query monitoring
- **Live Query Stream**: See searches as they happen
- **Bandwidth Usage**: Track traffic
- **Tools**: Configuration and management

### Set Up Alerts

1. Go to **Settings** → **Notifications**
2. Add your email
3. Configure alerts for:
   - Storage > 80%
   - Error rate > 5%
   - Slow queries > 1000ms

## 🔍 Testing Checklist

- [ ] Connection test passes (ping returns OK)
- [ ] Can index a test document
- [ ] Can search and retrieve documents
- [ ] Can filter by category
- [ ] Can search by text
- [ ] Backend can connect to OpenSolr
- [ ] Frontend search works
- [ ] Monitoring configured

## 📞 Support

**OpenSolr Support:**
- Dashboard: https://opensolr.com/admin
- Support: https://opensolr.com/contact
- Schedule call: https://doodle.com/bp/opensolrsupport/meetings
- Documentation: https://opensolr.com/faq

## 💰 Current Plan

Based on your screenshot:
- **Plan**: Appears to be a starter/test plan
- **Storage**: 48,828 MB (~48 GB)
- **Bandwidth**: 40 GB/month
- **Region**: US East

If you need to upgrade:
1. Go to **Billing** tab in OpenSolr dashboard
2. Select your desired plan (Large recommended for production)
3. Update billing information

## 🎯 Production Deployment

When ready to deploy:

1. **Update Railway/Render env variables** with OpenSolr URL
2. **Deploy search-service** with new configuration
3. **Trigger full reindex** of products
4. **Test production search** functionality
5. **Monitor** via OpenSolr dashboard

---

**Status**: ✅ OpenSolr instance created and ready
**Next**: Run test script and configure schema
