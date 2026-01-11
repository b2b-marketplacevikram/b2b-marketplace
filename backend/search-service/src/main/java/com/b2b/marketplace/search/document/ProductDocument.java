package com.b2b.marketplace.search.document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDocument {

    private String id;

    private Long productId;

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

    private Boolean isActive;

    private String imageUrl;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
