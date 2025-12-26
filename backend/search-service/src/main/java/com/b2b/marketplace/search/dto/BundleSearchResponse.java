package com.b2b.marketplace.search.dto;

import lombok.Data;
import java.util.List;

@Data
public class BundleSearchResponse {
    private List<BundleSearchResult> results;
    private long totalResults;
    private int page;
    private int size;
    private int totalPages;
    private long searchTime;
}
