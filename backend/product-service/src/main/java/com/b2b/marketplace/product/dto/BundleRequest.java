package com.b2b.marketplace.product.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class BundleRequest {
    private Long supplierId;
    private String name;
    private String description;
    private BigDecimal discountPercentage;
    private Integer minOrderQuantity;
    private Boolean isActive;
    private Boolean isFeatured;
    private String imageUrl;
    private List<BundleItemRequest> items;
}
