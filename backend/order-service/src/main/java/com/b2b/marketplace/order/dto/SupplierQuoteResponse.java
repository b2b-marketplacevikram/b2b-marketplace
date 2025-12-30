package com.b2b.marketplace.order.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

/**
 * Supplier response to a quote request.
 */
@Data
public class SupplierQuoteResponse {
    private String supplierNotes;
    private BigDecimal discountPercentage;
    private Integer validityDays; // Can extend validity
    private List<QuoteItemPricing> itemPricing;

    @Data
    public static class QuoteItemPricing {
        private Long itemId;
        private BigDecimal quotedPrice;
        private Integer quantity; // Supplier can adjust quantity
        private Integer leadTimeDays;
        private String supplierNotes;
    }
}
