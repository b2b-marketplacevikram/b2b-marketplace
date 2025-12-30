package com.b2b.marketplace.order.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Quote response DTO with all details.
 */
@Data
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

    @Data
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
    }

    @Data
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
