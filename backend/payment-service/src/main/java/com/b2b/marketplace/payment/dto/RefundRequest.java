package com.b2b.marketplace.payment.dto;

import lombok.Data;

@Data
public class RefundRequest {
    private String transactionId;
    private String reason;
}
