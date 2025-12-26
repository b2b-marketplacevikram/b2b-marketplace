package com.b2b.marketplace.product.dto;

import lombok.Data;

@Data
public class ProductImageResponse {
    private Long id;
    private String imageUrl;
    private Boolean isPrimary;
    private Integer sortOrder;
}
