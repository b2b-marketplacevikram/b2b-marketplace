package com.b2b.notification.controller;

import com.b2b.notification.service.SupplierInfoService;
import com.b2b.notification.service.WhatsAppNotificationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for WhatsApp notifications
 * Handles product search notifications to suppliers
 */
@RestController
@RequestMapping("/api/whatsapp")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:5173"})
public class WhatsAppNotificationController {

    private final WhatsAppNotificationService whatsAppService;
    private final SupplierInfoService supplierInfoService;

    /**
     * Notify suppliers when a buyer searches for products
     * Called from search service or frontend
     */
    @PostMapping("/notify/product-search")
    public ResponseEntity<?> notifyProductSearch(@RequestBody ProductSearchNotificationRequest request) {
        log.info("Product search notification request: query='{}', suppliers={}", 
                 request.getSearchQuery(), request.getSuppliers() != null ? request.getSuppliers().size() : 0);
        
        if (request.getSuppliers() == null || request.getSuppliers().isEmpty()) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "No suppliers to notify",
                "notificationsSent", 0
            ));
        }
        
        int successCount = 0;
        int failCount = 0;
        int skippedCount = 0;
        
        for (SupplierInfo supplier : request.getSuppliers()) {
            try {
                // Get supplier phone from cache or user service
                String phone = supplier.getPhone();
                if (phone == null || phone.isEmpty()) {
                    phone = supplierInfoService.getSupplierPhone(supplier.getId());
                }
                
                // Check if supplier wants search notifications
                if (!supplierInfoService.shouldNotifyOnSearch(supplier.getId())) {
                    log.debug("Supplier {} has disabled search notifications", supplier.getId());
                    skippedCount++;
                    continue;
                }
                
                if (phone == null || phone.isEmpty()) {
                    log.debug("No phone number for supplier {}", supplier.getId());
                    skippedCount++;
                    continue;
                }
                
                boolean sent = whatsAppService.sendProductSearchNotification(
                    phone,
                    supplier.getName(),
                    request.getSearchQuery(),
                    request.getBuyerLocation(),
                    supplier.getMatchingProductCount()
                );
                
                if (sent) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (Exception e) {
                log.error("Error sending notification to supplier {}: {}", supplier.getId(), e.getMessage());
                failCount++;
            }
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", String.format("Notifications: %d sent, %d failed, %d skipped", 
                                              successCount, failCount, skippedCount));
        response.put("notificationsSent", successCount);
        response.put("notificationsFailed", failCount);
        response.put("notificationsSkipped", skippedCount);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Notify supplier of new order
     */
    @PostMapping("/notify/new-order")
    public ResponseEntity<?> notifyNewOrder(@RequestBody NewOrderNotificationRequest request) {
        log.info("New order notification: order={}, supplier={}", request.getOrderNumber(), request.getSupplierId());
        
        boolean sent = whatsAppService.sendNewOrderNotification(
            request.getSupplierPhone(),
            request.getSupplierName(),
            request.getOrderNumber(),
            request.getOrderAmount(),
            request.getBuyerName()
        );
        
        return ResponseEntity.ok(Map.of(
            "success", sent,
            "message", sent ? "Order notification sent successfully" : "Failed to send notification"
        ));
    }

    /**
     * Notify supplier of payment received
     */
    @PostMapping("/notify/payment-received")
    public ResponseEntity<?> notifyPaymentReceived(@RequestBody PaymentNotificationRequest request) {
        log.info("Payment notification: order={}", request.getOrderNumber());
        
        boolean sent = whatsAppService.sendPaymentReceivedNotification(
            request.getSupplierPhone(),
            request.getOrderNumber(),
            request.getAmount(),
            request.getPaymentMethod()
        );
        
        return ResponseEntity.ok(Map.of(
            "success", sent,
            "message", sent ? "Payment notification sent successfully" : "Failed to send notification"
        ));
    }

    /**
     * Test WhatsApp notification
     */
    @PostMapping("/test")
    public ResponseEntity<?> testNotification(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");
        String message = request.getOrDefault("message", "🧪 Test notification from MarketPlus B2B Marketplace!");
        
        log.info("Testing WhatsApp notification to: {}", phone);
        
        boolean sent = whatsAppService.sendProductSearchNotification(
            phone, "Test Supplier", "test product", "Test Location", 5
        );
        
        return ResponseEntity.ok(Map.of(
            "success", sent,
            "message", sent ? "Test notification sent!" : "Notification in demo mode (no WhatsApp API configured)",
            "demoMode", !sent
        ));
    }

    // Request DTOs
    @Data
    public static class ProductSearchNotificationRequest {
        private String searchQuery;
        private String buyerLocation;
        private Long buyerId;
        private List<SupplierInfo> suppliers;
    }

    @Data
    public static class SupplierInfo {
        private Long id;
        private String name;
        private String phone;
        private int matchingProductCount;
    }

    @Data
    public static class NewOrderNotificationRequest {
        private Long supplierId;
        private String supplierName;
        private String supplierPhone;
        private String orderNumber;
        private double orderAmount;
        private String buyerName;
    }

    @Data
    public static class PaymentNotificationRequest {
        private String supplierPhone;
        private String orderNumber;
        private double amount;
        private String paymentMethod;
    }
}
