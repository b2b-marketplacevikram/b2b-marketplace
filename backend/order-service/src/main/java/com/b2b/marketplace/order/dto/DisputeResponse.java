package com.b2b.marketplace.order.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for dispute response
 */
@Data
public class DisputeResponse {
    private Long id;
    private String ticketNumber;
    
    // Order Info
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
    private String disputeType;
    private String disputeTypeLabel;
    private String status;
    private String statusLabel;
    private String priority;
    private String priorityLabel;
    private String subject;
    private String description;
    
    // Affected Items
    private List<AffectedItemResponse> affectedItems;
    
    // Evidence
    private List<String> evidenceUrls;
    
    // Refund Details
    private Boolean refundRequested;
    private BigDecimal refundAmount;
    private String refundStatus;
    private String refundStatusLabel;
    private LocalDateTime refundProcessedAt;
    
    // Resolution
    private String resolutionType;
    private String resolutionTypeLabel;
    private String resolutionNotes;
    private Long resolvedBy;
    private String resolvedByName;
    
    // Compliance (Indian E-Commerce Rules)
    private LocalDateTime acknowledgmentDeadline;
    private LocalDateTime acknowledgedAt;
    private LocalDateTime resolutionDeadline;
    private LocalDateTime resolvedAt;
    private Long daysToResolve;
    private Boolean isOverdueForAcknowledgment;
    private Boolean isOverdueForResolution;
    
    // Escalation
    private LocalDateTime escalatedAt;
    private Integer escalationLevel;
    private String escalationLevelLabel;
    private String escalationReason;
    
    // Satisfaction
    private Integer buyerSatisfactionRating;
    private String buyerFeedback;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime closedAt;
    
    // Messages
    private List<DisputeMessageResponse> messages;
    private Integer messageCount;
    private Integer unreadMessageCount;
    
    @Data
    public static class AffectedItemResponse {
        private Long productId;
        private String productName;
        private Integer quantity;
        private String issue;
    }
    
    @Data
    public static class DisputeMessageResponse {
        private Long id;
        private Long senderId;
        private String senderName;
        private String senderType;
        private String message;
        private String messageType;
        private List<String> attachments;
        private Boolean isInternal;
        private Boolean isRead;
        private LocalDateTime readAt;
        private LocalDateTime createdAt;
    }
    
    // Helper to get escalation level label
    public String getEscalationLevelLabel() {
        if (escalationLevel == null || escalationLevel == 0) return "None";
        return switch (escalationLevel) {
            case 1 -> "Senior Support";
            case 2 -> "Management";
            case 3 -> "Grievance Officer";
            default -> "Level " + escalationLevel;
        };
    }
}
