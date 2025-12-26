package com.b2b.marketplace.search.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class BundleSearchRequest {
    private String query;
    private Long supplierId;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private BigDecimal minDiscount;
    private Boolean isFeatured;
    private List<Long> productIds;
    private int page = 0;
    private int size = 20;
    private String sortBy = "relevance";
    private String sortDirection = "desc";
}
