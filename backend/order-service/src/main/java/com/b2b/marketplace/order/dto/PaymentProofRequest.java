package com.b2b.marketplace.order.dto;

public class PaymentProofRequest {
    private String paymentReference;  // UTR Number / Transaction ID
    private String paymentProofUrl;   // Screenshot/receipt URL
    private String paymentMethod;     // NEFT, RTGS, IMPS, UPI
    private String bankName;          // Payer's bank name (optional)

    // Getters and Setters
    public String getPaymentReference() {
        return paymentReference;
    }

    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }

    public String getPaymentProofUrl() {
        return paymentProofUrl;
    }

    public void setPaymentProofUrl(String paymentProofUrl) {
        this.paymentProofUrl = paymentProofUrl;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }
}
