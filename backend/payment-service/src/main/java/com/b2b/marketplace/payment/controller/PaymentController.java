package com.b2b.marketplace.payment.controller;

import com.b2b.marketplace.payment.dto.*;
import com.b2b.marketplace.payment.service.PaymentService;
import com.b2b.marketplace.payment.service.RazorpayService;
import com.b2b.marketplace.payment.service.StripeService;
import com.razorpay.RazorpayException;
import com.stripe.exception.StripeException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final RazorpayService razorpayService;
    private final StripeService stripeService;

    // ==================== Razorpay Endpoints ====================

    /**
     * Create Razorpay order for payment
     */
    @PostMapping("/razorpay/create-order")
    public ResponseEntity<?> createRazorpayOrder(@RequestBody CreateOrderRequest request) {
        try {
            Map<String, Object> order = razorpayService.createOrder(
                    request.getAmount(),
                    request.getCurrency(),
                    request.getReceipt() != null ? request.getReceipt() : "order_" + System.currentTimeMillis()
            );
            return ResponseEntity.ok(order);
        } catch (RazorpayException e) {
            log.error("Failed to create Razorpay order: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to create payment order",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Verify Razorpay payment after successful payment
     */
    @PostMapping("/razorpay/verify")
    public ResponseEntity<?> verifyRazorpayPayment(@RequestBody VerifyPaymentRequest request) {
        boolean isValid = razorpayService.verifyPaymentSignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (isValid) {
            log.info("Payment verified successfully: {}", request.getRazorpayPaymentId());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Payment verified successfully",
                    "paymentId", request.getRazorpayPaymentId(),
                    "orderId", request.getOrderId()
            ));
        } else {
            log.warn("Payment verification failed for: {}", request.getRazorpayPaymentId());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Payment verification failed"
            ));
        }
    }

    /**
     * Get Razorpay payment details
     */
    @GetMapping("/razorpay/payment/{paymentId}")
    public ResponseEntity<?> getRazorpayPayment(@PathVariable String paymentId) {
        try {
            Map<String, Object> payment = razorpayService.fetchPayment(paymentId);
            return ResponseEntity.ok(payment);
        } catch (RazorpayException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get Razorpay key for frontend
     */
    @GetMapping("/razorpay/key")
    public ResponseEntity<?> getRazorpayKey() {
        return ResponseEntity.ok(Map.of("keyId", razorpayService.getKeyId()));
    }

    // ==================== Stripe Endpoints ====================

    /**
     * Create Stripe PaymentIntent for custom payment flow
     */
    @PostMapping("/stripe/create-payment-intent")
    public ResponseEntity<?> createStripePaymentIntent(@RequestBody CreatePaymentIntentRequest request) {
        try {
            Map<String, String> metadata = new HashMap<>();
            if (request.getOrderId() != null) {
                metadata.put("orderId", request.getOrderId());
            }

            Map<String, Object> paymentIntent = stripeService.createPaymentIntent(
                    request.getAmount(),
                    request.getCurrency(),
                    request.getDescription(),
                    metadata
            );
            return ResponseEntity.ok(paymentIntent);
        } catch (StripeException e) {
            log.error("Failed to create PaymentIntent: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to create payment",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Create Stripe Checkout Session for hosted payment page
     */
    @PostMapping("/stripe/create-checkout-session")
    public ResponseEntity<?> createStripeCheckoutSession(@RequestBody CreateStripeSessionRequest request) {
        try {
            // Use orderId if provided, otherwise fall back to orderNumber
            String orderId = request.getOrderId() != null ? request.getOrderId() : request.getOrderNumber();
            
            Map<String, Object> session = stripeService.createCheckoutSession(
                    request.getAmount(),
                    request.getCurrency(),
                    request.getProductName(),
                    orderId,
                    request.getSuccessUrl(),
                    request.getCancelUrl()
            );
            return ResponseEntity.ok(session);
        } catch (StripeException e) {
            log.error("Failed to create Checkout Session: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to create checkout session",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Retrieve PaymentIntent status
     */
    @GetMapping("/stripe/payment-intent/{paymentIntentId}")
    public ResponseEntity<?> getStripePaymentIntent(@PathVariable String paymentIntentId) {
        try {
            Map<String, Object> paymentIntent = stripeService.retrievePaymentIntent(paymentIntentId);
            return ResponseEntity.ok(paymentIntent);
        } catch (StripeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Retrieve Checkout Session status
     */
    @GetMapping("/stripe/session/{sessionId}")
    public ResponseEntity<?> getStripeSession(@PathVariable String sessionId) {
        try {
            Map<String, Object> session = stripeService.retrieveCheckoutSession(sessionId);
            return ResponseEntity.ok(session);
        } catch (StripeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get Stripe public key for frontend
     */
    @GetMapping("/stripe/key")
    public ResponseEntity<?> getStripePublicKey() {
        return ResponseEntity.ok(Map.of("publicKey", stripeService.getPublicKey()));
    }

    /**
     * Stripe webhook handler
     */
    @PostMapping("/stripe/webhook")
    public ResponseEntity<?> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        
        var event = stripeService.verifyWebhookSignature(payload, sigHeader);
        
        if (event == null) {
            return ResponseEntity.badRequest().body("Invalid signature");
        }

        // Handle the event
        switch (event.getType()) {
            case "payment_intent.succeeded":
                log.info("PaymentIntent succeeded: {}", event.getId());
                // Update order status, send confirmation email, etc.
                break;
            case "payment_intent.payment_failed":
                log.warn("PaymentIntent failed: {}", event.getId());
                // Handle failed payment
                break;
            case "checkout.session.completed":
                log.info("Checkout session completed: {}", event.getId());
                // Fulfill the order
                break;
            default:
                log.info("Unhandled event type: {}", event.getType());
        }

        return ResponseEntity.ok(Map.of("received", true));
    }

    // ==================== General Payment Endpoints ====================

    /**
     * Process payment (legacy/mock)
     */
    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@Valid @RequestBody ProcessPaymentRequest request) {
        try {
            PaymentResponse response = paymentService.processPayment(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByOrder(@PathVariable Long orderId) {
        List<PaymentResponse> payments = paymentService.getTransactionsByOrder(orderId);
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<?> getPaymentByTransactionId(@PathVariable String transactionId) {
        try {
            PaymentResponse payment = paymentService.getTransactionById(transactionId);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/refund")
    public ResponseEntity<?> refundPayment(@RequestBody RefundRequest request) {
        try {
            PaymentResponse response = paymentService.refundPayment(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
