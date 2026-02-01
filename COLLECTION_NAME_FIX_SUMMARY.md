# Collection Name Fix Summary

## Problem
The search-service was using hardcoded collection name "products" but OpenSolr collection is named "b2b_products".

## Files Fixed

### ✅ Already Fixed:
1. **SolrSearchService.java** - Added @Value injection, replaced all COLLECTION references
2. **SolrHealthChecker.java** - Added @Value injection, replaced all COLLECTION references

### ⏳ Needs Fixing (Run fix-collection-names.ps1):
3. **ProductSearchRepository.java** - 9 occurrences of COLLECTION to replace
4. **BundleSolrSearchService.java** - 5 occurrences of COLLECTION to replace
5. **AdvancedSolrSearchService.java** - 11 occurrences of COLLECTION to replace

## All Files Updated With:
```java
@org.springframework.beans.factory.annotation.Value("${spring.data.solr.collection:b2b_products}")
private String collectionName;
```

## Replacements Needed:
- `solrClient.query(COLLECTION,` → `solrClient.query(collectionName,`
- `solrClient.add(COLLECTION,` → `solrClient.add(collectionName,`
- `solrClient.commit(COLLECTION)` → `solrClient.commit(collectionName)`
- `solrClient.deleteById(COLLECTION,` → `solrClient.deleteById(collectionName,`
- `solrClient.deleteByQuery(COLLECTION,` → `solrClient.deleteByQuery(collectionName,`

## How to Apply Fix:

### Option 1: Run PowerShell Script (Automated)
```powershell
cd f:\B2B-MarketPlace\b2b-marketplace
.\fix-collection-names.ps1
```

### Option 2: Manual Find & Replace in VS Code
For each of these 3 files:
- ProductSearchRepository.java
- BundleSolrSearchService.java  
- AdvancedSolrSearchService.java

Use Find & Replace (Ctrl+H):
1. Find: `COLLECTION,` → Replace: `collectionName,`
2. Find: `COLLECTION)` → Replace: `collectionName)`

**Be careful NOT to replace:**
- `private static final String COLLECTION = ...` (the constant declaration)
- `import java.util.Collection;` (the Java import)
- Variable names like `productIdsCol` or `productNamesCol`

## Verification

After fixing, search for remaining issues:
```bash
# Should only find the deprecated constant declaration and Java import
grep -n "COLLECTION" ProductSearchRepository.java
grep -n "COLLECTION" BundleSolrSearchService.java
grep -n "COLLECTION" AdvancedSolrSearchService.java
```

Expected output should only show:
- The `import java.util.Collection;` line
- The `private static final String COLLECTION = "products"; // Deprecated` line

## Test After Fix

```powershell
cd backend\search-service
mvn clean compile
mvn spring-boot:run
```

Application should now connect to `b2b_products` collection instead of `products`.

## Configuration
Make sure application.properties has:
```properties
spring.data.solr.collection=b2b_products
spring.data.solr.host=https://us-east-8-10.solrcluster.com/solr
spring.data.solr.username=opensolr
spring.data.solr.password=de189a9e8021b3df526505da20b80cd1
```

✅ All set!
