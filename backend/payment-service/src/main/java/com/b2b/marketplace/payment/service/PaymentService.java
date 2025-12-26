package com.b2b.marketplace.payment.service;

import com.b2b.marketplace.payment.dto.ProcessPaymentRequest;
import com.b2b.marketplace.payment.dto.PaymentResponse;
import com.b2b.marketplace.payment.dto.RefundRequest;
import com.b2b.marketplace.payment.entity.PaymentTransaction;
import com.b2b.marketplace.payment.repository.PaymentTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    @Autowired
    private PaymentTransactionRepository transactionRepository;

    @Transactional
    public PaymentResponse processPayment(ProcessPaymentRequest request) {
        // Generate unique transaction ID
        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();

        // Create payment transaction
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setOrderId(request.getOrderId());
        transaction.setTransactionId(transactionId);
        transaction.setPaymentMethod(request.getPaymentMethod());
        transaction.setAmount(request.getAmount());
        transaction.setCurrency(request.getCurrency());

        // Process payment based on method
        boolean paymentSuccess = processPaymentByMethod(request, transaction);

        if (paymentSuccess) {
            transaction.setStatus(PaymentTransaction.TransactionStatus.SUCCESS);
        } else {
            transaction.setStatus(PaymentTransaction.TransactionStatus.FAILED);
        }

        // Save transaction
        transaction = transactionRepository.save(transaction);

        return mapToResponse(transaction, paymentSuccess);
    }

    private boolean processPaymentByMethod(ProcessPaymentRequest request, PaymentTransaction transaction) {
        // This is a simulation. In production, integrate with real payment gateways
        
        switch (request.getPaymentMethod().toUpperCase()) {
            case "CREDIT_CARD":
                return processCreditCard(request.getCardDetails(), transaction);
            
            case "BANK_TRANSFER":
                return processBankTransfer(request.getBankDetails(), transaction);
            
            case "PAYPAL":
                return processPayPal(request.getPaypalEmail(), transaction);
            
            case "LETTER_OF_CREDIT":
                return processLetterOfCredit(transaction);
            
            default:
                transaction.setGatewayResponse("{\"error\": \"Unsupported payment method\"}");
                return false;
        }
    }

    private boolean processCreditCard(ProcessPaymentRequest.CardDetails cardDetails, PaymentTransaction transaction) {
        // Simulate credit card processing
        // In production: Use Stripe, Square, or other payment gateway
        
        if (cardDetails == null) {
            transaction.setGatewayResponse("{\"error\": \"Card details required\"}");
            return false;
        }

        // Simulate validation
        if (cardDetails.getCardNumber() == null || cardDetails.getCardNumber().length() < 13) {
            transaction.setGatewayResponse("{\"error\": \"Invalid card number\"}");
            return false;
        }

        // Simulate successful processing (90% success rate for demo)
        boolean success = Math.random() > 0.1;
        
        String response = success 
            ? "{\"status\": \"approved\", \"authorization_code\": \"AUTH" + System.currentTimeMillis() + "\"}"
            : "{\"status\": \"declined\", \"error\": \"Insufficient funds\"}";
        
        transaction.setGatewayResponse(response);
        return success;
    }

    private boolean processBankTransfer(ProcessPaymentRequest.BankDetails bankDetails, PaymentTransaction transaction) {
        // Simulate bank transfer
        // In production: Use ACH, wire transfer APIs
        
        if (bankDetails == null) {
            transaction.setGatewayResponse("{\"error\": \"Bank details required\"}");
            return false;
        }

        // Bank transfers are typically pending
        transaction.setGatewayResponse("{\"status\": \"pending\", \"message\": \"Transfer initiated\"}");
        return true;
    }

    private boolean processPayPal(String paypalEmail, PaymentTransaction transaction) {
        // Simulate PayPal payment
        // In production: Use PayPal SDK
        
        if (paypalEmail == null || !paypalEmail.contains("@")) {
            transaction.setGatewayResponse("{\"error\": \"Valid PayPal email required\"}");
            return false;
        }

        transaction.setGatewayResponse("{\"status\": \"completed\", \"paypal_transaction_id\": \"PP" + System.currentTimeMillis() + "\"}");
        return true;
    }

    private boolean processLetterOfCredit(PaymentTransaction transaction) {
        // Simulate letter of credit processing
        // This is typically for large B2B transactions
        
        transaction.setGatewayResponse("{\"status\": \"pending_verification\", \"message\": \"Letter of credit under review\"}");
        return true;
    }

    public List<PaymentResponse> getTransactionsByOrder(Long orderId) {
        List<PaymentTransaction> transactions = transactionRepository.findByOrderId(orderId);
        return transactions.stream()
                .map(t -> mapToResponse(t, t.getStatus() == PaymentTransaction.TransactionStatus.SUCCESS))
                .collect(Collectors.toList());
    }

    public PaymentResponse getTransactionById(String transactionId) {
        PaymentTransaction transaction = transactionRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        return mapToResponse(transaction, transaction.getStatus() == PaymentTransaction.TransactionStatus.SUCCESS);
    }

    @Transactional
    public PaymentResponse refundPayment(RefundRequest request) {
        PaymentTransaction transaction = transactionRepository.findByTransactionId(request.getTransactionId())
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (transaction.getStatus() != PaymentTransaction.TransactionStatus.SUCCESS) {
            throw new RuntimeException("Can only refund successful transactions");
        }

        transaction.setStatus(PaymentTransaction.TransactionStatus.REFUNDED);
        transaction.setGatewayResponse("{\"status\": \"refunded\", \"reason\": \"" + request.getReason() + "\"}");
        transaction = transactionRepository.save(transaction);

        return mapToResponse(transaction, false);
    }

    private PaymentResponse mapToResponse(PaymentTransaction transaction, boolean success) {
        PaymentResponse response = new PaymentResponse();
        response.setId(transaction.getId());
        response.setTransactionId(transaction.getTransactionId());
        response.setOrderId(transaction.getOrderId());
        response.setPaymentMethod(transaction.getPaymentMethod());
        response.setAmount(transaction.getAmount());
        response.setCurrency(transaction.getCurrency());
        response.setStatus(transaction.getStatus().name());
        response.setCreatedAt(transaction.getCreatedAt());
        response.setUpdatedAt(transaction.getUpdatedAt());
        
        if (success) {
            response.setMessage("Payment processed successfully");
        } else {
            response.setMessage("Payment failed or pending");
        }
        
        return response;
    }
}
