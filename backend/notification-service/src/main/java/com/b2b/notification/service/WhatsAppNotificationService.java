package com.b2b.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * WhatsApp Notification Service for sending notifications to suppliers
 * Supports: WhatsApp Cloud API (Meta) and Twilio WhatsApp API
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WhatsAppNotificationService {

    private final RestTemplate restTemplate = new RestTemplate();
    
    // WhatsApp Cloud API (Meta) Configuration
    @Value("${whatsapp.cloud.api.url:https://graph.facebook.com/v18.0}")
    private String whatsappApiUrl;
    
    @Value("${whatsapp.cloud.api.token:}")
    private String whatsappToken;
    
    @Value("${whatsapp.cloud.api.phone-number-id:}")
    private String phoneNumberId;
    
    // Twilio Configuration (Alternative)
    @Value("${twilio.account.sid:}")
    private String twilioAccountSid;
    
    @Value("${twilio.auth.token:}")
    private String twilioAuthToken;
    
    @Value("${twilio.whatsapp.from:}")
    private String twilioWhatsappFrom;
    
    // Rate limiting - prevent spam
    private final Map<String, LocalDateTime> lastNotificationTime = new ConcurrentHashMap<>();
    private static final int MIN_INTERVAL_MINUTES = 5; // Minimum 5 minutes between same type notifications
    
    // Notification queue for batch processing
    private final List<WhatsAppMessage> messageQueue = Collections.synchronizedList(new ArrayList<>());

    /**
     * Send WhatsApp notification to supplier when buyer searches for their product
     */
    public boolean sendProductSearchNotification(String supplierPhone, String supplierName, 
                                                  String searchQuery, String buyerLocation,
                                                  int matchingProductCount) {
        // Rate limiting check
        String rateLimitKey = supplierPhone + "_SEARCH";
        if (isRateLimited(rateLimitKey)) {
            log.debug("Rate limited: Skipping WhatsApp notification for {}", supplierPhone);
            return false;
        }
        
        String message = formatProductSearchMessage(supplierName, searchQuery, buyerLocation, matchingProductCount);
        
        boolean sent = sendWhatsAppMessage(supplierPhone, message);
        
        if (sent) {
            updateRateLimit(rateLimitKey);
            log.info("WhatsApp notification sent to supplier {} for search: {}", supplierPhone, searchQuery);
        }
        
        return sent;
    }

    /**
     * Send WhatsApp notification for new order
     */
    public boolean sendNewOrderNotification(String supplierPhone, String supplierName,
                                            String orderNumber, double orderAmount,
                                            String buyerName) {
        String message = String.format(
            "🛒 *New Order Received!*\n\n" +
            "Hi %s,\n\n" +
            "Great news! You have a new order.\n\n" +
            "📋 *Order:* %s\n" +
            "💰 *Amount:* ₹%.2f\n" +
            "👤 *Buyer:* %s\n\n" +
            "Please log in to your dashboard to view order details and confirm.\n\n" +
            "🔗 Dashboard: marketplus.com/supplier\n\n" +
            "_MarketPlus B2B Marketplace_",
            supplierName, orderNumber, orderAmount, buyerName
        );
        
        return sendWhatsAppMessage(supplierPhone, message);
    }

    /**
     * Send WhatsApp notification for payment received
     */
    public boolean sendPaymentReceivedNotification(String supplierPhone, String orderNumber,
                                                    double amount, String paymentMethod) {
        String message = String.format(
            "💰 *Payment Received!*\n\n" +
            "Payment confirmed for Order %s\n\n" +
            "💵 *Amount:* ₹%.2f\n" +
            "📝 *Method:* %s\n\n" +
            "You can now process and ship this order.\n\n" +
            "_MarketPlus B2B Marketplace_",
            orderNumber, amount, paymentMethod
        );
        
        return sendWhatsAppMessage(supplierPhone, message);
    }

    /**
     * Format product search notification message
     */
    private String formatProductSearchMessage(String supplierName, String searchQuery,
                                              String buyerLocation, int matchingProductCount) {
        StringBuilder sb = new StringBuilder();
        sb.append("🔍 *Product Interest Alert!*\n\n");
        sb.append(String.format("Hi %s,\n\n", supplierName));
        sb.append("A buyer is looking for products you sell!\n\n");
        sb.append(String.format("🔎 *Search:* \"%s\"\n", searchQuery));
        
        if (buyerLocation != null && !buyerLocation.isEmpty()) {
            sb.append(String.format("📍 *Location:* %s\n", buyerLocation));
        }
        
        sb.append(String.format("📦 *Your Matching Products:* %d\n\n", matchingProductCount));
        sb.append("💡 *Tip:* Make sure your products are well-stocked and competitively priced!\n\n");
        sb.append("🔗 View your products: marketplus.com/supplier/products\n\n");
        sb.append("_MarketPlus B2B Marketplace_");
        
        return sb.toString();
    }

    /**
     * Send WhatsApp message using configured provider
     */
    private boolean sendWhatsAppMessage(String toPhone, String message) {
        // Clean phone number
        String cleanPhone = cleanPhoneNumber(toPhone);
        
        if (cleanPhone == null || cleanPhone.length() < 10) {
            log.warn("Invalid phone number: {}", toPhone);
            return false;
        }
        
        // Try WhatsApp Cloud API first (Meta)
        if (isWhatsAppCloudConfigured()) {
            return sendViaWhatsAppCloud(cleanPhone, message);
        }
        
        // Fallback to Twilio
        if (isTwilioConfigured()) {
            return sendViaTwilio(cleanPhone, message);
        }
        
        // Demo mode - log message
        log.info("📱 WhatsApp Demo Mode - Message to {}:\n{}", cleanPhone, message);
        return true; // Return true in demo mode for testing
    }

    /**
     * Send via WhatsApp Cloud API (Meta)
     */
    private boolean sendViaWhatsAppCloud(String toPhone, String message) {
        try {
            String url = String.format("%s/%s/messages", whatsappApiUrl, phoneNumberId);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(whatsappToken);
            
            Map<String, Object> body = new HashMap<>();
            body.put("messaging_product", "whatsapp");
            body.put("to", toPhone);
            body.put("type", "text");
            body.put("text", Map.of("body", message));
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("WhatsApp Cloud API: Message sent successfully to {}", toPhone);
                return true;
            } else {
                log.error("WhatsApp Cloud API error: {}", response.getBody());
                return false;
            }
        } catch (Exception e) {
            log.error("WhatsApp Cloud API exception: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Send via Twilio WhatsApp API
     */
    private boolean sendViaTwilio(String toPhone, String message) {
        try {
            String url = String.format(
                "https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json",
                twilioAccountSid
            );
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.setBasicAuth(twilioAccountSid, twilioAuthToken);
            
            String body = String.format(
                "From=%s&To=whatsapp:+%s&Body=%s",
                twilioWhatsappFrom,
                toPhone,
                java.net.URLEncoder.encode(message, "UTF-8")
            );
            
            HttpEntity<String> request = new HttpEntity<>(body, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Twilio WhatsApp: Message sent successfully to {}", toPhone);
                return true;
            } else {
                log.error("Twilio WhatsApp error: {}", response.getBody());
                return false;
            }
        } catch (Exception e) {
            log.error("Twilio WhatsApp exception: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Clean and format phone number
     */
    private String cleanPhoneNumber(String phone) {
        if (phone == null) return null;
        
        // Remove all non-digits
        String cleaned = phone.replaceAll("[^0-9]", "");
        
        // Add country code if missing (default India +91)
        if (cleaned.length() == 10) {
            cleaned = "91" + cleaned;
        }
        
        return cleaned;
    }

    /**
     * Check rate limiting
     */
    private boolean isRateLimited(String key) {
        LocalDateTime lastTime = lastNotificationTime.get(key);
        if (lastTime == null) return false;
        
        return LocalDateTime.now().isBefore(lastTime.plusMinutes(MIN_INTERVAL_MINUTES));
    }

    /**
     * Update rate limit timestamp
     */
    private void updateRateLimit(String key) {
        lastNotificationTime.put(key, LocalDateTime.now());
    }

    private boolean isWhatsAppCloudConfigured() {
        return whatsappToken != null && !whatsappToken.isEmpty() 
            && phoneNumberId != null && !phoneNumberId.isEmpty();
    }

    private boolean isTwilioConfigured() {
        return twilioAccountSid != null && !twilioAccountSid.isEmpty()
            && twilioAuthToken != null && !twilioAuthToken.isEmpty();
    }

    /**
     * Inner class for message queue
     */
    private static class WhatsAppMessage {
        String phone;
        String message;
        LocalDateTime timestamp;
    }
}
