# 🚀 Elasticsearch Quick Start Guide

## Step 1: Install Elasticsearch (5 minutes)

```powershell
# Run the automated setup script
.\SETUP_ELASTICSEARCH.ps1
```

This will:
- Download Elasticsearch 8.11.1 (~350 MB)
- Extract to `C:\elasticsearch`
- Configure for local development
- Start Elasticsearch on port 9200

**Wait 30-60 seconds** for Elasticsearch to fully start.

## Step 2: Verify Elasticsearch (10 seconds)

```powershell
# Test connectivity
Invoke-RestMethod http://localhost:9200
```

You should see JSON output with cluster information and version 8.11.1.

## Step 3: Start Search Service (2 minutes)

```powershell
# Use the startup script
.\START_SEARCH_SERVICE.ps1
```

This will:
- Check if Elasticsearch is running
- Stop any conflicting process on port 8086
- Start the Search Service
- Show console logs

**Wait for this message:**
```
Started SearchServiceApplication in X.XXX seconds
Starting initial product synchronization...
Successfully indexed 10 products
```

## Step 4: Test the Search API (30 seconds)

```powershell
# Test 1: Basic search
Invoke-RestMethod "http://localhost:8086/api/search?q=laptop"

# Test 2: Fuzzy matching (typo)
Invoke-RestMethod "http://localhost:8086/api/search?q=laptp"

# Test 3: Category filter
Invoke-RestMethod "http://localhost:8086/api/search?categoryId=1"

# Test 4: Price range
Invoke-RestMethod "http://localhost:8086/api/search?minPrice=100&maxPrice=1000"
```

Each should return a JSON response with:
- `results` - Array of products
- `totalResults` - Total count
- `searchTime` - Query time in milliseconds

## Step 5: Update Frontend (Optional - 5 minutes)

### Option A: Quick Test (Recommended)
Test the API first, then update frontend later.

### Option B: Integrate Now
Update `src/pages/buyer/ProductSearch.jsx`:

```javascript
// Add import at top
import { searchAPI } from '../../services/api';

// In your fetchProducts function, replace this:
const response = await productAPI.search(filters);

// With this:
const response = await searchAPI.search({
  q: searchQuery,
  categoryId: categoryId,
  minPrice: minPrice,
  maxPrice: maxPrice,
  page: currentPage,
  size: 20
});

// Update data access:
const products = response.data.results; // Changed from response.data.data
setSearchResults(products);
setTotalResults(response.data.totalResults);
setTotalPages(response.data.totalPages);
```

## Step 6: Start Complete System (1 minute)

```powershell
# Start everything (MySQL, all services, frontend)
.\START_ALL_SERVICES.ps1
```

This will:
- Check MySQL is running
- **Check Elasticsearch is running** (NEW)
- Start 6 backend services including Search Service
- Start frontend
- Open browser to http://localhost:3000

**Wait 60-90 seconds** for all services to start.

## ✅ Success Checklist

- [ ] Elasticsearch responds at http://localhost:9200
- [ ] Search Service responds at http://localhost:8086/api/search/health
- [ ] Basic search returns results
- [ ] Fuzzy search handles typos
- [ ] Filters work correctly
- [ ] Frontend search works (if integrated)

## 🎯 Common Commands

### Check Service Status
```powershell
# Elasticsearch
Invoke-RestMethod http://localhost:9200

# Search Service health
Invoke-RestMethod http://localhost:8086/api/search/health

# Count indexed products
Invoke-RestMethod http://localhost:9200/products/_count
```

### Manual Sync
```powershell
# Trigger index synchronization
Invoke-RestMethod -Method POST http://localhost:8086/api/search/sync
```

### Search Examples
```powershell
# Text search
Invoke-RestMethod "http://localhost:8086/api/search?q=machine"

# With category
Invoke-RestMethod "http://localhost:8086/api/search?q=laptop&categoryId=1"

# Price range
Invoke-RestMethod "http://localhost:8086/api/search?minPrice=50&maxPrice=500"

# Combined filters
Invoke-RestMethod "http://localhost:8086/api/search?q=phone&categoryId=1&minPrice=100&minRating=4.0"
```

## 🛑 Stop Services

```powershell
# Stop all background jobs
Get-Job | Stop-Job
Get-Job | Remove-Job

# Stop Elasticsearch (if started via script)
# Close the PowerShell window running elasticsearch.bat
```

## 🔧 Troubleshooting

### "Connection refused" at port 9200
**Problem:** Elasticsearch not running  
**Solution:**
```powershell
C:\elasticsearch\elasticsearch-8.11.1\bin\elasticsearch.bat
```

### "Connection refused" at port 8086
**Problem:** Search Service not running  
**Solution:**
```powershell
.\START_SEARCH_SERVICE.ps1
```

### No search results
**Problem:** Index not synced  
**Solution:**
```powershell
# Trigger manual sync
Invoke-RestMethod -Method POST http://localhost:8086/api/search/sync

# Verify products in MySQL
C:\b2bmysql\bin\mysql -u root -p1234 -e "USE b2b_marketplace; SELECT COUNT(*) FROM products WHERE is_active = 1;"
```

### Slow first search
**Normal:** First search after startup may take 200-500ms as Elasticsearch warms up caches. Subsequent searches will be < 50ms.

## 📚 Learn More

- **Full Documentation:** See `ELASTICSEARCH_SEARCH_SERVICE.md`
- **Implementation Details:** See `ELASTICSEARCH_IMPLEMENTATION_SUMMARY.md`
- **API Reference:** See `ELASTICSEARCH_SEARCH_SERVICE.md` (API Endpoints section)

## 🎉 You're Done!

Your B2B Marketplace now has:
- ✅ Full-text search with fuzzy matching
- ✅ Advanced filtering (price, category, rating, etc.)
- ✅ Relevance ranking
- ✅ Typo tolerance
- ✅ Fast search (< 50ms)
- ✅ Automatic data sync

**Happy searching! 🔍**
