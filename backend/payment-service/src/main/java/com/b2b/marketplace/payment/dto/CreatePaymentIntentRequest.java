package com.b2b.marketplace.payment.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreatePaymentIntentRequest {
    private BigDecimal amount;
    private String currency;
    private String description;
    private String orderId;
}
