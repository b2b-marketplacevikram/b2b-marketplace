package com.b2b.marketplace.order.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for creating a new dispute/ticket
 */
public class CreateDisputeRequest {
    private Long orderId;
    private String orderNumber;
    
    // Buyer Info
    private Long buyerId;
    private String buyerName;
    private String buyerEmail;
    private String buyerPhone;
    
    // Supplier Info
    private Long supplierId;
    private String supplierName;
    
    // Dispute Details
    private String disputeType; // PRODUCT_QUALITY, WRONG_PRODUCT, etc.
    private String priority;     // LOW, MEDIUM, HIGH, URGENT
    private String subject;
    private String description;
    
    // Affected Products
    private List<AffectedItem> affectedItems;
    
    // Evidence
    private List<String> evidenceUrls;
    
    // Refund Request
    private Boolean refundRequested = false;
    private BigDecimal refundAmount;

    // Getters and Setters
    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public Long getBuyerId() {
        return buyerId;
    }

    public void setBuyerId(Long buyerId) {
        this.buyerId = buyerId;
    }

    public String getBuyerName() {
        return buyerName;
    }

    public void setBuyerName(String buyerName) {
        this.buyerName = buyerName;
    }

    public String getBuyerEmail() {
        return buyerEmail;
    }

    public void setBuyerEmail(String buyerEmail) {
        this.buyerEmail = buyerEmail;
    }

    public String getBuyerPhone() {
        return buyerPhone;
    }

    public void setBuyerPhone(String buyerPhone) {
        this.buyerPhone = buyerPhone;
    }

    public Long getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(Long supplierId) {
        this.supplierId = supplierId;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public String getDisputeType() {
        return disputeType;
    }

    public void setDisputeType(String disputeType) {
        this.disputeType = disputeType;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<AffectedItem> getAffectedItems() {
        return affectedItems;
    }

    public void setAffectedItems(List<AffectedItem> affectedItems) {
        this.affectedItems = affectedItems;
    }

    public List<String> getEvidenceUrls() {
        return evidenceUrls;
    }

    public void setEvidenceUrls(List<String> evidenceUrls) {
        this.evidenceUrls = evidenceUrls;
    }

    public Boolean getRefundRequested() {
        return refundRequested;
    }

    public void setRefundRequested(Boolean refundRequested) {
        this.refundRequested = refundRequested;
    }

    public BigDecimal getRefundAmount() {
        return refundAmount;
    }

    public void setRefundAmount(BigDecimal refundAmount) {
        this.refundAmount = refundAmount;
    }
    
    public static class AffectedItem {
        private Long productId;
        private String productName;
        private Integer quantity;
        private String issue;

        // Getters and Setters
        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }

        public String getProductName() {
            return productName;
        }

        public void setProductName(String productName) {
            this.productName = productName;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public String getIssue() {
            return issue;
        }

        public void setIssue(String issue) {
            this.issue = issue;
        }
    }
}
