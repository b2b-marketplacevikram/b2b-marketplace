package com.b2b.marketplace.order.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Refund Transaction Entity - Records refund transaction details from supplier
 * 
 * Flow:
 * 1. Buyer submits bank details
 * 2. Supplier processes refund and submits transaction details (this entity)
 * 3. Buyer confirms receipt of refund
 */
@Entity
@Table(name = "refund_transactions")
public class RefundTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "dispute_id", nullable = false)
    private Long disputeId;

    @Column(name = "ticket_number", nullable = false)
    private String ticketNumber;

    @Column(name = "supplier_id", nullable = false)
    private Long supplierId;

    @Column(name = "buyer_id", nullable = false)
    private Long buyerId;

    // Transaction Details from Supplier
    @Column(name = "transaction_id", nullable = false)
    private String transactionId;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "transaction_date")
    private LocalDateTime transactionDate;

    @Column(name = "proof_url")
    private String proofUrl;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Buyer Confirmation
    @Column(name = "buyer_confirmed")
    private Boolean buyerConfirmed = false;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "confirmation_notes", columnDefinition = "TEXT")
    private String confirmationNotes;

    // Timestamps
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

    public Long getDisputeId() { return disputeId; }
    public void setDisputeId(Long disputeId) { this.disputeId = disputeId; }

    public String getTicketNumber() { return ticketNumber; }
    public void setTicketNumber(String ticketNumber) { this.ticketNumber = ticketNumber; }

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public Long getBuyerId() { return buyerId; }
    public void setBuyerId(Long buyerId) { this.buyerId = buyerId; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }

    public LocalDateTime getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDateTime transactionDate) { this.transactionDate = transactionDate; }

    public String getProofUrl() { return proofUrl; }
    public void setProofUrl(String proofUrl) { this.proofUrl = proofUrl; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Boolean getBuyerConfirmed() { return buyerConfirmed; }
    public void setBuyerConfirmed(Boolean buyerConfirmed) { this.buyerConfirmed = buyerConfirmed; }

    public LocalDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(LocalDateTime confirmedAt) { this.confirmedAt = confirmedAt; }

    public String getConfirmationNotes() { return confirmationNotes; }
    public void setConfirmationNotes(String confirmationNotes) { this.confirmationNotes = confirmationNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
