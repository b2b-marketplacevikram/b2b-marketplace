package com.b2b.marketplace.product.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductResponse {
    private Long id;
    private Long supplierId;
    private Long supplierUserId;  // The actual user ID for messaging
    private String supplierName;  // Company name or full name
    private String supplierType;  // Business type: manufacturer, distributor, wholesaler, etc.
    private Long categoryId;
    private String categoryName;
    private String name;
    private String description;
    private BigDecimal unitPrice;
    private String unit;
    private Integer moq;
    private Integer stockQuantity;
    private Integer leadTimeDays;
    private String origin;
    private String brand;
    private String model;
    private String specifications;
    private Boolean isActive;
    private Boolean isFeatured;
    private BigDecimal averageRating;
    private Integer reviewCount;
    private List<ProductImageResponse> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
