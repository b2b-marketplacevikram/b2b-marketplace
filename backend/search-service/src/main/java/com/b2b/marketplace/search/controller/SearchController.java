package com.b2b.marketplace.search.controller;

import com.b2b.marketplace.search.dto.SearchRequest;
import com.b2b.marketplace.search.dto.SearchResponse;
import com.b2b.marketplace.search.service.SolrSearchService;
import com.b2b.marketplace.search.service.IndexSyncService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

@RestController
@RequestMapping("/api/search")
@Slf4j
public class SearchController {
    
    private final SolrSearchService solrSearchService;
    private final IndexSyncService indexSyncService;
    
    public SearchController(
            @Autowired(required = false) SolrSearchService solrSearchService,
            @Autowired(required = false) IndexSyncService indexSyncService) {
        this.solrSearchService = solrSearchService;
        this.indexSyncService = indexSyncService;
    }

    @PostMapping
    public ResponseEntity<SearchResponse> search(@RequestBody SearchRequest searchRequest) {
        log.info("Search request: {}", searchRequest);
            if (solrSearchService == null) {
                return ResponseEntity.status(503)
                    .body(createUnavailableResponse("Solr is not available. Please install and start Solr."));
        }
            SearchResponse response = solrSearchService.search(searchRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<SearchResponse> searchByQuery(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        
        SearchRequest request = new SearchRequest();
        request.setQuery(q);
        request.setCategoryId(categoryId);
        request.setSupplierId(supplierId);
        request.setMinPrice(minPrice);
        request.setMaxPrice(maxPrice);
        request.setMinRating(minRating);
        request.setPage(page);
        request.setSize(size);
        
        log.info("GET search request: {}", request);
            if (solrSearchService == null) {
                return ResponseEntity.status(503)
                    .body(createUnavailableResponse("Solr is not available. Please install and start Solr."));
        }
            SearchResponse response = solrSearchService.search(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sync")
    public ResponseEntity<String> syncIndex() {
        log.info("Manual index sync requested");
            if (indexSyncService == null) {
                return ResponseEntity.status(503).body("Solr is not available. Index sync requires Solr.");
        }
        try {
            indexSyncService.syncAllProducts();
            indexSyncService.syncAllBundles();
            return ResponseEntity.ok("Index sync started (products and bundles)");
        } catch (Exception e) {
            log.error("Error syncing index: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Sync failed: " + e.getMessage());
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        boolean solrAvailable = solrSearchService != null;
        String status = solrAvailable ? "Search Service is running (Solr available)" 
                                    : "Search Service is running (Solr NOT available - install Solr for search functionality)";
        return ResponseEntity.ok(status);
    }
    
    private SearchResponse createUnavailableResponse(String message) {
        SearchResponse response = new SearchResponse();
        response.setResults(Collections.emptyList());
        response.setTotalResults(0L);
        response.setPage(0);
        response.setSize(0);
        response.setTotalPages(0);
        response.setSearchTime(0L);
        return response;
    }
}
