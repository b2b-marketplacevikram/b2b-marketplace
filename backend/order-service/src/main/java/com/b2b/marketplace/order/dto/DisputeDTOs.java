package com.b2b.marketplace.order.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for supplier response to a dispute
 */
@Data
public class SupplierDisputeResponse {
    private String message;
    private String proposedResolution; // FULL_REFUND, PARTIAL_REFUND, REPLACEMENT, etc.
    private BigDecimal proposedRefundAmount;
    private String resolutionNotes;
    private List<String> attachments;
}

/**
 * DTO for resolving a dispute
 */
@Data
class ResolveDisputeRequest {
    private String resolutionType; // FULL_REFUND, PARTIAL_REFUND, REPLACEMENT, etc.
    private String resolutionNotes;
    private BigDecimal refundAmount;
    private Long resolvedBy;
    private String resolvedByName;
}

/**
 * DTO for escalating a dispute
 */
@Data
class EscalateDisputeRequest {
    private String reason;
    private Integer targetLevel; // 1=Senior Support, 2=Management, 3=Grievance Officer
}

/**
 * DTO for adding a message to dispute
 */
@Data
class DisputeMessageRequest {
    private Long senderId;
    private String senderName;
    private String senderType; // BUYER, SUPPLIER, SUPPORT
    private String message;
    private String messageType; // TEXT, STATUS_UPDATE, etc.
    private List<String> attachments;
    private Boolean isInternal = false;
}

/**
 * DTO for buyer feedback after resolution
 */
@Data
class DisputeFeedbackRequest {
    private Integer rating; // 1-5 stars
    private String feedback;
}
