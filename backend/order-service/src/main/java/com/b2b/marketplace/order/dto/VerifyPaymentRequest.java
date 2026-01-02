package com.b2b.marketplace.order.dto;

public class VerifyPaymentRequest {
    private Boolean approved;
    private String rejectionReason;

    // Getters and Setters
    public Boolean getApproved() {
        return approved;
    }

    public void setApproved(Boolean approved) {
        this.approved = approved;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}
