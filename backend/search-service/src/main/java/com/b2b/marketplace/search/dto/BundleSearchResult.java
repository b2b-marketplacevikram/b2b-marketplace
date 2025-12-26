package com.b2b.marketplace.search.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class BundleSearchResult {
    private Long id;
    private String name;
    private String description;
    private Long supplierId;
    private String supplierName;
    private BigDecimal discountPercentage;
    private BigDecimal originalPrice;
    private BigDecimal bundlePrice;
    private Integer totalItems;
    private Integer minOrderQuantity;
    private Boolean isFeatured;
    private String imageUrl;
    private List<Long> productIds;
    private List<String> productNames;
}
