package com.b2b.messaging.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDTO {
    private Long id;
    private Long buyerId;
    private String buyerName;
    private Long supplierId;
    private String supplierName;
    private String lastMessage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int unreadCount;
    private boolean isOnline;
}
