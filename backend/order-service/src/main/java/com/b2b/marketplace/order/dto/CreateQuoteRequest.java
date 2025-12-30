package com.b2b.marketplace.order.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

/**
 * Request to create a new quote (RFQ).
 */
@Data
public class CreateQuoteRequest {
    private Long buyerId;
    private String buyerName;
    private String buyerEmail;
    private String buyerPhone;
    private String buyerCompany;
    private Long supplierId;
    private String supplierName;
    private String shippingAddress;
    private String buyerRequirements;
    private Boolean isFromCart = false;
    private List<QuoteItemRequest> items;

    @Data
    public static class QuoteItemRequest {
        private Long productId;
        private String productName;
        private String productImage;
        private Integer quantity;
        private BigDecimal originalPrice;
        private String unit;
        private String specifications;
    }
}
