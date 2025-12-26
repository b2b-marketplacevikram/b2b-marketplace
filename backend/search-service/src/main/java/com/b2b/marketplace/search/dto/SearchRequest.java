package com.b2b.marketplace.search.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchRequest {
    private String query;
    private Long categoryId;
    private Long supplierId;
    private Double minPrice;
    private Double maxPrice;
    private Integer minMoq;
    private Integer maxMoq;
    private String origin;
    private Double minRating;
    private List<String> tags;
    private Boolean isFeatured;
    private String sortBy = "relevance"; // relevance, price_asc, price_desc, rating
    private Integer page = 0;
    private Integer size = 20;
}
