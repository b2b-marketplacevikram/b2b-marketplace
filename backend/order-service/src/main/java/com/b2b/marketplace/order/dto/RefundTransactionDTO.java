package com.b2b.marketplace.order.dto;

import java.time.LocalDateTime;

/**
 * DTO for Refund Transaction - Used when supplier submits refund details
 */
public class RefundTransactionDTO {
    
    private String transactionId;
    private String bankName;
    private LocalDateTime transactionDate;
    private String proofUrl;
    private String notes;

    // For response
    private Boolean buyerConfirmed;
    private LocalDateTime confirmedAt;
    private String confirmationNotes;
    private LocalDateTime createdAt;

    // Getters and Setters
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
}
