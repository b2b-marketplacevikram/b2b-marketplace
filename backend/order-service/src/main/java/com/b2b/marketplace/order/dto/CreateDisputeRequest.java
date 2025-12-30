package com.b2b.marketplace.order.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for creating a new dispute/ticket
 */
@Data
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
    
    @Data
    public static class AffectedItem {
        private Long productId;
        private String productName;
        private Integer quantity;
        private String issue;
    }
}
