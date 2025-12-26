package com.b2b.marketplace.payment.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
public class CreateOrderRequest {
    private BigDecimal amount;
    private String currency;
    private String receipt;
    private String orderNumber;
    private Map<String, String> metadata;
}
