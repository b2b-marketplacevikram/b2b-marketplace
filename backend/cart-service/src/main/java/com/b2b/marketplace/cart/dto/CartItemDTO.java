package com.b2b.marketplace.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDTO {
    private Long id;
    private Long buyerId;
    private Long productId;
    private Integer quantity;
    
    // Product details from Product Service
    private String productName;
    private String productImage;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
    private String supplierName;
    private Long supplierId;
    private Integer availableStock;
}
