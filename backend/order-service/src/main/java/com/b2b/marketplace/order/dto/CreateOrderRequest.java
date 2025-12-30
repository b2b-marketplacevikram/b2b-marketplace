package com.b2b.marketplace.order.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateOrderRequest {
    private Long buyerId;
    private Long supplierId;
    private String paymentMethod;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal shippingCost;
    private BigDecimal totalAmount;
    private String shippingAddress;
    private String billingAddress;
    private String shippingMethod;
    private String notes;
    private List<OrderItemRequest> items;
    
    // B2B PO-Based Payment Fields
    private String poNumber;
    private String paymentType;  // URGENT_ONLINE, BANK_TRANSFER, UPI, CREDIT_TERMS
    private Boolean isUrgent = false;
    private Integer creditTermsDays;  // For CREDIT_TERMS: 30, 60, 90

    @Data
    public static class OrderItemRequest {
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }
}
