package com.b2b.messaging.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderName;
    private Long receiverId;
    private String content;
    private LocalDateTime sentAt;
    private boolean read;
    private LocalDateTime readAt;
    private MessageType type;

    public enum MessageType {
        CHAT, TYPING, READ_RECEIPT, JOIN, LEAVE
    }
}
