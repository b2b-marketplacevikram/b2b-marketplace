package com.b2b.notification.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    private Long id;
    private String type; // ORDER_STATUS_CHANGED, ORDER_CREATED, PAYMENT_RECEIVED, etc.
    private String title;
    private String message;
    private Long userId;
    private Long orderId;
    private String orderStatus;
    private LocalDateTime timestamp;
    private boolean read;
    private String severity; // INFO, WARNING, ERROR, SUCCESS
}
