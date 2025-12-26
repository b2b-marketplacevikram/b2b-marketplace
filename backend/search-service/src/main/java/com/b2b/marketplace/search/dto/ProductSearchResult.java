package com.b2b.marketplace.search.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductSearchResult {
    private Long id;
    private String name;
    private String description;
    private String sku;
    private BigDecimal price;
    private Integer moq;
    private Integer stockQuantity;
    private Long categoryId;
    private String categoryName;
    private Long supplierId;
    private String supplierName;
    private String origin;
    private Double rating;
    private Integer reviewCount;
    private List<String> tags;
    private Boolean isFeatured;
    private Double relevanceScore;
}
