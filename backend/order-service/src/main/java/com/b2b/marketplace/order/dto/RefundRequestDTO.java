package com.b2b.marketplace.order.dto;

import java.math.BigDecimal;

public class RefundRequestDTO {
    private Long orderId;
    private String orderNumber;
    private BigDecimal refundAmount;
    private String refundMethod; // ORIGINAL_PAYMENT, BANK_TRANSFER, WALLET_CREDIT
    private String reason;
    private String supplierNotes;

    // Getters and Setters
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public BigDecimal getRefundAmount() { return refundAmount; }
    public void setRefundAmount(BigDecimal refundAmount) { this.refundAmount = refundAmount; }

    public String getRefundMethod() { return refundMethod; }
    public void setRefundMethod(String refundMethod) { this.refundMethod = refundMethod; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getSupplierNotes() { return supplierNotes; }
    public void setSupplierNotes(String supplierNotes) { this.supplierNotes = supplierNotes; }
}
