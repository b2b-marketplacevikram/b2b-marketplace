package com.b2b.marketplace.order.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for supplier response to a dispute
 */
public class SupplierDisputeResponse {
    private String message;
    private String proposedResolution; // FULL_REFUND, PARTIAL_REFUND, REPLACEMENT, etc.
    private BigDecimal proposedRefundAmount;
    private String resolutionNotes;
    private List<String> attachments;

    // Getters and Setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getProposedResolution() {
        return proposedResolution;
    }

    public void setProposedResolution(String proposedResolution) {
        this.proposedResolution = proposedResolution;
    }

    public BigDecimal getProposedRefundAmount() {
        return proposedRefundAmount;
    }

    public void setProposedRefundAmount(BigDecimal proposedRefundAmount) {
        this.proposedRefundAmount = proposedRefundAmount;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public List<String> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<String> attachments) {
        this.attachments = attachments;
    }
}

/**
 * DTO for resolving a dispute
 */
class ResolveDisputeRequest {
    private String resolutionType; // FULL_REFUND, PARTIAL_REFUND, REPLACEMENT, etc.
    private String resolutionNotes;
    private BigDecimal refundAmount;
    private Long resolvedBy;
    private String resolvedByName;

    // Getters and Setters
    public String getResolutionType() {
        return resolutionType;
    }

    public void setResolutionType(String resolutionType) {
        this.resolutionType = resolutionType;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public BigDecimal getRefundAmount() {
        return refundAmount;
    }

    public void setRefundAmount(BigDecimal refundAmount) {
        this.refundAmount = refundAmount;
    }

    public Long getResolvedBy() {
        return resolvedBy;
    }

    public void setResolvedBy(Long resolvedBy) {
        this.resolvedBy = resolvedBy;
    }

    public String getResolvedByName() {
        return resolvedByName;
    }

    public void setResolvedByName(String resolvedByName) {
        this.resolvedByName = resolvedByName;
    }
}

/**
 * DTO for escalating a dispute
 */
class EscalateDisputeRequest {
    private String reason;
    private Integer targetLevel; // 1=Senior Support, 2=Management, 3=Grievance Officer

    // Getters and Setters
    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Integer getTargetLevel() {
        return targetLevel;
    }

    public void setTargetLevel(Integer targetLevel) {
        this.targetLevel = targetLevel;
    }
}

/**
 * DTO for adding a message to dispute
 */
class DisputeMessageRequest {
    private Long senderId;
    private String senderName;
    private String senderType; // BUYER, SUPPLIER, SUPPORT
    private String message;
    private String messageType; // TEXT, STATUS_UPDATE, etc.
    private List<String> attachments;
    private Boolean isInternal = false;

    // Getters and Setters
    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getSenderType() {
        return senderType;
    }

    public void setSenderType(String senderType) {
        this.senderType = senderType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getMessageType() {
        return messageType;
    }

    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }

    public List<String> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<String> attachments) {
        this.attachments = attachments;
    }

    public Boolean getIsInternal() {
        return isInternal;
    }

    public void setIsInternal(Boolean isInternal) {
        this.isInternal = isInternal;
    }
}

/**
 * DTO for buyer feedback after resolution
 */
class DisputeFeedbackRequest {
    private Integer rating; // 1-5 stars
    private String feedback;

    // Getters and Setters
    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}
