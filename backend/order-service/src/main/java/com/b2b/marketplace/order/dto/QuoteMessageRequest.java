package com.b2b.marketplace.order.dto;

/**
 * Request to add a message to quote negotiation thread.
 */
public class QuoteMessageRequest {
    private Long senderId;
    private String senderName;
    private String senderType; // BUYER or SUPPLIER
    private String message;
    private String messageType; // TEXT, COUNTER_OFFER, etc.
    private String attachmentUrl;

    // Getters and Setters
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
}
