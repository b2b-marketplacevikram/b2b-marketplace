package com.b2b.marketplace.order.dto;

import lombok.Data;

@Data
public class PaymentProofRequest {
    private String paymentReference;  // UTR Number / Transaction ID
    private String paymentProofUrl;   // Screenshot/receipt URL
    private String paymentMethod;     // NEFT, RTGS, IMPS, UPI
    private String bankName;          // Payer's bank name (optional)
}
