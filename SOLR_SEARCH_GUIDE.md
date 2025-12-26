# 🔍 Solr Search Implementation Guide

This document provides a comprehensive guide to the Apache Solr search implementation for the B2B Marketplace platform.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup & Installation](#setup--installation)
4. [API Reference](#api-reference)
5. [Features](#features)
6. [Configuration](#configuration)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The B2B Marketplace uses **Apache Solr 8.11.1** as its search engine, providing:

- ⚡ **Full-text search** with relevance scoring
- 🏷️ **Faceted navigation** for filtering
- 💡 **Autocomplete/Suggestions** for search-as-you-type
- 🔍 **Fuzzy matching** for typo tolerance
- ✨ **Highlighting** of matched terms
- 📊 **Analytics** and search statistics
- 🔄 **Real-time indexing** with automatic sync

---

## Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│   React Frontend    │────▶│   Search Service    │
│   (Search UI)       │     │   (Spring Boot)     │
└─────────────────────┘     └──────────┬──────────┘
                                       │
                                       ▼
                            ┌─────────────────────┐
                            │    Apache Solr      │
                            │  (products core)    │
                            └──────────┬──────────┘
                                       │
                            ┌──────────▼──────────┐
                            │     MySQL DB        │
                            │  (source of truth)  │
                            └─────────────────────┘
```

### Components

| Component | Description |
|-----------|-------------|
| `SolrSearchService` | Basic search operations |
| `AdvancedSolrSearchService` | Advanced search with facets, highlighting |
| `IndexSyncService` | Syncs products from MySQL to Solr |
| `SolrHealthChecker` | Health checks and diagnostics |

---

## Setup & Installation

### Option 1: Using Docker (Recommended)

```bash
# Start Solr with Docker Compose
cd docker
docker-compose -f docker-compose-solr.yml up -d

# Verify Solr is running
curl http://localhost:8983/solr/admin/cores?action=STATUS
```

### Option 2: Using PowerShell Script (Windows)

```powershell
# Run the setup script
.\SETUP_SOLR.ps1

# This will:
# 1. Download Solr 8.11.1
# 2. Start Solr
# 3. Create 'products' collection
# 4. Configure schema fields
```

### Option 3: Manual Installation

1. **Download Solr**
   ```bash
   wget https://downloads.apache.org/lucene/solr/8.11.1/solr-8.11.1.zip
   unzip solr-8.11.1.zip
   ```

2. **Start Solr**
   ```bash
   cd solr-8.11.1
   bin/solr start
   ```

3. **Create Collection**
   ```bash
   bin/solr create -c products -s 1 -rf 1
   ```

4. **Apply Schema** (copy from `solr-config/schema.xml`)

### Verify Installation

```bash
# Check Solr Admin UI
http://localhost:8983/solr/

# Check collection status
http://localhost:8983/solr/admin/collections?action=LIST

# Check schema fields
http://localhost:8983/solr/products/schema/fields
```

---

## API Reference

### Base URL
```
http://localhost:8090/api/search
```

### Basic Search

#### POST /api/search
```json
{
  "query": "laptop",
  "categoryId": 1,
  "minPrice": 100,
  "maxPrice": 1000,
  "page": 0,
  "size": 20
}
```

#### GET /api/search
```
GET /api/search?q=laptop&categoryId=1&minPrice=100&maxPrice=1000&page=0&size=20
```

### Advanced Search

#### POST /api/search/advanced
```json
{
  "query": "industrial motor",
  "categoryIds": [1, 2],
  "supplierIds": [10, 20],
  "minPrice": 500,
  "maxPrice": 5000,
  "minRating": 4.0,
  "tags": ["electric", "high-power"],
  "isFeatured": true,
  "inStock": true,
  "sortBy": "price_asc",
  "page": 0,
  "size": 20,
  "includeFacets": true,
  "enableHighlighting": true,
  "enableSpellCheck": true,
  "fuzzySearch": false
}
```

**Response:**
```json
{
  "results": [...],
  "totalResults": 150,
  "page": 0,
  "size": 20,
  "totalPages": 8,
  "searchTime": 45,
  "facets": [
    {
      "field": "categoryName",
      "values": [
        {"value": "Electronics", "count": 50},
        {"value": "Machinery", "count": 30}
      ]
    }
  ],
  "highlighting": {
    "123": {
      "name": ["<em class=\"highlight\">Industrial</em> <em class=\"highlight\">Motor</em>"],
      "description": ["High-power <em class=\"highlight\">motor</em> for..."]
    }
  },
  "spellCheckSuggestions": ["industrial motors"],
  "stats": {
    "minPrice": 500.00,
    "maxPrice": 4999.00,
    "avgPrice": 1250.00,
    "avgRating": 4.3
  }
}
```

### Autocomplete

#### GET /api/search/advanced/autocomplete
```
GET /api/search/advanced/autocomplete?q=lap&limit=10&field=name
```

**Response:**
```json
{
  "query": "lap",
  "suggestions": [
    {"text": "Laptop Computer", "productId": 123, "category": "Electronics", "score": 15.5},
    {"text": "Laptop Stand", "productId": 456, "category": "Accessories", "score": 12.3}
  ],
  "searchTime": 8
}
```

### Similar Products (More Like This)

#### GET /api/search/advanced/similar-products/{productId}
```
GET /api/search/advanced/similar-products/123?limit=5
```

### Trending Products

#### GET /api/search/advanced/trending
```
GET /api/search/advanced/trending?limit=10&category=Electronics
```

### Facets

#### GET /api/search/advanced/facets
```
GET /api/search/advanced/facets?q=laptop
```

### Category/Supplier Search

```
GET /api/search/advanced/category/1?q=phone&sortBy=price_asc&page=0&size=20
GET /api/search/advanced/supplier/10?q=motor&page=0&size=20
GET /api/search/advanced/featured?page=0&size=20
```

### Admin Endpoints

```
GET /api/search/admin/health
GET /api/search/admin/stats
GET /api/search/admin/product/{productId}/exists
POST /api/search/sync  # Trigger manual index sync
```

---

## Features

### 1. Full-Text Search

Searches across multiple fields with configurable boosting:
- `name` (boost: 3x)
- `description` (boost: 2x)
- `categoryName` (boost: 2x)
- `supplierName`
- `tags`
- `sku`

### 2. Faceted Search

Available facets:
- **Category** - Product categories
- **Supplier** - Supplier names
- **Origin** - Country of origin
- **Price Range** - Price buckets ($0-500, $500-1000, etc.)
- **Rating** - Star ratings (1-5)
- **Featured** - Featured products flag

### 3. Sorting Options

| Sort Value | Description |
|------------|-------------|
| `relevance` | By search relevance score (default) |
| `price_asc` | Price: Low to High |
| `price_desc` | Price: High to Low |
| `rating_desc` | Highest rated first |
| `newest` | Most recently added |
| `name_asc` | Name A-Z |
| `name_desc` | Name Z-A |
| `popularity` | By review count & rating |

### 4. Autocomplete

- Edge n-gram tokenization for prefix matching
- Minimum 2 characters required
- Returns product names with categories
- Configurable result limit

### 5. Fuzzy Search

- Handles typos and misspellings
- Configurable Levenshtein distance (1-2)
- Example: "latop" matches "laptop"

### 6. Synonyms

Pre-configured synonyms for common B2B terms:
- laptop → notebook, portable computer
- phone → smartphone, mobile
- motor → engine
- wholesale → bulk, bulk order

### 7. Highlighting

- Highlights matching terms in results
- Configurable fragment size and count
- HTML tags for styling: `<em class="highlight">term</em>`

### 8. Spell Check

- Suggests corrections for misspelled queries
- Collation of multiple suggestions

---

## Configuration

### Application Properties

```properties
# Solr Connection
spring.data.solr.host=http://localhost:8983/solr
spring.data.solr.enabled=true
spring.data.solr.collection=products
spring.data.solr.connection-timeout=5000
spring.data.solr.socket-timeout=30000

# Autocomplete Settings
solr.autocomplete.min-chars=2
solr.autocomplete.max-results=10

# Search Defaults
solr.search.default-page-size=20
solr.search.max-page-size=100

# Facet Settings
solr.facet.min-count=1
solr.facet.limit=50

# Highlighting
solr.highlight.fragment-size=200
solr.highlight.snippets=3

# Index Sync
search.sync.enabled=true
search.sync.interval=3600000  # 1 hour
search.sync.startup-delay=5000
```

### Solr Schema Fields

| Field | Type | Indexed | Stored | Description |
|-------|------|---------|--------|-------------|
| id | string | ✓ | ✓ | Unique document ID |
| productId | plong | ✓ | ✓ | Product ID from MySQL |
| name | text_en | ✓ | ✓ | Product name |
| description | text_en | ✓ | ✓ | Product description |
| price | pdouble | ✓ | ✓ | Unit price |
| categoryId | plong | ✓ | ✓ | Category ID |
| categoryName | text_general | ✓ | ✓ | Category name |
| supplierId | plong | ✓ | ✓ | Supplier ID |
| supplierName | text_general | ✓ | ✓ | Supplier name |
| tags | strings | ✓ | ✓ | Product tags |
| rating | pdouble | ✓ | ✓ | Average rating |
| isFeatured | boolean | ✓ | ✓ | Featured flag |
| isActive | boolean | ✓ | ✓ | Active flag |

---

## Best Practices

### 1. Search Query Optimization

```java
// Use edismax query parser for better relevance
query.set("defType", "edismax");
query.set("qf", "name^3 description^2 categoryName^2 tags");

// Use phrase boosting
query.set("pf", "name^5 description^3");
```

### 2. Index Management

```java
// Batch indexing for better performance
solrClient.add(COLLECTION, docs);  // Add multiple docs
solrClient.commit(COLLECTION);      // Single commit

// Soft commits for near-real-time search
// Configure in solrconfig.xml: autoSoftCommit.maxTime=1000
```

### 3. Filter Queries vs Main Query

```java
// Use filter queries (fq) for facet filters - they're cached
query.addFilterQuery("categoryId:" + categoryId);
query.addFilterQuery("isActive:true");

// Use main query (q) for user search terms - not cached
query.setQuery("name:" + searchTerm);
```

### 4. Pagination

```java
// Always set reasonable limits
int size = Math.min(request.getSize(), 100);  // Max 100 per page
query.setStart(request.getPage() * size);
query.setRows(size);
```

---

## Troubleshooting

### Common Issues

#### 1. Solr Connection Failed
```
Error: Connection refused to localhost:8983
```
**Solution:** Ensure Solr is running:
```bash
# Check if Solr is running
curl http://localhost:8983/solr/admin/cores

# Start Solr
./bin/solr start
```

#### 2. Collection Not Found
```
Error: Collection 'products' not found
```
**Solution:** Create the collection:
```bash
./bin/solr create -c products -s 1 -rf 1
```

#### 3. Field Not Found
```
Error: undefined field 'fieldName'
```
**Solution:** Add the field via Schema API:
```bash
curl -X POST -H 'Content-type:application/json' \
  'http://localhost:8983/solr/products/schema' \
  -d '{"add-field": {"name":"fieldName", "type":"string", "stored":true, "indexed":true}}'
```

#### 4. Slow Queries
**Solutions:**
- Add filter queries instead of main query for facets
- Use `rows` parameter to limit results
- Check if faceting is too broad
- Optimize schema with docValues

#### 5. Out of Memory
**Solution:** Increase Solr heap size:
```bash
# In solr.in.sh or solr.in.cmd
SOLR_JAVA_MEM="-Xms1g -Xmx2g"
```

### Useful Commands

```bash
# Check Solr status
curl 'http://localhost:8983/solr/admin/cores?action=STATUS'

# Delete all documents
curl 'http://localhost:8983/solr/products/update?commit=true' \
  -H 'Content-Type: text/xml' \
  -d '<delete><query>*:*</query></delete>'

# Reload collection
curl 'http://localhost:8983/solr/admin/collections?action=RELOAD&name=products'

# Check query performance
curl 'http://localhost:8983/solr/products/select?q=*:*&debugQuery=true'
```

---

## Performance Tuning

### JVM Settings

```bash
SOLR_JAVA_MEM="-Xms2g -Xmx4g"
GC_TUNE="-XX:+UseG1GC -XX:MaxGCPauseMillis=100"
```

### Solr Configuration

```xml
<!-- In solrconfig.xml -->
<filterCache class="solr.FastLRUCache" size="1024" initialSize="512"/>
<queryResultCache class="solr.LRUCache" size="1024" initialSize="512"/>
<documentCache class="solr.LRUCache" size="1024" initialSize="512"/>
```

### Index Optimization

```bash
# Optimize index (merge segments)
curl 'http://localhost:8983/solr/products/update?optimize=true'
```

---

## Security Considerations

1. **Enable Authentication** in production:
   ```bash
   ./bin/solr auth enable -type basicAuth -credentials admin:password
   ```

2. **Firewall** - Only expose Solr to the search service, not publicly

3. **Input Sanitization** - Escape special Solr characters in user queries

4. **Rate Limiting** - Implement in API gateway

---

## Monitoring

### Health Endpoints

```bash
# Service health
GET /api/search/health
GET /api/search/advanced/health
GET /api/search/admin/health

# Index stats
GET /api/search/admin/stats
```

### Solr Metrics

Access via Solr Admin UI: `http://localhost:8983/solr/#/products`

- Query rate
- Cache hit ratio
- Index size
- JVM memory usage

---

## Support

For issues or questions:
1. Check Solr logs: `solr-8.11.1/server/logs/solr.log`
2. Check application logs for search-service
3. Use Solr Admin UI for debugging queries

