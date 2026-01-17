package com.b2b.marketplace.order.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Dispute Message Entity - Communication thread for dispute resolution
 */
@Entity
@Table(name = "dispute_messages")
public class DisputeMessage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "dispute_id", nullable = false, insertable = false, updatable = false)
    private Long disputeId;
    
    @Column(name = "sender_id")
    private Long senderId;
    
    @Column(name = "sender_name")
    private String senderName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "sender_type")
    private SenderType senderType;
    
    @Column(name = "message", columnDefinition = "TEXT")
    private String message;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "message_type")
    private MessageType messageType = MessageType.TEXT;
    
    // Attachments (JSON array of URLs)
    @Column(name = "attachments", columnDefinition = "TEXT")
    private String attachments;
    
    @Column(name = "is_internal")
    private Boolean isInternal = false; // Internal notes not visible to buyer
    
    @Column(name = "is_read")
    private Boolean isRead = false;
    
    @Column(name = "read_at")
    private LocalDateTime readAt;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDisputeId() {
        return disputeId;
    }

    public void setDisputeId(Long disputeId) {
        this.disputeId = disputeId;
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

    public SenderType getSenderType() {
        return senderType;
    }

    public void setSenderType(SenderType senderType) {
        this.senderType = senderType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public MessageType getMessageType() {
        return messageType;
    }

    public void setMessageType(MessageType messageType) {
        this.messageType = messageType;
    }

    public String getAttachments() {
        return attachments;
    }

    public void setAttachments(String attachments) {
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
    
    public enum SenderType {
        BUYER,
        SUPPLIER,
        SUPPORT,    // Platform support staff
        SYSTEM      // Automated messages
    }
    
    public enum MessageType {
        TEXT,
        EVIDENCE,
        RESOLUTION_OFFER,
        STATUS_UPDATE,
        SYSTEM
    }
}
