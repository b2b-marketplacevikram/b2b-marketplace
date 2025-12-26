package com.b2b.marketplace.product.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class BundleResponse {
    private Long id;
    private Long supplierId;
    private Long supplierUserId;
    private String supplierName;
    private String name;
    private String description;
    private BigDecimal discountPercentage;
    private BigDecimal originalPrice;
    private BigDecimal bundlePrice;
    private BigDecimal savings;
    private Integer minOrderQuantity;
    private Boolean isActive;
    private Boolean isFeatured;
    private String imageUrl;
    private List<BundleItemResponse> items;
    private Integer totalItems;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
