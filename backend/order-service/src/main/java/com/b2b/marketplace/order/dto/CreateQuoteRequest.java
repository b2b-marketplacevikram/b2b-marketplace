package com.b2b.marketplace.order.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request to create a new quote (RFQ).
 */
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

    public Long getBuyerId() { return buyerId; }
    public void setBuyerId(Long buyerId) { this.buyerId = buyerId; }

    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }

    public String getBuyerEmail() { return buyerEmail; }
    public void setBuyerEmail(String buyerEmail) { this.buyerEmail = buyerEmail; }

    public String getBuyerPhone() { return buyerPhone; }
    public void setBuyerPhone(String buyerPhone) { this.buyerPhone = buyerPhone; }

    public String getBuyerCompany() { return buyerCompany; }
    public void setBuyerCompany(String buyerCompany) { this.buyerCompany = buyerCompany; }

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public String getBuyerRequirements() { return buyerRequirements; }
    public void setBuyerRequirements(String buyerRequirements) { this.buyerRequirements = buyerRequirements; }

    public Boolean getIsFromCart() { return isFromCart; }
    public void setIsFromCart(Boolean isFromCart) { this.isFromCart = isFromCart; }

    public List<QuoteItemRequest> getItems() { return items; }
    public void setItems(List<QuoteItemRequest> items) { this.items = items; }

    public static class QuoteItemRequest {
        private Long productId;
        private String productName;
        private String productImage;
        private Integer quantity;
        private BigDecimal originalPrice;
        private String unit;
        private String specifications;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }

        public String getProductImage() { return productImage; }
        public void setProductImage(String productImage) { this.productImage = productImage; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public BigDecimal getOriginalPrice() { return originalPrice; }
        public void setOriginalPrice(BigDecimal originalPrice) { this.originalPrice = originalPrice; }

        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }

        public String getSpecifications() { return specifications; }
        public void setSpecifications(String specifications) { this.specifications = specifications; }
    }
}
