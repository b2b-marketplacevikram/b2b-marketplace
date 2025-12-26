package com.b2b.marketplace.email.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderEmailData {
    
    private Long orderId;
    private String orderNumber;
    private String buyerName;
    private String buyerEmail;
    private String supplierName;
    private String supplierEmail;
    private BigDecimal totalAmount;
    private String currency;
    private String status;
    private LocalDateTime orderDate;
    private String shippingAddress;
    private String paymentMethod;
    private List<OrderItemData> items;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemData {
        private String productName;
        private String sku;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
        private BigDecimal totalPrice; // Added to match Order Service data
    }
}
