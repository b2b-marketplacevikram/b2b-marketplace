package com.b2b.marketplace.order.entity;

import jakarta.persistence.*;
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
    private Integer validityDays = 15;

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

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getQuoteNumber() { return quoteNumber; }
    public void setQuoteNumber(String quoteNumber) { this.quoteNumber = quoteNumber; }

    public Long getBuyerId() { return buyerId; }
    public void setBuyerId(Long buyerId) { this.buyerId = buyerId; }

    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }

    public String getBuyerEmail() { return buyerEmail; }
    public void setBuyerEmail(String buyerEmail) { this.buyerEmail = buyerEmail; }

    public String getBuyerPhone() { return buyerPhone; }
    public void setBuyerPhone(String buyerPhone) { this.buyerPhone = buyerPhone; }

    public String getBuyerCompany() { return buyerCompany; }
    public void setBuyerCompany(String buyerCompany) { this.buyerCompany = buyerCompany; }

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }

    public QuoteStatus getStatus() { return status; }
    public void setStatus(QuoteStatus status) { this.status = status; }

    public BigDecimal getOriginalTotal() { return originalTotal; }
    public void setOriginalTotal(BigDecimal originalTotal) { this.originalTotal = originalTotal; }

    public BigDecimal getQuotedTotal() { return quotedTotal; }
    public void setQuotedTotal(BigDecimal quotedTotal) { this.quotedTotal = quotedTotal; }

    public BigDecimal getFinalTotal() { return finalTotal; }
    public void setFinalTotal(BigDecimal finalTotal) { this.finalTotal = finalTotal; }

    public BigDecimal getDiscountPercentage() { return discountPercentage; }
    public void setDiscountPercentage(BigDecimal discountPercentage) { this.discountPercentage = discountPercentage; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public String getBuyerRequirements() { return buyerRequirements; }
    public void setBuyerRequirements(String buyerRequirements) { this.buyerRequirements = buyerRequirements; }

    public String getSupplierNotes() { return supplierNotes; }
    public void setSupplierNotes(String supplierNotes) { this.supplierNotes = supplierNotes; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public Integer getValidityDays() { return validityDays; }
    public void setValidityDays(Integer validityDays) { this.validityDays = validityDays; }

    public LocalDate getValidUntil() { return validUntil; }
    public void setValidUntil(LocalDate validUntil) { this.validUntil = validUntil; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getRespondedAt() { return respondedAt; }
    public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

    public LocalDateTime getConvertedToOrderAt() { return convertedToOrderAt; }
    public void setConvertedToOrderAt(LocalDateTime convertedToOrderAt) { this.convertedToOrderAt = convertedToOrderAt; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public Boolean getIsFromCart() { return isFromCart; }
    public void setIsFromCart(Boolean isFromCart) { this.isFromCart = isFromCart; }

    public Integer getNegotiationCount() { return negotiationCount; }
    public void setNegotiationCount(Integer negotiationCount) { this.negotiationCount = negotiationCount; }

    public List<QuoteItem> getItems() { return items; }
    public void setItems(List<QuoteItem> items) { this.items = items; }

    public List<QuoteMessage> getMessages() { return messages; }
    public void setMessages(List<QuoteMessage> messages) { this.messages = messages; }

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
        PENDING,
        SUPPLIER_RESPONDED,
        BUYER_REVIEWING,
        NEGOTIATING,
        APPROVED,
        CONVERTED,
        REJECTED,
        CANCELLED,
        EXPIRED
    }
}
