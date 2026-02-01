package com.b2b.marketplace.search.controller;

import com.b2b.marketplace.search.dto.BundleSearchRequest;
import com.b2b.marketplace.search.dto.BundleSearchResponse;
import com.b2b.marketplace.search.dto.BundleSearchResult;
import com.b2b.marketplace.search.service.BundleSolrSearchService;
import com.b2b.marketplace.search.service.IndexSyncService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;

@RestController
@RequestMapping("/api/search/bundles")
@Slf4j
public class BundleSearchController {
    
    private final BundleSolrSearchService bundleSolrSearchService;
    private final IndexSyncService indexSyncService;
    
    public BundleSearchController(
            @Autowired(required = false) BundleSolrSearchService bundleSolrSearchService,
            @Autowired(required = false) IndexSyncService indexSyncService) {
        this.bundleSolrSearchService = bundleSolrSearchService;
        this.indexSyncService = indexSyncService;
    }

    /**
     * Search bundles using POST with full request body
     */
    @PostMapping
    public ResponseEntity<BundleSearchResponse> search(@RequestBody BundleSearchRequest searchRequest) {
        log.info("Bundle search request: {}", searchRequest);
        
        if (bundleSolrSearchService == null) {
            return ResponseEntity.status(503)
                .body(createUnavailableResponse("Solr is not available for bundle search."));
        }
        
        BundleSearchResponse response = bundleSolrSearchService.search(searchRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Search bundles using GET with query parameters
     */
    @GetMapping
    public ResponseEntity<BundleSearchResponse> searchByQuery(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double minDiscount,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(defaultValue = "relevance") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        BundleSearchRequest request = new BundleSearchRequest();
        request.setQuery(q);
        request.setSupplierId(supplierId);
        if (minPrice != null) request.setMinPrice(BigDecimal.valueOf(minPrice));
        if (maxPrice != null) request.setMaxPrice(BigDecimal.valueOf(maxPrice));
        if (minDiscount != null) request.setMinDiscount(BigDecimal.valueOf(minDiscount));
        request.setIsFeatured(featured);
        request.setPage(page);
        request.setSize(size);
        request.setSortBy(sortBy);
        request.setSortDirection(sortDirection);
        
        log.info("GET bundle search request: {}", request);
        
        if (bundleSolrSearchService == null) {
            return ResponseEntity.status(503)
                .body(createUnavailableResponse("Solr is not available for bundle search."));
        }
        
        BundleSearchResponse response = bundleSolrSearchService.search(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Trigger manual bundle index sync
     */
    @PostMapping("/sync")
    public ResponseEntity<String> syncBundleIndex() {
        log.info("Manual bundle index sync requested");
        
        if (indexSyncService == null) {
            return ResponseEntity.status(503).body("Solr is not available. Bundle index sync requires Solr.");
        }
        
        try {
            indexSyncService.syncAllBundles();
            return ResponseEntity.ok("Bundle index sync completed");
        } catch (Exception e) {
            log.error("Error syncing bundle index: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Bundle sync failed: " + e.getMessage());
        }
    }

    /**
     * Search bundles by supplier
     */
    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<BundleSearchResponse> searchBySupplier(
            @PathVariable Long supplierId,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        
        BundleSearchRequest request = new BundleSearchRequest();
        request.setSupplierId(supplierId);
        request.setPage(page);
        request.setSize(size);
        
        if (bundleSolrSearchService == null) {
            return ResponseEntity.status(503)
                .body(createUnavailableResponse("Solr is not available for bundle search."));
        }
        
        return ResponseEntity.ok(bundleSolrSearchService.search(request));
    }

    /**
     * Get featured bundles
     */
    @GetMapping("/featured")
    public ResponseEntity<BundleSearchResponse> getFeaturedBundles(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        
        BundleSearchRequest request = new BundleSearchRequest();
        request.setIsFeatured(true);
        request.setPage(page);
        request.setSize(size);
        
        if (bundleSolrSearchService == null) {
            return ResponseEntity.status(503)
                .body(createUnavailableResponse("Solr is not available for bundle search."));
        }
        
        return ResponseEntity.ok(bundleSolrSearchService.search(request));
    }

    private BundleSearchResponse createUnavailableResponse(String message) {
        BundleSearchResponse response = new BundleSearchResponse();
        response.setResults(new ArrayList<>());
        response.setTotalResults(0L);
        response.setPage(0);
        response.setSize(0);
        response.setTotalPages(0);
        response.setSearchTime(0L);
        return response;
    }
}
