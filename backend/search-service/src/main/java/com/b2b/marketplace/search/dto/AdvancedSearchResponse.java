package com.b2b.marketplace.search.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdvancedSearchResponse {
    private List<ProductSearchResult> results;
    private Long totalResults;
    private Integer page;
    private Integer size;
    private Integer totalPages;
    private Long searchTime;
    
    // Facets
    private List<FacetResult> facets;
    
    // Highlighting
    private Map<String, Map<String, List<String>>> highlighting; // docId -> field -> highlighted snippets
    
    // Spell check suggestions
    private List<String> spellCheckSuggestions;
    
    // Query info
    private String originalQuery;
    private String parsedQuery;
    
    // Stats
    private SearchStats stats;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchStats {
        private Double minPrice;
        private Double maxPrice;
        private Double avgPrice;
        private Double avgRating;
        private Long totalProducts;
    }
}
