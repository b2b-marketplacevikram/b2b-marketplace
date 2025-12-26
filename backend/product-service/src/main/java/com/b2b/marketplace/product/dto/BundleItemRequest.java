package com.b2b.marketplace.product.dto;

import lombok.Data;

@Data
public class BundleItemRequest {
    private Long productId;
    private Integer quantity;
}
