package com.b2b.marketplace.payment.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

@Data
public class ProcessPaymentRequest {
    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotNull(message = "Payment method is required")
    private String paymentMethod; // CREDIT_CARD, BANK_TRANSFER, PAYPAL, LETTER_OF_CREDIT

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    private String currency = "USD";

    // Payment method specific data
    private CardDetails cardDetails;
    private BankDetails bankDetails;
    private String paypalEmail;

    @Data
    public static class CardDetails {
        private String cardNumber;
        private String cardholderName;
        private String expiryMonth;
        private String expiryYear;
        private String cvv;
    }

    @Data
    public static class BankDetails {
        private String accountNumber;
        private String routingNumber;
        private String bankName;
    }
}
