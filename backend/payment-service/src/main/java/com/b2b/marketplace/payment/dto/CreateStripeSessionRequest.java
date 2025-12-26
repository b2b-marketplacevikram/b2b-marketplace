package com.b2b.marketplace.payment.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class CreateStripeSessionRequest {
    private BigDecimal amount;
    private String currency;
    private String orderId;
    private String orderNumber;
    private String productName;
    private String successUrl;
    private String cancelUrl;
    private List<LineItem> items;
    private Map<String, String> metadata;

    @Data
    public static class LineItem {
        private String name;
        private Long quantity;
        private BigDecimal price;
    }
}
