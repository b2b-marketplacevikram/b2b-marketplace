package com.b2b.marketplace.order.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Quote response DTO with all details.
 */
public class QuoteResponse {
    private Long id;
    private String quoteNumber;
    private Long buyerId;
    private String buyerName;
    private String buyerEmail;
    private String buyerPhone;
    private String buyerCompany;
    private Long supplierId;
    private String supplierName;
    private String status;
    private String statusLabel;
    private BigDecimal originalTotal;
    private BigDecimal quotedTotal;
    private BigDecimal finalTotal;
    private BigDecimal discountPercentage;
    private BigDecimal discountAmount;
    private String currency;
    private String shippingAddress;
    private String buyerRequirements;
    private String supplierNotes;
    private String rejectionReason;
    private Integer validityDays;
    private LocalDate validUntil;
    private Boolean isExpired;
    private Integer daysRemaining;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime respondedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime convertedToOrderAt;
    private Long orderId;
    private String orderNumber;
    private Boolean isFromCart;
    private Integer negotiationCount;
    private List<QuoteItemResponse> items;
    private List<QuoteMessageResponse> messages;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getQuoteNumber() { return quoteNumber; }
    public void setQuoteNumber(String quoteNumber) { this.quoteNumber = quoteNumber; }

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

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getStatusLabel() { return statusLabel; }
    public void setStatusLabel(String statusLabel) { this.statusLabel = statusLabel; }

    public BigDecimal getOriginalTotal() { return originalTotal; }
    public void setOriginalTotal(BigDecimal originalTotal) { this.originalTotal = originalTotal; }

    public BigDecimal getQuotedTotal() { return quotedTotal; }
    public void setQuotedTotal(BigDecimal quotedTotal) { this.quotedTotal = quotedTotal; }

    public BigDecimal getFinalTotal() { return finalTotal; }
    public void setFinalTotal(BigDecimal finalTotal) { this.finalTotal = finalTotal; }

    public BigDecimal getDiscountPercentage() { return discountPercentage; }
    public void setDiscountPercentage(BigDecimal discountPercentage) { this.discountPercentage = discountPercentage; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public String getBuyerRequirements() { return buyerRequirements; }
    public void setBuyerRequirements(String buyerRequirements) { this.buyerRequirements = buyerRequirements; }

    public String getSupplierNotes() { return supplierNotes; }
    public void setSupplierNotes(String supplierNotes) { this.supplierNotes = supplierNotes; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public Integer getValidityDays() { return validityDays; }
    public void setValidityDays(Integer validityDays) { this.validityDays = validityDays; }

    public LocalDate getValidUntil() { return validUntil; }
    public void setValidUntil(LocalDate validUntil) { this.validUntil = validUntil; }

    public Boolean getIsExpired() { return isExpired; }
    public void setIsExpired(Boolean isExpired) { this.isExpired = isExpired; }

    public Integer getDaysRemaining() { return daysRemaining; }
    public void setDaysRemaining(Integer daysRemaining) { this.daysRemaining = daysRemaining; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getRespondedAt() { return respondedAt; }
    public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

    public LocalDateTime getConvertedToOrderAt() { return convertedToOrderAt; }
    public void setConvertedToOrderAt(LocalDateTime convertedToOrderAt) { this.convertedToOrderAt = convertedToOrderAt; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public Boolean getIsFromCart() { return isFromCart; }
    public void setIsFromCart(Boolean isFromCart) { this.isFromCart = isFromCart; }

    public Integer getNegotiationCount() { return negotiationCount; }
    public void setNegotiationCount(Integer negotiationCount) { this.negotiationCount = negotiationCount; }

    public List<QuoteItemResponse> getItems() { return items; }
    public void setItems(List<QuoteItemResponse> items) { this.items = items; }

    public List<QuoteMessageResponse> getMessages() { return messages; }
    public void setMessages(List<QuoteMessageResponse> messages) { this.messages = messages; }

    public static class QuoteItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productImage;
        private Integer quantity;
        private Integer requestedQuantity;
        private BigDecimal originalPrice;
        private BigDecimal quotedPrice;
        private BigDecimal finalPrice;
        private String unit;
        private String specifications;
        private String supplierNotes;
        private Integer leadTimeDays;
        private BigDecimal lineTotal;

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }

        public String getProductImage() { return productImage; }
        public void setProductImage(String productImage) { this.productImage = productImage; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public Integer getRequestedQuantity() { return requestedQuantity; }
        public void setRequestedQuantity(Integer requestedQuantity) { this.requestedQuantity = requestedQuantity; }

        public BigDecimal getOriginalPrice() { return originalPrice; }
        public void setOriginalPrice(BigDecimal originalPrice) { this.originalPrice = originalPrice; }

        public BigDecimal getQuotedPrice() { return quotedPrice; }
        public void setQuotedPrice(BigDecimal quotedPrice) { this.quotedPrice = quotedPrice; }

        public BigDecimal getFinalPrice() { return finalPrice; }
        public void setFinalPrice(BigDecimal finalPrice) { this.finalPrice = finalPrice; }

        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }

        public String getSpecifications() { return specifications; }
        public void setSpecifications(String specifications) { this.specifications = specifications; }

        public String getSupplierNotes() { return supplierNotes; }
        public void setSupplierNotes(String supplierNotes) { this.supplierNotes = supplierNotes; }

        public Integer getLeadTimeDays() { return leadTimeDays; }
        public void setLeadTimeDays(Integer leadTimeDays) { this.leadTimeDays = leadTimeDays; }

        public BigDecimal getLineTotal() { return lineTotal; }
        public void setLineTotal(BigDecimal lineTotal) { this.lineTotal = lineTotal; }
    }

    public static class QuoteMessageResponse {
        private Long id;
        private Long senderId;
        private String senderName;
        private String senderType;
        private String message;
        private String messageType;
        private String attachmentUrl;
        private Boolean isRead;
        private LocalDateTime createdAt;

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getSenderId() { return senderId; }
        public void setSenderId(Long senderId) { this.senderId = senderId; }

        public String getSenderName() { return senderName; }
        public void setSenderName(String senderName) { this.senderName = senderName; }

        public String getSenderType() { return senderType; }
        public void setSenderType(String senderType) { this.senderType = senderType; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public String getMessageType() { return messageType; }
        public void setMessageType(String messageType) { this.messageType = messageType; }

        public String getAttachmentUrl() { return attachmentUrl; }
        public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }

        public Boolean getIsRead() { return isRead; }
        public void setIsRead(Boolean isRead) { this.isRead = isRead; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static String getStatusLabel(String status) {
        return switch (status) {
            case "PENDING" -> "Pending Review";
            case "SUPPLIER_RESPONDED" -> "Quote Received";
            case "BUYER_REVIEWING" -> "Under Review";
            case "NEGOTIATING" -> "In Negotiation";
            case "APPROVED" -> "Approved - Ready to Order";
            case "CONVERTED" -> "Converted to Order";
            case "REJECTED" -> "Rejected";
            case "CANCELLED" -> "Cancelled";
            case "EXPIRED" -> "Expired";
            default -> status;
        };
    }
}
