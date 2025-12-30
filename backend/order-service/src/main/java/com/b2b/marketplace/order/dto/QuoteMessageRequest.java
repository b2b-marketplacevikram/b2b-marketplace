package com.b2b.marketplace.order.dto;

import lombok.Data;

/**
 * Request to add a message to quote negotiation thread.
 */
@Data
public class QuoteMessageRequest {
    private Long senderId;
    private String senderName;
    private String senderType; // BUYER or SUPPLIER
    private String message;
    private String messageType; // TEXT, COUNTER_OFFER, etc.
    private String attachmentUrl;
}
