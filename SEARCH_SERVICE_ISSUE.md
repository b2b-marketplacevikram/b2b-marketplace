# Search Service - Elasticsearch Installation Required

## ⚠️ Current Issue

The **Search Service (Port 8086)** requires **Elasticsearch** to be installed and running before it can start.

**Error**: `UnsatisfiedDependencyException` when creating `productSearchRepository`

**Root Cause**: Spring Data Elasticsearch tries to connect to Elasticsearch during bean initialization. If Elasticsearch is not running, the service fails to start.

---

## ✅ Solution: Install Elasticsearch First

### Option 1: Quick Install (Recommended)

```powershell
# Run the automated setup script
.\SETUP_ELASTICSEARCH.ps1
```

This script will:
- Download Elasticsearch 8.11.1 (~350 MB)
- Extract to `C:\elasticsearch`
- Configure for local development
- Start Elasticsearch on port 9200

**Time**: ~5-10 minutes depending on internet speed

### Option 2: Manual Install

1. **Download Elasticsearch**
   ```powershell
   # Download from: https://www.elastic.co/downloads/elasticsearch
   # Version: 8.11.1
   # Extract to: C:\elasticsearch\elasticsearch-8.11.1
   ```

2. **Configure for Development**
   Edit `C:\elasticsearch\elasticsearch-8.11.1\config\elasticsearch.yml`:
   ```yaml
   cluster.name: b2b-marketplace-cluster
   node.name: node-1
   network.host: 0.0.0.0
   http.port: 9200
   xpack.security.enabled: false
   xpack.security.enrollment.enabled: false
   ```

3. **Start Elasticsearch**
   ```powershell
   cd C:\elasticsearch\elasticsearch-8.11.1\bin
   .\elasticsearch.bat
   ```

4. **Verify Running**
   ```powershell
   Invoke-RestMethod "http://localhost:9200"
   ```

---

## 🚀 After Elasticsearch is Running

Once Elasticsearch is running on port 9200:

### 1. Rebuild Search Service
```powershell
cd C:\b2b_sample\backend\search-service
mvn clean install -DskipTests
```

### 2. Start Search Service
```powershell
# Option A: Use startup script
.\START_SEARCH_SERVICE.ps1

# Option B: Manual start
cd C:\b2b_sample\backend\search-service
mvn spring-boot:run
```

### 3. Verify Search Service
```powershell
# Should return: "Search Service is running"
Invoke-RestMethod "http://localhost:8086/api/search/health"
```

### 4. Initial Data Sync
The service will automatically sync products from MySQL to Elasticsearch on startup.

Check logs for:
```
Starting initial product synchronization...
Successfully indexed X products
Product synchronization completed in XXX ms
```

---

## 🔧 Alternative: Disable Search Service Temporarily

If you don't need search functionality right now, you can skip the Search Service:

### 1. Comment Out in START_ALL_SERVICES.ps1

Edit `START_ALL_SERVICES.ps1` and comment out:
```powershell
# Write-Host "Starting Search Service..." -ForegroundColor Yellow
# Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend\search-service; mvn spring-boot:run"
```

### 2. Use Product Service for Basic Search

The Product Service (Port 8082) has basic search capabilities:
```javascript
// In frontend api.js
export const productAPI = {
  search: async (filters) => {
    const response = await axios.get(`${PRODUCT_SERVICE_URL}/products/search`, { 
      params: filters 
    });
    return response.data;
  }
};
```

**Limitations**:
- ❌ No fuzzy matching (typo tolerance)
- ❌ No relevance scoring
- ❌ Slower for large datasets
- ❌ No advanced filtering
- ✅ Works without Elasticsearch
- ✅ Simpler setup

---

## 📊 Search Service vs Product Service

| Feature | Search Service (ES) | Product Service (MySQL) |
|---------|---------------------|-------------------------|
| **Fuzzy Search** | ✅ Yes (typo tolerance) | ❌ No |
| **Relevance Score** | ✅ Yes (BM25 ranking) | ❌ No |
| **Field Weighting** | ✅ Yes (name^3, desc^2) | ❌ No |
| **Performance** | ✅ Fast (< 50ms) | ⚠️ Slower on large data |
| **Multi-field** | ✅ Yes (5+ fields) | ⚠️ Limited |
| **Setup** | ❌ Requires ES install | ✅ Already working |
| **Dependencies** | Elasticsearch 8.11.1 | MySQL only |

---

## 🎯 Recommended Approach

### For Development/Testing
**Start without Search Service** (use Product Service):
- Faster setup
- No additional dependencies
- Good enough for basic testing

### For Production/Demo
**Install Elasticsearch** (use Search Service):
- Better user experience
- Professional search features
- Handles typos gracefully
- Faster performance

---

## 📝 Current Platform Status

| Service | Port | Status | Notes |
|---------|------|--------|-------|
| User Service | 8081 | ✅ Running | |
| Product Service | 8082 | ✅ Running | Basic search available |
| Order Service | 8083 | ✅ Running | |
| Payment Service | 8084 | ✅ Running | |
| Cart Service | 8085 | ✅ Running | Database-backed |
| **Search Service** | **8086** | ⚠️ **Needs ES** | Install Elasticsearch first |
| Notification Service | 8086 | ⚠️ **Port Conflict!** | Same port as Search! |
| Email Service | 8087 | ✅ Running | |
| Messaging Service | 8088 | ✅ Running | |

---

## ⚠️ Port Conflict Detected!

**Issue**: Both Notification Service and Search Service are configured for port **8086**.

### Fix: Change Search Service Port

Edit `backend/search-service/src/main/resources/application.properties`:

```properties
# Change from:
server.port=8086

# Change to:
server.port=8090
```

**Updated Port Assignments**:
- 8081: User Service
- 8082: Product Service  
- 8083: Order Service
- 8084: Payment Service
- 8085: Cart Service
- 8086: Notification Service ✅
- 8087: Email Service
- 8088: Messaging Service
- 8089: Admin Service
- **8090: Search Service** ✅ (NEW)
- 9200: Elasticsearch

---

## 🔄 Quick Fix Steps

### Step 1: Fix Port Conflict
```powershell
# Edit search service port
# File: backend/search-service/src/main/resources/application.properties
# Change: server.port=8090
```

### Step 2: Choose Your Path

**Path A: With Elasticsearch (Better)**
```powershell
# Install Elasticsearch
.\SETUP_ELASTICSEARCH.ps1

# Wait for ES to start (check: Invoke-RestMethod http://localhost:9200)

# Rebuild search service
cd backend\search-service
mvn clean install -DskipTests

# Start search service
.\START_SEARCH_SERVICE.ps1

# Verify
Invoke-RestMethod "http://localhost:8090/api/search/health"
```

**Path B: Without Elasticsearch (Simpler)**
```powershell
# Just don't start the search service
# Use Product Service for search instead
# Continue with existing services
```

---

## 📚 Related Documentation

- **ELASTICSEARCH_SEARCH_SERVICE.md** - Full search service guide
- **ELASTICSEARCH_IMPLEMENTATION_SUMMARY.md** - Overview
- **SETUP_ELASTICSEARCH.ps1** - Automated installation script
- **START_SEARCH_SERVICE.ps1** - Service startup script

---

## ✅ Next Steps

1. **Decide**: Do you need Elasticsearch search now?
   - **Yes** → Run `.\SETUP_ELASTICSEARCH.ps1` (takes 5-10 min)
   - **No** → Skip Search Service, use Product Service search

2. **Fix Port Conflict**: Change Search Service to port 8090

3. **Continue Development**: All other services are working!

---

**Status**: Search Service awaiting Elasticsearch installation
**Workaround**: Use Product Service for basic search functionality
**Recommendation**: Install Elasticsearch when time permits for better search experience

