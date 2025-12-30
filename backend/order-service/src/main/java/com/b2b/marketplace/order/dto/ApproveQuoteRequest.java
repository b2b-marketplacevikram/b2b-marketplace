package com.b2b.marketplace.order.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

/**
 * Final approval request - supplier sets final prices and approves.
 * This makes the quote ready to convert to order.
 */
@Data
public class ApproveQuoteRequest {
    private String supplierNotes;
    private BigDecimal discountPercentage;
    private Integer additionalValidityDays; // Optional: extend validity
    private List<FinalItemPricing> finalPricing;

    @Data
    public static class FinalItemPricing {
        private Long itemId;
        private BigDecimal finalPrice;
        private Integer quantity;
        private Integer leadTimeDays;
    }
}
