package com.b2b.marketplace.search.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdvancedSearchRequest {
    // Basic search
    private String query;
    
    // Filters
    private Long categoryId;
    private List<Long> categoryIds;
    private Long supplierId;
    private List<Long> supplierIds;
    private Double minPrice;
    private Double maxPrice;
    private Integer minMoq;
    private Integer maxMoq;
    private String origin;
    private List<String> origins;
    private Double minRating;
    private List<String> tags;
    private Boolean isFeatured;
    private Boolean inStock;
    
    // Sorting
    private String sortBy = "relevance"; // relevance, price_asc, price_desc, rating_desc, newest, name_asc, name_desc
    
    // Pagination
    private Integer page = 0;
    private Integer size = 20;
    
    // Facets
    private Boolean includeFacets = false;
    private List<String> facetFields; // category, supplier, origin, priceRange, rating
    
    // Highlighting
    private Boolean enableHighlighting = false;
    
    // Spell checking
    private Boolean enableSpellCheck = false;
    
    // Fuzzy matching
    private Boolean fuzzySearch = false;
    private Integer fuzzyDistance = 2; // Levenshtein distance for fuzzy matching
    
    // Boost fields
    private Map<String, Float> fieldBoosts; // field -> boost value
    
    // Date range
    private String createdAfter;
    private String createdBefore;
}
