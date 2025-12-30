package com.b2b.marketplace.order.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Quote entity for B2B RFQ (Request for Quote) functionality.
 * Supports single and multi-product quotes with negotiation workflow.
 */
@Entity
@Table(name = "quotes")
@Data
public class Quote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quote_number", unique = true, nullable = false)
    private String quoteNumber;

    @Column(name = "buyer_id", nullable = false)
    private Long buyerId;

    @Column(name = "buyer_name")
    private String buyerName;

    @Column(name = "buyer_email")
    private String buyerEmail;

    @Column(name = "buyer_phone")
    private String buyerPhone;

    @Column(name = "buyer_company")
    private String buyerCompany;

    @Column(name = "supplier_id", nullable = false)
    private Long supplierId;

    @Column(name = "supplier_name")
    private String supplierName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuoteStatus status = QuoteStatus.PENDING;

    @Column(name = "original_total", precision = 12, scale = 2)
    private BigDecimal originalTotal;

    @Column(name = "quoted_total", precision = 12, scale = 2)
    private BigDecimal quotedTotal;

    @Column(name = "final_total", precision = 12, scale = 2)
    private BigDecimal finalTotal;

    @Column(name = "discount_percentage", precision = 5, scale = 2)
    private BigDecimal discountPercentage = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 12, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    private String currency = "INR";

    @Column(name = "shipping_address", columnDefinition = "TEXT")
    private String shippingAddress;

    @Column(name = "buyer_requirements", columnDefinition = "TEXT")
    private String buyerRequirements;

    @Column(name = "supplier_notes", columnDefinition = "TEXT")
    private String supplierNotes;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "validity_days")
    private Integer validityDays = 15; // Default 15 days

    @Column(name = "valid_until")
    private LocalDate validUntil;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "converted_to_order_at")
    private LocalDateTime convertedToOrderAt;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "order_number")
    private String orderNumber;

    @Column(name = "is_from_cart")
    private Boolean isFromCart = false;

    @Column(name = "negotiation_count")
    private Integer negotiationCount = 0;

    @OneToMany(mappedBy = "quote", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuoteItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "quote", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt DESC")
    private List<QuoteMessage> messages = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (validUntil == null) {
            validUntil = LocalDate.now().plusDays(validityDays);
        }
        if (quoteNumber == null) {
            quoteNumber = "QT" + System.currentTimeMillis();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void addItem(QuoteItem item) {
        items.add(item);
        item.setQuote(this);
    }

    public void addMessage(QuoteMessage message) {
        messages.add(message);
        message.setQuote(this);
    }

    public void calculateTotals() {
        this.originalTotal = items.stream()
            .map(item -> item.getOriginalPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        this.quotedTotal = items.stream()
            .map(item -> (item.getQuotedPrice() != null ? item.getQuotedPrice() : item.getOriginalPrice())
                .multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        if (this.discountPercentage != null && this.discountPercentage.compareTo(BigDecimal.ZERO) > 0) {
            this.discountAmount = this.quotedTotal.multiply(this.discountPercentage).divide(BigDecimal.valueOf(100));
            this.finalTotal = this.quotedTotal.subtract(this.discountAmount);
        } else {
            this.finalTotal = this.quotedTotal;
        }
    }

    public boolean isExpired() {
        return validUntil != null && LocalDate.now().isAfter(validUntil);
    }

    public void extendValidity(int additionalDays) {
        this.validUntil = this.validUntil.plusDays(additionalDays);
        this.validityDays = (int) java.time.temporal.ChronoUnit.DAYS.between(
            this.createdAt.toLocalDate(), this.validUntil);
    }

    public enum QuoteStatus {
        PENDING,           // Buyer submitted, waiting for supplier response
        SUPPLIER_RESPONDED, // Supplier provided pricing
        BUYER_REVIEWING,   // Buyer is reviewing the quote
        NEGOTIATING,       // Counter-offer in progress
        APPROVED,          // Supplier final approval - ready to convert
        CONVERTED,         // Converted to order
        REJECTED,          // Rejected by supplier
        CANCELLED,         // Cancelled by buyer
        EXPIRED            // Quote validity expired
    }
}
