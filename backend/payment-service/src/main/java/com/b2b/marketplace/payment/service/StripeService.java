package com.b2b.marketplace.payment.service;

import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Charge;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class StripeService {

    @Value("${stripe.secret.key:sk_test_DEMO_KEY}")
    private String secretKey;

    @Value("${stripe.public.key:pk_test_DEMO_KEY}")
    private String publicKey;

    @Value("${stripe.webhook.secret:whsec_DEMO_SECRET}")
    private String webhookSecret;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
        log.info("Stripe initialized with key: {}...", secretKey.substring(0, Math.min(secretKey.length(), 15)));
    }

    /**
     * Create a PaymentIntent for card payments
     * @param amount Amount in dollars
     * @param currency Currency code (usd, eur, etc.)
     * @param description Payment description
     * @return PaymentIntent details including client_secret
     */
    public Map<String, Object> createPaymentIntent(BigDecimal amount, String currency, String description, Map<String, String> metadata) throws StripeException {
        PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                .setAmount(amount.multiply(BigDecimal.valueOf(100)).longValue()) // Convert to cents
                .setCurrency(currency != null ? currency.toLowerCase() : "usd")
                .setDescription(description)
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build()
                );

        if (metadata != null) {
            paramsBuilder.putAllMetadata(metadata);
        }

        PaymentIntent paymentIntent = PaymentIntent.create(paramsBuilder.build());

        Map<String, Object> response = new HashMap<>();
        response.put("paymentIntentId", paymentIntent.getId());
        response.put("clientSecret", paymentIntent.getClientSecret());
        response.put("amount", paymentIntent.getAmount());
        response.put("currency", paymentIntent.getCurrency());
        response.put("status", paymentIntent.getStatus());
        response.put("publicKey", publicKey);

        log.info("PaymentIntent created: {}", paymentIntent.getId());
        return response;
    }

    /**
     * Create a Checkout Session for hosted payment page
     * @param amount Amount in dollars
     * @param currency Currency code
     * @param productName Product name to display
     * @param orderId Order ID for reference
     * @param successUrl Custom success URL (optional)
     * @param cancelUrl Custom cancel URL (optional)
     * @return Session details with checkout URL
     */
    public Map<String, Object> createCheckoutSession(BigDecimal amount, String currency, String productName, String orderId, String successUrl, String cancelUrl) throws StripeException {
        // Use provided URLs or defaults
        String finalSuccessUrl = (successUrl != null && !successUrl.isEmpty()) 
            ? successUrl 
            : frontendUrl + "/orders/" + orderId + "?payment=success&session_id={CHECKOUT_SESSION_ID}";
        String finalCancelUrl = (cancelUrl != null && !cancelUrl.isEmpty()) 
            ? cancelUrl 
            : frontendUrl + "/checkout?payment=cancelled";

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(finalSuccessUrl)
                .setCancelUrl(finalCancelUrl)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency(currency != null ? currency.toLowerCase() : "usd")
                                                .setUnitAmount(amount.multiply(BigDecimal.valueOf(100)).longValue())
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName(productName != null ? productName : "B2B Marketplace Order")
                                                                .setDescription("Order #" + orderId)
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                )
                .putMetadata("orderId", orderId)
                .build();

        Session session = Session.create(params);

        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", session.getId());
        response.put("checkoutUrl", session.getUrl());
        response.put("paymentStatus", session.getPaymentStatus());
        response.put("expiresAt", session.getExpiresAt());

        log.info("Checkout session created: {} for order: {}", session.getId(), orderId);
        return response;
    }

    /**
     * Retrieve a PaymentIntent
     * @param paymentIntentId PaymentIntent ID
     * @return PaymentIntent details
     */
    public Map<String, Object> retrievePaymentIntent(String paymentIntentId) throws StripeException {
        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);

        Map<String, Object> response = new HashMap<>();
        response.put("id", paymentIntent.getId());
        response.put("amount", paymentIntent.getAmount());
        response.put("currency", paymentIntent.getCurrency());
        response.put("status", paymentIntent.getStatus());
        response.put("paymentMethod", paymentIntent.getPaymentMethod());
        response.put("metadata", paymentIntent.getMetadata());

        return response;
    }

    /**
     * Confirm a PaymentIntent
     * @param paymentIntentId PaymentIntent ID
     * @return Updated PaymentIntent details
     */
    public Map<String, Object> confirmPaymentIntent(String paymentIntentId) throws StripeException {
        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
        paymentIntent = paymentIntent.confirm();

        Map<String, Object> response = new HashMap<>();
        response.put("id", paymentIntent.getId());
        response.put("status", paymentIntent.getStatus());
        response.put("confirmed", "succeeded".equals(paymentIntent.getStatus()));

        log.info("PaymentIntent confirmed: {} status: {}", paymentIntentId, paymentIntent.getStatus());
        return response;
    }

    /**
     * Create a refund
     * @param paymentIntentId PaymentIntent ID or Charge ID
     * @param amount Amount to refund (null for full refund)
     * @param reason Refund reason
     * @return Refund details
     */
    public Map<String, Object> createRefund(String paymentIntentId, BigDecimal amount, String reason) throws StripeException {
        RefundCreateParams.Builder paramsBuilder = RefundCreateParams.builder()
                .setPaymentIntent(paymentIntentId);

        if (amount != null) {
            paramsBuilder.setAmount(amount.multiply(BigDecimal.valueOf(100)).longValue());
        }

        if (reason != null) {
            RefundCreateParams.Reason refundReason = switch (reason.toLowerCase()) {
                case "duplicate" -> RefundCreateParams.Reason.DUPLICATE;
                case "fraudulent" -> RefundCreateParams.Reason.FRAUDULENT;
                default -> RefundCreateParams.Reason.REQUESTED_BY_CUSTOMER;
            };
            paramsBuilder.setReason(refundReason);
        }

        Refund refund = Refund.create(paramsBuilder.build());

        Map<String, Object> response = new HashMap<>();
        response.put("id", refund.getId());
        response.put("amount", refund.getAmount());
        response.put("currency", refund.getCurrency());
        response.put("status", refund.getStatus());
        response.put("paymentIntent", refund.getPaymentIntent());

        log.info("Refund created: {} for PaymentIntent: {}", refund.getId(), paymentIntentId);
        return response;
    }

    /**
     * Verify webhook signature
     * @param payload Raw request body
     * @param sigHeader Stripe-Signature header
     * @return Parsed event or null if invalid
     */
    public com.stripe.model.Event verifyWebhookSignature(String payload, String sigHeader) {
        try {
            return Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.error("Webhook signature verification failed: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Retrieve checkout session details
     * @param sessionId Session ID
     * @return Session details
     */
    public Map<String, Object> retrieveCheckoutSession(String sessionId) throws StripeException {
        Session session = Session.retrieve(sessionId);

        Map<String, Object> response = new HashMap<>();
        response.put("id", session.getId());
        response.put("paymentStatus", session.getPaymentStatus());
        response.put("paymentIntent", session.getPaymentIntent());
        response.put("amountTotal", session.getAmountTotal());
        response.put("currency", session.getCurrency());
        response.put("customerEmail", session.getCustomerEmail());
        response.put("metadata", session.getMetadata());

        return response;
    }

    /**
     * Get public key for frontend
     */
    public String getPublicKey() {
        return publicKey;
    }
}
