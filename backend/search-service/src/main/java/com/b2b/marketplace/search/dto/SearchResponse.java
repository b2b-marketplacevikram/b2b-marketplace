package com.b2b.marketplace.search.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchResponse {
    private List<ProductSearchResult> results;
    private Long totalResults;
    private Integer page;
    private Integer size;
    private Integer totalPages;
    private Long searchTime; // milliseconds
}
