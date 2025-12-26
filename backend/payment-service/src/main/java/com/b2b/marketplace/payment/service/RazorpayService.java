package com.b2b.marketplace.payment.service;

import com.razorpay.Order;
import com.razorpay.Payment;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Refund;
import com.razorpay.Utils;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class RazorpayService {

    @Value("${razorpay.key.id:rzp_test_DEMO_KEY}")
    private String keyId;

    @Value("${razorpay.key.secret:DEMO_SECRET}")
    private String keySecret;

    private RazorpayClient razorpayClient;

    @PostConstruct
    public void init() {
        try {
            this.razorpayClient = new RazorpayClient(keyId, keySecret);
            log.info("Razorpay client initialized with key: {}...", keyId.substring(0, Math.min(keyId.length(), 15)));
        } catch (RazorpayException e) {
            log.error("Failed to initialize Razorpay client: {}", e.getMessage());
        }
    }

    /**
     * Create a Razorpay order for payment
     * @param amount Amount in INR (will be converted to paise)
     * @param currency Currency code (INR)
     * @param receipt Order receipt/reference number
     * @return Order details with order_id
     */
    public Map<String, Object> createOrder(BigDecimal amount, String currency, String receipt) throws RazorpayException {
        JSONObject orderRequest = new JSONObject();
        // Razorpay expects amount in smallest currency unit (paise for INR)
        orderRequest.put("amount", amount.multiply(BigDecimal.valueOf(100)).intValue());
        orderRequest.put("currency", currency != null ? currency : "INR");
        orderRequest.put("receipt", receipt);
        orderRequest.put("payment_capture", 1); // Auto capture payment

        Order order = razorpayClient.orders.create(orderRequest);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.get("id"));
        response.put("amount", order.get("amount"));
        response.put("currency", order.get("currency"));
        response.put("receipt", order.get("receipt"));
        response.put("status", order.get("status"));
        response.put("keyId", keyId); // Frontend needs this for checkout

        log.info("Razorpay order created: {}", String.valueOf(order.get("id")));
        return response;
    }

    /**
     * Verify payment signature after successful payment
     * @param razorpayOrderId Order ID from Razorpay
     * @param razorpayPaymentId Payment ID from Razorpay
     * @param razorpaySignature Signature to verify
     * @return true if signature is valid
     */
    public boolean verifyPaymentSignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            boolean isValid = Utils.verifyPaymentSignature(options, keySecret);
            log.info("Payment signature verification result: {} for payment: {}", isValid, razorpayPaymentId);
            return isValid;
        } catch (RazorpayException e) {
            log.error("Signature verification failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Fetch payment details from Razorpay
     * @param paymentId Razorpay payment ID
     * @return Payment details
     */
    public Map<String, Object> fetchPayment(String paymentId) throws RazorpayException {
        Payment payment = razorpayClient.payments.fetch(paymentId);

        Map<String, Object> response = new HashMap<>();
        response.put("id", payment.get("id"));
        response.put("amount", payment.get("amount"));
        response.put("currency", payment.get("currency"));
        response.put("status", payment.get("status"));
        response.put("method", payment.get("method"));
        response.put("email", payment.get("email"));
        response.put("contact", payment.get("contact"));
        response.put("orderId", payment.get("order_id"));

        return response;
    }

    /**
     * Capture a payment (if not auto-captured)
     * @param paymentId Payment ID to capture
     * @param amount Amount to capture (in INR)
     * @return Capture response
     */
    public Map<String, Object> capturePayment(String paymentId, BigDecimal amount) throws RazorpayException {
        JSONObject captureRequest = new JSONObject();
        captureRequest.put("amount", amount.multiply(BigDecimal.valueOf(100)).intValue());
        captureRequest.put("currency", "INR");

        Payment payment = razorpayClient.payments.capture(paymentId, captureRequest);

        Map<String, Object> response = new HashMap<>();
        response.put("id", payment.get("id"));
        response.put("status", payment.get("status"));
        response.put("captured", payment.get("captured"));

        log.info("Payment captured: {} status: {}", paymentId, String.valueOf(payment.get("status")));
        return response;
    }

    /**
     * Refund a payment
     * @param paymentId Payment ID to refund
     * @param amount Amount to refund (full refund if null)
     * @return Refund details
     */
    public Map<String, Object> refundPayment(String paymentId, BigDecimal amount) throws RazorpayException {
        JSONObject refundRequest = new JSONObject();
        if (amount != null) {
            refundRequest.put("amount", amount.multiply(BigDecimal.valueOf(100)).intValue());
        }
        refundRequest.put("speed", "normal");

        Refund refund = razorpayClient.payments.refund(paymentId, refundRequest);

        Map<String, Object> response = new HashMap<>();
        response.put("id", refund.get("id"));
        response.put("paymentId", refund.get("payment_id"));
        response.put("amount", refund.get("amount"));
        response.put("status", refund.get("status"));

        log.info("Refund initiated: {} for payment: {}", String.valueOf(refund.get("id")), paymentId);
        return response;
    }

    /**
     * Get Razorpay key ID for frontend
     */
    public String getKeyId() {
        return keyId;
    }
}
