package com.b2b.marketplace.order.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Supplier response to a quote request.
 */
public class SupplierQuoteResponse {
    private String supplierNotes;
    private BigDecimal discountPercentage;
    private Integer validityDays; // Can extend validity
    private List<QuoteItemPricing> itemPricing;

    // Getters and Setters
    public String getSupplierNotes() { return supplierNotes; }
    public void setSupplierNotes(String supplierNotes) { this.supplierNotes = supplierNotes; }

    public BigDecimal getDiscountPercentage() { return discountPercentage; }
    public void setDiscountPercentage(BigDecimal discountPercentage) { this.discountPercentage = discountPercentage; }

    public Integer getValidityDays() { return validityDays; }
    public void setValidityDays(Integer validityDays) { this.validityDays = validityDays; }

    public List<QuoteItemPricing> getItemPricing() { return itemPricing; }
    public void setItemPricing(List<QuoteItemPricing> itemPricing) { this.itemPricing = itemPricing; }

    public static class QuoteItemPricing {
        private Long itemId;
        private BigDecimal quotedPrice;
        private Integer quantity; // Supplier can adjust quantity
        private Integer leadTimeDays;
        private String supplierNotes;

        // Getters and Setters
        public Long getItemId() { return itemId; }
        public void setItemId(Long itemId) { this.itemId = itemId; }

        public BigDecimal getQuotedPrice() { return quotedPrice; }
        public void setQuotedPrice(BigDecimal quotedPrice) { this.quotedPrice = quotedPrice; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public Integer getLeadTimeDays() { return leadTimeDays; }
        public void setLeadTimeDays(Integer leadTimeDays) { this.leadTimeDays = leadTimeDays; }

        public String getSupplierNotes() { return supplierNotes; }
        public void setSupplierNotes(String supplierNotes) { this.supplierNotes = supplierNotes; }
    }
}
