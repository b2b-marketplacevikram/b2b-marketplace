package com.b2b.marketplace.payment.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentResponse {
    private Long id;
    private String transactionId;
    private Long orderId;
    private String paymentMethod;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
