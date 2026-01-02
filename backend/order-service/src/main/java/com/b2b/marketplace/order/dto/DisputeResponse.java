package com.b2b.marketplace.order.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for dispute response
 */
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

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTicketNumber() {
        return ticketNumber;
    }

    public void setTicketNumber(String ticketNumber) {
        this.ticketNumber = ticketNumber;
    }

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

    public String getDisputeTypeLabel() {
        return disputeTypeLabel;
    }

    public void setDisputeTypeLabel(String disputeTypeLabel) {
        this.disputeTypeLabel = disputeTypeLabel;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getStatusLabel() {
        return statusLabel;
    }

    public void setStatusLabel(String statusLabel) {
        this.statusLabel = statusLabel;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getPriorityLabel() {
        return priorityLabel;
    }

    public void setPriorityLabel(String priorityLabel) {
        this.priorityLabel = priorityLabel;
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

    public List<AffectedItemResponse> getAffectedItems() {
        return affectedItems;
    }

    public void setAffectedItems(List<AffectedItemResponse> affectedItems) {
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

    public String getRefundStatus() {
        return refundStatus;
    }

    public void setRefundStatus(String refundStatus) {
        this.refundStatus = refundStatus;
    }

    public String getRefundStatusLabel() {
        return refundStatusLabel;
    }

    public void setRefundStatusLabel(String refundStatusLabel) {
        this.refundStatusLabel = refundStatusLabel;
    }

    public LocalDateTime getRefundProcessedAt() {
        return refundProcessedAt;
    }

    public void setRefundProcessedAt(LocalDateTime refundProcessedAt) {
        this.refundProcessedAt = refundProcessedAt;
    }

    public String getResolutionType() {
        return resolutionType;
    }

    public void setResolutionType(String resolutionType) {
        this.resolutionType = resolutionType;
    }

    public String getResolutionTypeLabel() {
        return resolutionTypeLabel;
    }

    public void setResolutionTypeLabel(String resolutionTypeLabel) {
        this.resolutionTypeLabel = resolutionTypeLabel;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
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

    public LocalDateTime getAcknowledgmentDeadline() {
        return acknowledgmentDeadline;
    }

    public void setAcknowledgmentDeadline(LocalDateTime acknowledgmentDeadline) {
        this.acknowledgmentDeadline = acknowledgmentDeadline;
    }

    public LocalDateTime getAcknowledgedAt() {
        return acknowledgedAt;
    }

    public void setAcknowledgedAt(LocalDateTime acknowledgedAt) {
        this.acknowledgedAt = acknowledgedAt;
    }

    public LocalDateTime getResolutionDeadline() {
        return resolutionDeadline;
    }

    public void setResolutionDeadline(LocalDateTime resolutionDeadline) {
        this.resolutionDeadline = resolutionDeadline;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public Long getDaysToResolve() {
        return daysToResolve;
    }

    public void setDaysToResolve(Long daysToResolve) {
        this.daysToResolve = daysToResolve;
    }

    public Boolean getIsOverdueForAcknowledgment() {
        return isOverdueForAcknowledgment;
    }

    public void setIsOverdueForAcknowledgment(Boolean isOverdueForAcknowledgment) {
        this.isOverdueForAcknowledgment = isOverdueForAcknowledgment;
    }

    public Boolean getIsOverdueForResolution() {
        return isOverdueForResolution;
    }

    public void setIsOverdueForResolution(Boolean isOverdueForResolution) {
        this.isOverdueForResolution = isOverdueForResolution;
    }

    public LocalDateTime getEscalatedAt() {
        return escalatedAt;
    }

    public void setEscalatedAt(LocalDateTime escalatedAt) {
        this.escalatedAt = escalatedAt;
    }

    public Integer getEscalationLevel() {
        return escalationLevel;
    }

    public void setEscalationLevel(Integer escalationLevel) {
        this.escalationLevel = escalationLevel;
    }

    public String getEscalationReason() {
        return escalationReason;
    }

    public void setEscalationReason(String escalationReason) {
        this.escalationReason = escalationReason;
    }

    public Integer getBuyerSatisfactionRating() {
        return buyerSatisfactionRating;
    }

    public void setBuyerSatisfactionRating(Integer buyerSatisfactionRating) {
        this.buyerSatisfactionRating = buyerSatisfactionRating;
    }

    public String getBuyerFeedback() {
        return buyerFeedback;
    }

    public void setBuyerFeedback(String buyerFeedback) {
        this.buyerFeedback = buyerFeedback;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getClosedAt() {
        return closedAt;
    }

    public void setClosedAt(LocalDateTime closedAt) {
        this.closedAt = closedAt;
    }

    public List<DisputeMessageResponse> getMessages() {
        return messages;
    }

    public void setMessages(List<DisputeMessageResponse> messages) {
        this.messages = messages;
    }

    public Integer getMessageCount() {
        return messageCount;
    }

    public void setMessageCount(Integer messageCount) {
        this.messageCount = messageCount;
    }

    public Integer getUnreadMessageCount() {
        return unreadMessageCount;
    }

    public void setUnreadMessageCount(Integer unreadMessageCount) {
        this.unreadMessageCount = unreadMessageCount;
    }
    
    public static class AffectedItemResponse {
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

        // Getters and Setters
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

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

        public Boolean getIsRead() {
            return isRead;
        }

        public void setIsRead(Boolean isRead) {
            this.isRead = isRead;
        }

        public LocalDateTime getReadAt() {
            return readAt;
        }

        public void setReadAt(LocalDateTime readAt) {
            this.readAt = readAt;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }
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
