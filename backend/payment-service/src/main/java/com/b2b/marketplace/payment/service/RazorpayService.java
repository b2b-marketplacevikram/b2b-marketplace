package com.b2b.marketplace.payment.service;

import com.razorpay.Order;
import com.razorpay.Payment;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Refund;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
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
        int amountInPaise = amount.multiply(BigDecimal.valueOf(100)).intValue();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", currency != null ? currency : "INR");
        orderRequest.put("receipt", receipt);
        orderRequest.put("payment_capture", 1); // Auto capture payment

        Order order = razorpayClient.orders.create(orderRequest);
        
        // Convert to JSON string first, then parse to avoid SDK type casting issues
        String orderJson = order.toString();
        JSONObject orderData = new JSONObject(orderJson);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", orderData.getString("id"));
        response.put("amount", orderData.getInt("amount"));
        response.put("currency", orderData.getString("currency"));
        response.put("receipt", orderData.optString("receipt", receipt));
        response.put("status", orderData.getString("status"));
        response.put("keyId", keyId); // Frontend needs this for checkout

        log.info("Razorpay order created: {}", orderData.getString("id"));
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
            // Manual signature verification to avoid SDK bug
            String payload = razorpayOrderId + "|" + razorpayPaymentId;
            String expectedSignature = calculateHmacSha256(payload, keySecret);
            
            boolean isValid = expectedSignature.equals(razorpaySignature);
            log.info("Payment signature verification result: {} for payment: {}", isValid, razorpayPaymentId);
            return isValid;
        } catch (Exception e) {
            log.error("Signature verification failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Calculate HMAC-SHA256 signature
     */
    private String calculateHmacSha256(String data, String secret) throws NoSuchAlgorithmException, InvalidKeyException {
        Mac sha256Hmac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256Hmac.init(secretKey);
        byte[] hash = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        
        // Convert to hex string
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }

    /**
     * Fetch payment details from Razorpay
     * @param paymentId Razorpay payment ID
     * @return Payment details
     */
    public Map<String, Object> fetchPayment(String paymentId) throws RazorpayException {
        Payment payment = razorpayClient.payments.fetch(paymentId);
        
        // Convert to JSON to avoid SDK type casting issues
        String paymentJson = payment.toString();
        JSONObject paymentData = new JSONObject(paymentJson);

        Map<String, Object> response = new HashMap<>();
        response.put("id", paymentData.optString("id"));
        response.put("amount", paymentData.optInt("amount"));
        response.put("currency", paymentData.optString("currency"));
        response.put("status", paymentData.optString("status"));
        response.put("method", paymentData.optString("method"));
        response.put("email", paymentData.optString("email"));
        response.put("contact", paymentData.optString("contact"));
        response.put("orderId", paymentData.optString("order_id"));

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
        
        // Convert to JSON to avoid SDK type casting issues
        String paymentJson = payment.toString();
        JSONObject paymentData = new JSONObject(paymentJson);

        Map<String, Object> response = new HashMap<>();
        response.put("id", paymentData.optString("id"));
        response.put("status", paymentData.optString("status"));
        response.put("captured", paymentData.optBoolean("captured"));

        log.info("Payment captured: {} status: {}", paymentId, paymentData.optString("status"));
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
        
        // Convert to JSON to avoid SDK type casting issues
        String refundJson = refund.toString();
        JSONObject refundData = new JSONObject(refundJson);

        Map<String, Object> response = new HashMap<>();
        response.put("id", refundData.optString("id"));
        response.put("paymentId", refundData.optString("payment_id"));
        response.put("amount", refundData.optInt("amount"));
        response.put("status", refundData.optString("status"));

        log.info("Refund initiated: {} for payment: {}", refundData.optString("id"), paymentId);
        return response;
    }

    /**
     * Get Razorpay key ID for frontend
     */
    public String getKeyId() {
        return keyId;
    }
}
