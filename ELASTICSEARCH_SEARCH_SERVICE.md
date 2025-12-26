# Elasticsearch Search Service Implementation

## Overview
The Search Service provides advanced full-text search capabilities powered by Elasticsearch for the B2B Marketplace platform.

## Features
- **Full-text search** with fuzzy matching for typo tolerance
- **Multi-field search** across product name, description, tags, category, and supplier
- **Field weighting** (name^3, description^2) for relevance tuning
- **Advanced filtering** by category, supplier, price range, MOQ, rating, origin, tags
- **Pagination** with configurable page size
- **Automatic data synchronization** from MySQL to Elasticsearch
- **Relevance scoring** for search results

## Architecture

### Components
1. **ProductDocument** - Elasticsearch document model
2. **ProductSearchRepository** - Spring Data Elasticsearch repository
3. **ElasticsearchService** - Core search logic with query building
4. **SearchController** - REST API endpoints
5. **IndexSyncService** - Automatic data synchronization
6. **ProductRepository** - JPA repository for MySQL access

### Port
- **8086** - Search Service HTTP port

### Dependencies
- Elasticsearch 8.11.1
- Spring Data Elasticsearch 5.2.0
- MySQL Connector for data sync

## Installation

### 1. Install Elasticsearch
```powershell
# Run the setup script
.\SETUP_ELASTICSEARCH.ps1

# This will:
# - Download Elasticsearch 8.11.1 (~350 MB)
# - Extract to C:\elasticsearch
# - Configure for local development (security disabled)
# - Start Elasticsearch on port 9200
```

### 2. Verify Elasticsearch
```powershell
# Test that Elasticsearch is running
Invoke-RestMethod http://localhost:9200

# Expected response:
# {
#   "name" : "DESKTOP-...",
#   "cluster_name" : "elasticsearch",
#   "version" : {
#     "number" : "8.11.1",
#     ...
#   }
# }
```

### 3. Build Search Service
```powershell
cd c:\b2b_sample\backend\search-service
mvn clean install -DskipTests
```

### 4. Start Search Service
```powershell
# Option 1: Use startup script
.\START_SEARCH_SERVICE.ps1

# Option 2: Manual start
cd c:\b2b_sample\backend\search-service
mvn spring-boot:run
```

### 5. Initial Data Sync
The service will automatically sync all products from MySQL to Elasticsearch on startup.
You should see logs like:
```
Starting initial product synchronization...
Successfully indexed 10 products
Product synchronization completed in 1234 ms
```

## API Endpoints

### 1. Basic Search (GET)
```
GET http://localhost:8086/api/search?q=laptop&page=0&size=20
```

**Query Parameters:**
- `q` - Search query (searches name, description, tags, category, supplier)
- `categoryId` - Filter by category ID
- `supplierId` - Filter by supplier ID
- `minPrice` / `maxPrice` - Price range filter
- `minMoq` / `maxMoq` - Minimum order quantity range
- `minRating` - Minimum average rating (e.g., 4.0)
- `origin` - Filter by country of origin
- `tags` - Comma-separated tags (e.g., "electronics,wireless")
- `isFeatured` - Filter featured products (true/false)
- `sortBy` - Sort field (default: relevance)
- `page` - Page number (0-based)
- `size` - Results per page (default: 20)

### 2. Advanced Search (POST)
```
POST http://localhost:8086/api/search
Content-Type: application/json

{
  "query": "laptop",
  "categoryId": 1,
  "minPrice": 100.0,
  "maxPrice": 2000.0,
  "minRating": 4.0,
  "tags": ["electronics", "computer"],
  "isFeatured": true,
  "page": 0,
  "size": 20
}
```

### 3. Manual Index Sync
```
POST http://localhost:8086/api/search/sync
```

Triggers a manual synchronization of all products from MySQL to Elasticsearch.

### 4. Health Check
```
GET http://localhost:8086/api/search/health
```

Returns service health status.

## Response Format

```json
{
  "results": [
    {
      "productId": 1,
      "name": "Industrial Laptop Computer",
      "description": "High-performance laptop for business use",
      "sku": "SKU001",
      "price": 899.99,
      "moq": 10,
      "stockQuantity": 500,
      "categoryId": 1,
      "categoryName": "Electronics",
      "supplierId": 1,
      "supplierName": "Tech Supplier Co.",
      "origin": "China",
      "rating": 4.5,
      "reviewCount": 120,
      "tags": ["electronics", "computer", "business"],
      "isFeatured": true,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00",
      "updatedAt": "2024-01-15T10:30:00",
      "relevanceScore": 12.345
    }
  ],
  "totalResults": 42,
  "page": 0,
  "size": 20,
  "totalPages": 3,
  "searchTime": 45
}
```

## Search Features Explained

### 1. Multi-Match Query
Searches across multiple fields with different weights:
- Product name: 3x weight (most important)
- Description: 2x weight
- Tags: 1x weight
- Category name: 1x weight
- Supplier name: 1x weight

### 2. Fuzzy Matching
Automatically handles typos with AUTO fuzziness:
- "laptp" → finds "laptop"
- "talblet" → finds "tablet"
- Edit distance automatically calculated based on term length

### 3. Boolean Filters
All filters are combined with AND logic:
- Text query (if provided)
- Category filter
- Price range
- MOQ range
- Rating threshold
- Supplier filter
- Origin filter
- Tags (all must match)
- Featured status
- Active status (always true)

### 4. Relevance Scoring
Results are ranked by:
1. **Text relevance** - How well the search query matches the text
2. **Field weighting** - Name matches score higher than description
3. **Fuzzy matching** - Exact matches score higher than fuzzy matches

## Automatic Synchronization

### On Startup
- Waits 5 seconds after application starts
- Syncs all active products from MySQL to Elasticsearch
- Logs progress every 100 products

### Scheduled Sync
- Runs every hour (3600000 milliseconds)
- Keeps Elasticsearch index updated with MySQL changes
- Can be customized in `IndexSyncService.java`

### Manual Sync
```powershell
# Trigger manual sync via API
Invoke-RestMethod -Method POST http://localhost:8086/api/search/sync
```

## Configuration

### application.properties
```properties
# Server
server.port=8086
spring.application.name=search-service

# MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/b2b_marketplace
spring.datasource.username=root
spring.datasource.password=1234

# Elasticsearch
spring.elasticsearch.uris=http://localhost:9200

# JPA
spring.jpa.hibernate.ddl-auto=none
```

### Elasticsearch Config
```java
@Configuration
public class ElasticsearchConfig {
    @Bean
    public RestClient restClient() {
        return RestClient.builder(
            HttpHost.create("http://localhost:9200")
        )
        .setRequestConfigCallback(builder -> 
            builder.setConnectTimeout(5000)
                   .setSocketTimeout(30000)
        )
        .build();
    }
}
```

## Frontend Integration

### Update api.js
Add search service endpoints:

```javascript
// Search Service (Elasticsearch)
const SEARCH_SERVICE_URL = 'http://localhost:8086/api';

export const searchAPI = {
  // Basic search
  search: async (params) => {
    const response = await axios.get(`${SEARCH_SERVICE_URL}/search`, { params });
    return response.data;
  },
  
  // Advanced search
  advancedSearch: async (request) => {
    const response = await axios.post(`${SEARCH_SERVICE_URL}/search`, request);
    return response.data;
  },
  
  // Trigger manual sync
  syncIndex: async () => {
    const response = await axios.post(`${SEARCH_SERVICE_URL}/search/sync`);
    return response.data;
  },
  
  // Health check
  health: async () => {
    const response = await axios.get(`${SEARCH_SERVICE_URL}/search/health`);
    return response.data;
  }
};
```

### Update ProductSearch.jsx
Replace Product Service calls with Search Service:

```javascript
// Before (Product Service)
const response = await productAPI.search(filters);

// After (Search Service)
const response = await searchAPI.search({
  q: filters.query,
  categoryId: filters.category,
  minPrice: filters.minPrice,
  maxPrice: filters.maxPrice,
  page: filters.page || 0,
  size: filters.size || 20
});

// Access results
const products = response.results; // Note: 'results' not 'data'
const total = response.totalResults;
const pages = response.totalPages;
```

## Testing

### 1. Test Basic Search
```powershell
# Search for "laptop"
Invoke-RestMethod "http://localhost:8086/api/search?q=laptop"

# Search in Electronics category
Invoke-RestMethod "http://localhost:8086/api/search?q=phone&categoryId=1"
```

### 2. Test Fuzzy Search
```powershell
# Typo should still find results
Invoke-RestMethod "http://localhost:8086/api/search?q=laptp"
Invoke-RestMethod "http://localhost:8086/api/search?q=talblet"
```

### 3. Test Filters
```powershell
# Price range filter
Invoke-RestMethod "http://localhost:8086/api/search?minPrice=100&maxPrice=500"

# Rating filter
Invoke-RestMethod "http://localhost:8086/api/search?minRating=4.0"

# Combined filters
Invoke-RestMethod "http://localhost:8086/api/search?q=machine&categoryId=2&minPrice=1000"
```

### 4. Test Advanced Search
```powershell
$body = @{
  query = "laptop"
  categoryId = 1
  minPrice = 500
  maxPrice = 2000
  minRating = 4.0
  tags = @("electronics", "computer")
  page = 0
  size = 10
} | ConvertTo-Json

Invoke-RestMethod -Method POST -Uri "http://localhost:8086/api/search" `
  -ContentType "application/json" -Body $body
```

## Troubleshooting

### Elasticsearch Not Starting
```powershell
# Check if port 9200 is in use
Get-NetTCPConnection -LocalPort 9200

# Start Elasticsearch manually
C:\elasticsearch\elasticsearch-8.11.1\bin\elasticsearch.bat
```

### Search Service Won't Start
```powershell
# Check if Elasticsearch is running
Invoke-RestMethod http://localhost:9200

# Check if port 8086 is in use
Get-NetTCPConnection -LocalPort 8086

# Check logs for errors
cd c:\b2b_sample\backend\search-service
mvn spring-boot:run
```

### No Search Results
```powershell
# Trigger manual index sync
Invoke-RestMethod -Method POST http://localhost:8086/api/search/sync

# Check if products exist in MySQL
# Connect to MySQL and run: SELECT COUNT(*) FROM products WHERE is_active = 1;
```

### Index Sync Fails
1. Verify MySQL is running and accessible
2. Check database credentials in application.properties
3. Verify products table has data
4. Check Search Service logs for errors

## Performance

### Expected Performance
- **Search latency**: < 50ms for simple queries
- **Index time**: ~100ms per product
- **Full sync**: ~1-2 seconds for 100 products
- **Concurrent queries**: Handles 100+ req/sec

### Optimization Tips
1. **Increase shards** for large datasets (> 100K products)
2. **Add replicas** for high availability
3. **Tune JVM heap** for Elasticsearch (default: 1GB)
4. **Use pagination** - Keep page size reasonable (20-50)
5. **Cache frequent queries** at application level

## Monitoring

### Check Index Status
```powershell
# Get index stats
Invoke-RestMethod http://localhost:9200/products/_stats

# Get index mapping
Invoke-RestMethod http://localhost:9200/products/_mapping

# Count documents
Invoke-RestMethod http://localhost:9200/products/_count
```

### Search Service Health
```powershell
# Health endpoint
Invoke-RestMethod http://localhost:8086/api/search/health

# Actuator endpoints (if enabled)
Invoke-RestMethod http://localhost:8086/actuator/health
```

## Next Steps

1. ✅ Install Elasticsearch
2. ✅ Build Search Service
3. ✅ Start Search Service
4. ✅ Verify initial sync
5. ⏳ Update frontend to use Search Service
6. ⏳ Test search functionality
7. ⏳ Deploy to production

## Support

For issues or questions:
1. Check this documentation
2. Review Search Service logs
3. Verify Elasticsearch is running
4. Test with curl/PowerShell before frontend integration
