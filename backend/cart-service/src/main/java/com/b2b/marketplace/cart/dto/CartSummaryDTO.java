package com.b2b.marketplace.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartSummaryDTO {
    private Long buyerId;
    private List<CartItemDTO> items;
    private Integer totalItems;
    private BigDecimal totalAmount;
}
