package com.b2b.marketplace.order.dto;

import lombok.Data;

@Data
public class VerifyPaymentRequest {
    private Boolean approved;
    private String rejectionReason;
}
