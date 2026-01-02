package com.b2b.marketplace.order.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "refund_requests")
public class RefundRequest {
    
    public enum RefundMethod {
        ORIGINAL_PAYMENT,
        BANK_TRANSFER,
        WALLET_CREDIT
    }
    
    public enum RefundStatus {
        PENDING,
        BUYER_CONFIRMED,
        PROCESSING,
        COMPLETED,
        REJECTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "order_number", nullable = false)
    private String orderNumber;

    @Column(name = "buyer_id", nullable = false)
    private Long buyerId;

    @Column(name = "supplier_id", nullable = false)
    private Long supplierId;

    @Column(name = "refund_amount", nullable = false)
    private BigDecimal refundAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "refund_method", nullable = false)
    private RefundMethod refundMethod;

    @Column(name = "reason", nullable = false, length = 500)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private RefundStatus status = RefundStatus.PENDING;

    @Column(name = "buyer_bank_details_id")
    private Long buyerBankDetailsId;

    @Column(name = "original_payment_ref")
    private String originalPaymentRef;

    @Column(name = "supplier_notes", length = 500)
    private String supplierNotes;

    @Column(name = "buyer_notes", length = 500)
    private String buyerNotes;

    @Column(name = "initiated_by")
    private Long initiatedBy;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public Long getBuyerId() { return buyerId; }
    public void setBuyerId(Long buyerId) { this.buyerId = buyerId; }

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public BigDecimal getRefundAmount() { return refundAmount; }
    public void setRefundAmount(BigDecimal refundAmount) { this.refundAmount = refundAmount; }

    public RefundMethod getRefundMethod() { return refundMethod; }
    public void setRefundMethod(RefundMethod refundMethod) { this.refundMethod = refundMethod; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public RefundStatus getStatus() { return status; }
    public void setStatus(RefundStatus status) { this.status = status; }

    public Long getBuyerBankDetailsId() { return buyerBankDetailsId; }
    public void setBuyerBankDetailsId(Long buyerBankDetailsId) { this.buyerBankDetailsId = buyerBankDetailsId; }

    public String getOriginalPaymentRef() { return originalPaymentRef; }
    public void setOriginalPaymentRef(String originalPaymentRef) { this.originalPaymentRef = originalPaymentRef; }

    public String getSupplierNotes() { return supplierNotes; }
    public void setSupplierNotes(String supplierNotes) { this.supplierNotes = supplierNotes; }

    public String getBuyerNotes() { return buyerNotes; }
    public void setBuyerNotes(String buyerNotes) { this.buyerNotes = buyerNotes; }

    public Long getInitiatedBy() { return initiatedBy; }
    public void setInitiatedBy(Long initiatedBy) { this.initiatedBy = initiatedBy; }

    public LocalDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(LocalDateTime confirmedAt) { this.confirmedAt = confirmedAt; }

    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
