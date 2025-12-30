package com.b2b.marketplace.order.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", unique = true, nullable = false)
    private String orderNumber;

    @Column(name = "buyer_id", nullable = false)
    private Long buyerId;

    @Column(name = "supplier_id", nullable = false)
    private Long supplierId;

    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "tax_amount", precision = 12, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "shipping_cost", precision = 12, scale = 2)
    private BigDecimal shippingCost = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    private String currency = "USD";

    @Column(name = "shipping_address", columnDefinition = "TEXT")
    private String shippingAddress;

    @Column(name = "billing_address", columnDefinition = "TEXT")
    private String billingAddress;

    @Column(name = "tracking_number")
    private String trackingNumber;

    @Column(name = "shipping_method")
    private String shippingMethod;

    @Column(name = "estimated_delivery_date")
    private LocalDate estimatedDeliveryDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "refund_reason", columnDefinition = "TEXT")
    private String refundReason;

    @Column(name = "refund_amount", precision = 12, scale = 2)
    private BigDecimal refundAmount;

    // B2B PO-Based Payment Fields
    @Column(name = "po_number")
    private String poNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type")
    private PaymentType paymentType = PaymentType.BANK_TRANSFER;

    @Column(name = "payment_reference")
    private String paymentReference;

    @Column(name = "payment_proof_url")
    private String paymentProofUrl;

    @Column(name = "payment_verified_at")
    private LocalDateTime paymentVerifiedAt;

    @Column(name = "payment_verified_by")
    private Long paymentVerifiedBy;

    @Column(name = "credit_terms_days")
    private Integer creditTermsDays = 0;

    @Column(name = "credit_limit", precision = 12, scale = 2)
    private BigDecimal creditLimit;

    @Column(name = "payment_commission_rate", precision = 5, scale = 2)
    private BigDecimal paymentCommissionRate = BigDecimal.ZERO;

    @Column(name = "payment_commission_amount", precision = 12, scale = 2)
    private BigDecimal paymentCommissionAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_commission_paid_by")
    private CommissionPaidBy paymentCommissionPaidBy = CommissionPaidBy.BUYER;

    @Column(name = "is_urgent")
    private Boolean isUrgent = false;
    
    // GST Invoice Fields
    @Column(name = "invoice_number", unique = true)
    private String invoiceNumber;
    
    @Column(name = "invoice_date")
    private LocalDateTime invoiceDate;
    
    @Column(name = "buyer_gstin", length = 15)
    private String buyerGstin;
    
    @Column(name = "supplier_gstin", length = 15)
    private String supplierGstin;
    
    @Column(name = "place_of_supply", length = 100)
    private String placeOfSupply;
    
    // Tax breakdown for GST compliance
    @Column(name = "cgst_amount", precision = 12, scale = 2)
    private BigDecimal cgstAmount = BigDecimal.ZERO;
    
    @Column(name = "sgst_amount", precision = 12, scale = 2)
    private BigDecimal sgstAmount = BigDecimal.ZERO;
    
    @Column(name = "igst_amount", precision = 12, scale = 2)
    private BigDecimal igstAmount = BigDecimal.ZERO;
    
    @Column(name = "cess_amount", precision = 12, scale = 2)
    private BigDecimal cessAmount = BigDecimal.ZERO;
    
    @Column(name = "is_same_state")
    private Boolean isSameState = true; // Determines CGST+SGST vs IGST

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum OrderStatus {
        PENDING, AWAITING_PAYMENT, PAYMENT_VERIFIED, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED
    }

    public enum PaymentStatus {
        PENDING, AWAITING_VERIFICATION, PAID, FAILED, REFUNDED
    }

    public enum PaymentType {
        URGENT_ONLINE,      // Razorpay/Stripe with 2% commission
        BANK_TRANSFER,      // NEFT/RTGS/IMPS - 0% commission
        UPI,                // UPI - 0% commission
        CREDIT_TERMS        // NET 30/60/90 for trusted buyers
    }

    public enum CommissionPaidBy {
        BUYER, PLATFORM
    }

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
}
