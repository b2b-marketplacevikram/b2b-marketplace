package com.b2b.marketplace.order.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Final approval request - supplier sets final prices and approves.
 * This makes the quote ready to convert to order.
 */
public class ApproveQuoteRequest {
    private String supplierNotes;
    private BigDecimal discountPercentage;
    private Integer additionalValidityDays;
    private List<FinalItemPricing> finalPricing;

    public String getSupplierNotes() { return supplierNotes; }
    public void setSupplierNotes(String supplierNotes) { this.supplierNotes = supplierNotes; }

    public BigDecimal getDiscountPercentage() { return discountPercentage; }
    public void setDiscountPercentage(BigDecimal discountPercentage) { this.discountPercentage = discountPercentage; }

    public Integer getAdditionalValidityDays() { return additionalValidityDays; }
    public void setAdditionalValidityDays(Integer additionalValidityDays) { this.additionalValidityDays = additionalValidityDays; }

    public List<FinalItemPricing> getFinalPricing() { return finalPricing; }
    public void setFinalPricing(List<FinalItemPricing> finalPricing) { this.finalPricing = finalPricing; }

    public static class FinalItemPricing {
        private Long itemId;
        private BigDecimal finalPrice;
        private Integer quantity;
        private Integer leadTimeDays;

        public Long getItemId() { return itemId; }
        public void setItemId(Long itemId) { this.itemId = itemId; }

        public BigDecimal getFinalPrice() { return finalPrice; }
        public void setFinalPrice(BigDecimal finalPrice) { this.finalPrice = finalPrice; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public Integer getLeadTimeDays() { return leadTimeDays; }
        public void setLeadTimeDays(Integer leadTimeDays) { this.leadTimeDays = leadTimeDays; }
    }
}
