package com.b2b.marketplace.search.controller;

import com.b2b.marketplace.search.dto.*;
import com.b2b.marketplace.search.service.AdvancedSolrSearchService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Advanced Search Controller with faceting, autocomplete, highlighting, 
 * spell checking, and more Solr features.
 */
@RestController
@RequestMapping("/api/search/advanced")
@Slf4j
public class AdvancedSearchController {

    private final AdvancedSolrSearchService advancedSolrSearchService;

    public AdvancedSearchController(
            @Autowired(required = false) AdvancedSolrSearchService advancedSolrSearchService) {
        this.advancedSolrSearchService = advancedSolrSearchService;
    }

    /**
     * Advanced search with all features: facets, highlighting, spell check, etc.
     */
    @PostMapping
    public ResponseEntity<AdvancedSearchResponse> advancedSearch(
            @RequestBody AdvancedSearchRequest request) {
        log.info("Advanced search request: query={}, page={}, size={}",
                request.getQuery(), request.getPage(), request.getSize());

        if (advancedSolrSearchService == null) {
            return ResponseEntity.status(503)
                    .body(createUnavailableResponse("Solr is not available"));
        }

        AdvancedSearchResponse response = advancedSolrSearchService.advancedSearch(request);
        return ResponseEntity.ok(response);
    }

    /**
     * GET version of advanced search for simpler queries
     */
    @GetMapping
    public ResponseEntity<AdvancedSearchResponse> advancedSearchGet(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) Boolean inStock,
            @RequestParam(required = false) String origin,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(defaultValue = "relevance") String sortBy,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(defaultValue = "false") Boolean includeFacets,
            @RequestParam(defaultValue = "false") Boolean enableHighlighting) {

        AdvancedSearchRequest request = new AdvancedSearchRequest();
        request.setQuery(q);
        request.setCategoryId(categoryId);
        request.setSupplierId(supplierId);
        request.setMinPrice(minPrice);
        request.setMaxPrice(maxPrice);
        request.setMinRating(minRating);
        request.setIsFeatured(featured);
        request.setInStock(inStock);
        request.setOrigin(origin);
        request.setTags(tags);
        request.setSortBy(sortBy);
        request.setPage(page);
        request.setSize(size);
        request.setIncludeFacets(includeFacets);
        request.setEnableHighlighting(enableHighlighting);

        return advancedSearch(request);
    }

    /**
     * Autocomplete/suggest endpoint for search-as-you-type
     */
    @GetMapping("/autocomplete")
    public ResponseEntity<AutocompleteResponse> autocomplete(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") Integer limit,
            @RequestParam(defaultValue = "name") String field) {

        log.debug("Autocomplete request: q={}, limit={}, field={}", q, limit, field);

        if (advancedSolrSearchService == null) {
            AutocompleteResponse response = new AutocompleteResponse();
            response.setQuery(q);
            response.setSuggestions(Collections.emptyList());
            response.setSearchTime(0L);
            return ResponseEntity.status(503).body(response);
        }

        AutocompleteRequest request = new AutocompleteRequest();
        request.setQuery(q);
        request.setLimit(limit);
        request.setField(field);

        AutocompleteResponse response = advancedSolrSearchService.autocomplete(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get similar search suggestions (fuzzy matching)
     */
    @GetMapping("/similar")
    public ResponseEntity<List<String>> getSimilarSearches(
            @RequestParam String q,
            @RequestParam(defaultValue = "5") Integer limit) {

        if (advancedSolrSearchService == null) {
            return ResponseEntity.status(503).body(Collections.emptyList());
        }

        List<String> suggestions = advancedSolrSearchService.getSimilarSearches(q, limit);
        return ResponseEntity.ok(suggestions);
    }

    /**
     * Get products similar to a given product (More Like This)
     */
    @GetMapping("/similar-products/{productId}")
    public ResponseEntity<List<ProductSearchResult>> getSimilarProducts(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "5") Integer limit) {

        log.info("Getting similar products for productId={}", productId);

        if (advancedSolrSearchService == null) {
            return ResponseEntity.status(503).body(Collections.emptyList());
        }

        List<ProductSearchResult> results = advancedSolrSearchService.getMoreLikeThis(productId, limit);
        return ResponseEntity.ok(results);
    }

    /**
     * Get trending/popular products
     */
    @GetMapping("/trending")
    public ResponseEntity<List<ProductSearchResult>> getTrendingProducts(
            @RequestParam(defaultValue = "10") Integer limit,
            @RequestParam(required = false) String category) {

        log.info("Getting trending products: limit={}, category={}", limit, category);

        if (advancedSolrSearchService == null) {
            return ResponseEntity.status(503).body(Collections.emptyList());
        }

        List<ProductSearchResult> results = advancedSolrSearchService.getTrendingProducts(limit, category);
        return ResponseEntity.ok(results);
    }

    /**
     * Get facet counts for filters
     */
    @GetMapping("/facets")
    public ResponseEntity<Map<String, List<FacetResult.FacetValue>>> getFacets(
            @RequestParam(required = false) String q) {

        log.debug("Getting facets for query: {}", q);

        if (advancedSolrSearchService == null) {
            return ResponseEntity.status(503).body(Collections.emptyMap());
        }

        Map<String, List<FacetResult.FacetValue>> facets = advancedSolrSearchService.getFacets(q);
        return ResponseEntity.ok(facets);
    }

    /**
     * Search by category
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<AdvancedSearchResponse> searchByCategory(
            @PathVariable Long categoryId,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "relevance") String sortBy,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {

        AdvancedSearchRequest request = new AdvancedSearchRequest();
        request.setQuery(q);
        request.setCategoryId(categoryId);
        request.setSortBy(sortBy);
        request.setPage(page);
        request.setSize(size);
        request.setIncludeFacets(true);

        return advancedSearch(request);
    }

    /**
     * Search by supplier
     */
    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<AdvancedSearchResponse> searchBySupplier(
            @PathVariable Long supplierId,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "relevance") String sortBy,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {

        AdvancedSearchRequest request = new AdvancedSearchRequest();
        request.setQuery(q);
        request.setSupplierId(supplierId);
        request.setSortBy(sortBy);
        request.setPage(page);
        request.setSize(size);
        request.setIncludeFacets(true);

        return advancedSearch(request);
    }

    /**
     * Search featured products
     */
    @GetMapping("/featured")
    public ResponseEntity<AdvancedSearchResponse> searchFeatured(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {

        AdvancedSearchRequest request = new AdvancedSearchRequest();
        request.setQuery(q);
        request.setIsFeatured(true);
        request.setPage(page);
        request.setSize(size);

        return advancedSearch(request);
    }

    /**
     * Health check for advanced search service
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        boolean available = advancedSolrSearchService != null;
        return ResponseEntity.ok(Map.of(
                "status", available ? "UP" : "DOWN",
                "service", "Advanced Solr Search",
                "available", available
        ));
    }

    private AdvancedSearchResponse createUnavailableResponse(String message) {
        AdvancedSearchResponse response = new AdvancedSearchResponse();
        response.setResults(Collections.emptyList());
        response.setTotalResults(0L);
        response.setPage(0);
        response.setSize(0);
        response.setTotalPages(0);
        response.setSearchTime(0L);
        return response;
    }
}
