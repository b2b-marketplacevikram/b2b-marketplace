# Managed Solr Setup Guide
## OpenSolr & SearchStax Comparison and Setup

This guide helps you set up Apache Solr using managed cloud providers (OpenSolr or SearchStax) for your B2B Marketplace application.

---

## Table of Contents

1. [Platform Comparison](#platform-comparison)
2. [Pricing Breakdown](#pricing-breakdown)
3. [OpenSolr Setup Guide](#opensolr-setup-guide)
4. [SearchStax Setup Guide](#searchstax-setup-guide)
5. [Backend Integration](#backend-integration)
6. [Migration from Self-Hosted Solr](#migration-from-self-hosted-solr)
7. [Testing and Verification](#testing-and-verification)

---

## Platform Comparison

### OpenSolr vs SearchStax

| Feature | OpenSolr | SearchStax |
|---------|----------|------------|
| **Pricing Model** | Fixed monthly tiers | Custom enterprise pricing |
| **Entry Price** | €21/month (Small) | Contact sales (no public pricing) |
| **Setup Time** | 3-5 minutes | Custom onboarding |
| **Best For** | Startups, SMBs, Quick deployment | Enterprise, Large teams |
| **AI Features** | ✅ Semantic search, AI crawling | ✅ Smart Answers, Smart Ranking |
| **SLA** | 98%-99.9% (tier-based) | 99.95% (Premium+) |
| **Support** | Email/Helpdesk | 24/7 Priority + Custom |
| **Free Tier** | ❌ No free tier | ❌ No free tier |
| **Self-Service** | ✅ Yes | ⚠️ Sales-driven |
| **Multi-Index** | ✅ 1-10+ indexes | ✅ Unlimited (custom) |
| **API Access** | ✅ Full REST API | ✅ Full REST API |
| **Monitoring** | ✅ Advanced analytics dashboard | ✅ Enterprise monitoring |
| **WordPress/Drupal** | ✅ Official plugins | ✅ Supported |

### **Recommendation**: 
- **For B2B Marketplace MVP/Launch**: **OpenSolr** (cost-effective, quick setup, good features)
- **For Enterprise Scale**: **SearchStax** (better SLA, premium support, custom solutions)

---

## Pricing Breakdown

### OpenSolr Pricing (€ EUR)

| Plan | Price/Month | Indexes | Storage/Index | Traffic/Index | Uptime SLA | Support |
|------|-------------|---------|---------------|---------------|------------|---------|
| **Small** | €21 (~$23) | 1 | 100 MB | 20 GB | 98% | Critical only |
| **Medium** | €42 (~$46) | 2 | 200 MB | 40 GB | 99% | Priority email |
| **Large** | €63 (~$69) | 3 | 300 MB | 60 GB | 99.9% | Priority email |
| **Enterprise** | €550+ (~$600+) | 10+ | Custom | Unlimited | Custom | 24/7 live support |

**Additional Features**:
- 5% discount for yearly billing
- AI-powered semantic search included
- Advanced monitoring & analytics included
- HTTPS & Auth/ACL security
- WordPress & Drupal integration
- Free trial available (limited)

**Estimated for B2B Marketplace**:
- **Development**: Large plan (€63/month = ~$69/month)
- **Production**: Enterprise plan (€550/month = ~$600/month) for better SLA and support

### SearchStax Pricing

SearchStax does not publish pricing publicly. Based on industry standards:

| Plan | Est. Price/Month | Features |
|------|------------------|----------|
| **Advanced** | $300-500 | High-performance search, Smart Match Assist, 2 languages |
| **Premium** | $800-1,500 | Advanced + AI answers, Smart Ranking, 99.95% SLA |
| **Custom** | $2,000+ | Multi-site, multi-language, custom scaling |

**Features**:
- AI-powered search experiences
- Smart Answers & Smart Ranking
- Multi-site support
- Dedicated support engineer
- Custom SLA agreements

**Contact**: [SearchStax Sales](https://www.searchstax.com/talk-to-sales/)

---

## OpenSolr Setup Guide

### Step 1: Create OpenSolr Account

1. **Register**: Visit [https://opensolr.com/register](https://opensolr.com/register)
2. **Verify email** and complete account setup
3. **Log in** to your OpenSolr Control Panel

### Step 2: Create Solr Collection

1. **Navigate to Dashboard**: Click "Create New Index"
2. **Configure Index**:
   - **Index Name**: `b2b-products`
   - **Solr Version**: `8.11.1` (or latest 8.x)
   - **Region**: Choose closest to your backend (US East, EU West, etc.)
   - **Plan**: Select **Large** (€63/month) for development

3. **Click "Create Index"**

### Step 3: Configure Schema

#### Option A: Upload Configuration Files

1. **Prepare your schema**:
   ```bash
   # Create a zip of your Solr config
   cd f:\B2B-MarketPlace\b2b-marketplace\solr-config
   Compress-Archive -Path * -DestinationPath solr-config.zip
   ```

2. **Upload in OpenSolr**:
   - Go to your index → **Configuration** tab
   - Click **Upload Configuration**
   - Select `solr-config.zip`
   - Click **Apply Configuration**

#### Option B: Manual Schema Setup

1. **In OpenSolr Control Panel**:
   - Navigate to **Schema** section
   - Click **Schema Designer**

2. **Define Product Fields**:
   ```xml
   <!-- Add these fields via the Schema Designer -->
   <field name="id" type="string" indexed="true" stored="true" required="true" />
   <field name="name" type="text_general" indexed="true" stored="true" />
   <field name="description" type="text_general" indexed="true" stored="true" />
   <field name="category" type="string" indexed="true" stored="true" />
   <field name="categoryId" type="plong" indexed="true" stored="true" />
   <field name="price" type="pdouble" indexed="true" stored="true" />
   <field name="supplierId" type="plong" indexed="true" stored="true" />
   <field name="supplierName" type="string" indexed="true" stored="true" />
   <field name="brand" type="string" indexed="true" stored="true" />
   <field name="inStock" type="boolean" indexed="true" stored="true" />
   <field name="sku" type="string" indexed="true" stored="true" />
   <field name="tags" type="string" indexed="true" stored="true" multiValued="true" />
   <field name="rating" type="pdouble" indexed="true" stored="true" />
   <field name="reviewCount" type="pint" indexed="true" stored="true" />
   <field name="imageUrl" type="string" indexed="false" stored="true" />
   <field name="createdAt" type="pdate" indexed="true" stored="true" />
   <field name="updatedAt" type="pdate" indexed="true" stored="true" />
   ```

3. **Set Unique Key**: `id`

4. **Save Schema**

### Step 4: Get Connection Details

1. **In OpenSolr Dashboard**:
   - Go to your index page
   - Note the following:
     - **Solr URL**: `https://[your-instance].opensolr.com/solr/[index-name]`
     - **API Key** (if required)
     - **Port**: Usually 8983 or 443 (HTTPS)

2. **Example Connection**:
   ```
   URL: https://abc123.opensolr.com/solr/b2b-products
   Port: 443
   Protocol: HTTPS
   ```

### Step 5: Test Connection

Using PowerShell:

```powershell
# Test Solr ping
$solrUrl = "https://abc123.opensolr.com/solr/b2b-products"
Invoke-RestMethod -Uri "$solrUrl/admin/ping" -Method Get

# Should return: {"status":"OK"}
```

### Step 6: Index Sample Data

```powershell
# Index a test product
$solrUrl = "https://abc123.opensolr.com/solr/b2b-products"

$product = @{
    id = "TEST001"
    name = "Test Product"
    description = "Sample product for testing"
    price = 99.99
    category = "Electronics"
    categoryId = 1
    inStock = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "$solrUrl/update?commit=true" `
    -Method Post `
    -ContentType "application/json" `
    -Body "[$product]"
```

### Step 7: Query Test

```powershell
# Search for the test product
Invoke-RestMethod -Uri "$solrUrl/select?q=*:*&rows=10" -Method Get
```

---

## SearchStax Setup Guide

### Step 1: Contact Sales

1. **Request Demo**: Visit [https://www.searchstax.com/schedule-a-demo/](https://www.searchstax.com/schedule-a-demo/)
2. **Provide Requirements**:
   - Number of documents: ~10,000-100,000 products
   - Expected queries/day: Estimate based on traffic
   - Data volume: ~500 MB - 5 GB
   - Regions needed: US, EU, etc.

### Step 2: Onboarding

SearchStax will:
1. Create your account
2. Provision Solr cluster
3. Provide dedicated support engineer
4. Set up monitoring and alerting

### Step 3: Configuration

1. **Access SearchStax Console**:
   - Log in to provided dashboard
   - Navigate to your deployment

2. **Upload Configuration**:
   - Similar to OpenSolr, upload your `solr-config` files
   - Or use SearchStax's configuration wizard

3. **Schema Setup**:
   - Use the same schema as defined for OpenSolr
   - SearchStax may provide optimization recommendations

### Step 4: Get Connection Details

SearchStax provides:
- **Deployment URL**: `https://[your-deployment].searchstax.com/solr/[collection]`
- **API credentials**: Username/password or API key
- **Client libraries**: Java, Python, Node.js SDKs

### Step 5: Index and Test

Similar process to OpenSolr using the provided URL and credentials.

---

## Backend Integration

### Update Search Service Configuration

Update your search-service configuration to use the managed Solr instance.

#### 1. Update `application.properties`

**File**: `backend/search-service/src/main/resources/application.properties`

```properties
# Managed Solr Configuration
# OpenSolr
solr.host=https://abc123.opensolr.com/solr
solr.collection=b2b-products
solr.port=443
solr.protocol=https

# Or SearchStax
# solr.host=https://your-deployment.searchstax.com/solr
# solr.collection=products
# solr.port=443
# solr.protocol=https

# Authentication (if required)
solr.username=${SOLR_USERNAME:}
solr.password=${SOLR_PASSWORD:}
solr.api.key=${SOLR_API_KEY:}

# Connection settings
solr.connection.timeout=10000
solr.socket.timeout=60000
```

#### 2. Update Environment Variables

For Railway/Render deployment:

```bash
# OpenSolr
SOLR_HOST=https://abc123.opensolr.com/solr
SOLR_COLLECTION=b2b-products
SOLR_PORT=443
SOLR_PROTOCOL=https

# SearchStax (with auth)
SOLR_HOST=https://your-deployment.searchstax.com/solr
SOLR_COLLECTION=products
SOLR_USERNAME=your-username
SOLR_PASSWORD=your-password
```

#### 3. Update Java Configuration

**File**: `backend/search-service/src/main/java/com/b2b/searchservice/config/SolrConfig.java`

```java
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SolrConfig {

    @Value("${solr.host}")
    private String solrHost;

    @Value("${solr.collection}")
    private String collection;

    @Value("${solr.username:#{null}}")
    private String username;

    @Value("${solr.password:#{null}}")
    private String password;

    @Bean
    public HttpSolrClient solrClient() {
        String url = solrHost + "/" + collection;
        
        HttpSolrClient.Builder builder = new HttpSolrClient.Builder(url)
            .withConnectionTimeout(10000)
            .withSocketTimeout(60000);

        // Add basic auth if credentials provided
        if (username != null && password != null) {
            builder.withBasicAuthCredentials(username, password);
        }

        return builder.build();
    }
}
```

#### 4. Update Product Indexing Service

**File**: `backend/search-service/src/main/java/com/b2b/searchservice/service/ProductIndexService.java`

```java
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.response.UpdateResponse;
import org.apache.solr.common.SolrInputDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProductIndexService {

    @Autowired
    private SolrClient solrClient;

    public void indexProduct(Product product) {
        try {
            SolrInputDocument doc = new SolrInputDocument();
            doc.addField("id", product.getId().toString());
            doc.addField("name", product.getName());
            doc.addField("description", product.getDescription());
            doc.addField("price", product.getPrice());
            doc.addField("category", product.getCategory());
            doc.addField("categoryId", product.getCategoryId());
            doc.addField("supplierId", product.getSupplierId());
            doc.addField("supplierName", product.getSupplierName());
            doc.addField("brand", product.getBrand());
            doc.addField("inStock", product.getInStock());
            doc.addField("sku", product.getSku());
            doc.addField("imageUrl", product.getImageUrl());
            doc.addField("rating", product.getRating());
            doc.addField("reviewCount", product.getReviewCount());
            
            // Add tags if available
            if (product.getTags() != null) {
                for (String tag : product.getTags()) {
                    doc.addField("tags", tag);
                }
            }

            UpdateResponse response = solrClient.add(doc);
            solrClient.commit();
            
            System.out.println("Product indexed: " + product.getId() + 
                             " Status: " + response.getStatus());
        } catch (Exception e) {
            throw new RuntimeException("Failed to index product: " + e.getMessage(), e);
        }
    }

    public void deleteProduct(Long productId) {
        try {
            solrClient.deleteById(productId.toString());
            solrClient.commit();
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete product: " + e.getMessage(), e);
        }
    }

    public void indexAllProducts(List<Product> products) {
        try {
            List<SolrInputDocument> docs = new ArrayList<>();
            
            for (Product product : products) {
                SolrInputDocument doc = new SolrInputDocument();
                // ... populate fields as above
                docs.add(doc);
            }

            solrClient.add(docs);
            solrClient.commit();
        } catch (Exception e) {
            throw new RuntimeException("Failed to bulk index products: " + e.getMessage(), e);
        }
    }
}
```

---

## Migration from Self-Hosted Solr

### Export Data from Local Solr

```powershell
# Export all products from local Solr
$localSolrUrl = "http://localhost:8983/solr/products"

# Get all documents
$response = Invoke-RestMethod -Uri "$localSolrUrl/select?q=*:*&rows=10000&wt=json"

# Save to file
$response.response.docs | ConvertTo-Json -Depth 10 | 
    Set-Content -Path "solr-export.json"
```

### Import to Managed Solr

```powershell
# Import to OpenSolr/SearchStax
$managedSolrUrl = "https://abc123.opensolr.com/solr/b2b-products"
$products = Get-Content "solr-export.json" | ConvertFrom-Json

# Index in batches
Invoke-RestMethod -Uri "$managedSolrUrl/update?commit=true" `
    -Method Post `
    -ContentType "application/json" `
    -Body ($products | ConvertTo-Json -Depth 10)
```

### Update Application Configuration

1. **Stop local Solr**:
   ```powershell
   docker-compose -f docker\docker-compose-solr.yml down
   ```

2. **Update environment variables** as shown in Backend Integration section

3. **Restart search-service**:
   ```powershell
   cd backend\search-service
   mvn spring-boot:run
   ```

---

## Testing and Verification

### 1. Health Check

```powershell
# Check Solr health
$solrUrl = "https://abc123.opensolr.com/solr/b2b-products"
Invoke-RestMethod -Uri "$solrUrl/admin/ping"
```

### 2. Index Count

```powershell
# Count indexed documents
Invoke-RestMethod -Uri "$solrUrl/select?q=*:*&rows=0"
# Check numFound in response
```

### 3. Search Test

```powershell
# Search for products
Invoke-RestMethod -Uri "$solrUrl/select?q=name:laptop&rows=10"
```

### 4. Application Integration Test

1. **Frontend Search**:
   - Open your frontend: `http://localhost:5173`
   - Use the search bar to search for products
   - Verify results are returned from managed Solr

2. **API Test**:
   ```powershell
   # Test search API
   Invoke-RestMethod -Uri "http://localhost:8083/api/search/products?query=laptop" `
       -Method Get
   ```

### 5. Performance Test

```powershell
# Test query performance
Measure-Command {
    Invoke-RestMethod -Uri "$solrUrl/select?q=*:*&rows=100"
}
```

---

## Cost Comparison: Self-Hosted vs Managed

### Self-Hosted Solr (Railway/Render)

| Component | Monthly Cost |
|-----------|--------------|
| Solr Container (Standard) | $25 |
| Storage (SSD) | ~$5 |
| Bandwidth | Included |
| **Total** | **$30/month** |

**Pros**: Low cost
**Cons**: 
- Manual maintenance
- No managed backups
- No dedicated support
- Lower SLA
- You manage scaling

### OpenSolr Large Plan

| Component | Monthly Cost |
|-----------|--------------|
| Solr Hosting (Large) | €63 (~$69) |
| **Total** | **$69/month** |

**Pros**:
- 99.9% SLA
- Managed backups
- Advanced monitoring
- AI features included
- Priority support
- Auto-scaling

**Cons**: Higher cost

### Recommendation

- **Development/Testing**: Self-hosted on Railway ($30/month)
- **Production MVP**: OpenSolr Large ($69/month)
- **Production Scale**: OpenSolr Enterprise ($600/month) or SearchStax (custom)

---

## Monitoring and Maintenance

### OpenSolr Monitoring

1. **Access Analytics**:
   - Log in to OpenSolr Control Panel
   - Navigate to **Analytics** tab
   - View real-time query monitoring, performance metrics

2. **Set Up Alerts**:
   - Go to **Settings** → **Notifications**
   - Configure email alerts for:
     - High error rates
     - Slow queries
     - Storage limits

3. **Mobile App**:
   - Download OpenSolr Android app
   - Monitor on the go

### SearchStax Monitoring

- Access provided monitoring dashboard
- Integrated with enterprise tools (Datadog, New Relic, etc.)
- Dedicated support engineer

---

## Troubleshooting

### Issue: Connection Timeout

**Solution**:
```properties
# Increase timeout in application.properties
solr.connection.timeout=30000
solr.socket.timeout=120000
```

### Issue: Authentication Failed

**Solution**:
- Verify username/password or API key
- Check if IP whitelisting is required (OpenSolr/SearchStax)
- Ensure HTTPS is used

### Issue: Slow Queries

**Solution**:
1. Check OpenSolr/SearchStax analytics for slow queries
2. Add indexes to frequently searched fields
3. Optimize query syntax
4. Consider upgrading plan for more resources

### Issue: Schema Update Not Reflecting

**Solution**:
1. Reload collection:
   ```bash
   curl "$SOLR_URL/admin/collections?action=RELOAD&name=b2b-products"
   ```
2. Re-index all documents

---

## Next Steps

1. ✅ Choose platform: OpenSolr or SearchStax
2. ✅ Create account and provision Solr instance
3. ✅ Upload schema configuration
4. ✅ Update backend configuration
5. ✅ Migrate data from self-hosted to managed
6. ✅ Test integration
7. ✅ Set up monitoring and alerts
8. ✅ Deploy to production

---

## Support Resources

### OpenSolr
- **Documentation**: [https://opensolr.com/faq](https://opensolr.com/faq)
- **Support**: [https://opensolr.com/contact](https://opensolr.com/contact)
- **API Docs**: [https://opensolr.com/faq/view/api-index-management](https://opensolr.com/faq/view/api-index-management)
- **Schedule Meeting**: [https://doodle.com/bp/opensolrsupport/meetings](https://doodle.com/bp/opensolrsupport/meetings)

### SearchStax
- **Documentation**: [https://www.searchstax.com/docs/](https://www.searchstax.com/docs/)
- **Support**: [https://www.searchstax.com/support/](https://www.searchstax.com/support/)
- **Contact Sales**: [https://www.searchstax.com/talk-to-sales/](https://www.searchstax.com/talk-to-sales/)

---

## Conclusion

**For your B2B Marketplace**:

1. **Start with OpenSolr Large Plan** (€63/month = ~$69/month):
   - Quick setup (< 5 minutes)
   - Good performance and SLA
   - Advanced features included
   - Cost-effective for MVP

2. **Scale to OpenSolr Enterprise** when you need:
   - Better SLA
   - 24/7 support
   - More indexes
   - Higher traffic

3. **Consider SearchStax** when you have:
   - Enterprise customers requiring 99.95%+ SLA
   - Budget for premium support
   - Complex multi-site requirements

**Total Estimated Cost (Production with OpenSolr)**:
- 9 Microservices on Render Standard: $225/month
- MySQL (Render Postgres Pro 8GB): $100/month
- OpenSolr Large: $69/month
- **Total: ~$394/month**

Much more cost-effective than running everything on managed services!
