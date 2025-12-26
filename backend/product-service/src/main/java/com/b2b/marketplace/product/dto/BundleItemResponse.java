package com.b2b.marketplace.product.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class BundleItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal subtotal;
}
