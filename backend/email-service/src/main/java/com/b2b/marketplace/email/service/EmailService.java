package com.b2b.marketplace.email.service;

import com.b2b.marketplace.email.dto.EmailRequest;
import com.b2b.marketplace.email.dto.EmailResponse;
import com.b2b.marketplace.email.dto.OrderEmailData;
import com.b2b.marketplace.email.entity.EmailLog;
import com.b2b.marketplace.email.repository.EmailLogRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final EmailLogRepository emailLogRepository;
    
    @Value("${email.from.address}")
    private String fromAddress;
    
    @Value("${email.from.name}")
    private String fromName;
    
    @Async
    public EmailResponse sendEmail(EmailRequest request) {
        EmailLog emailLog = createEmailLog(request);
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromAddress, fromName);
            helper.setTo(request.getTo());
            helper.setSubject(request.getSubject());
            
            String htmlContent = generateEmailContent(request);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            
            emailLog.setStatus("SENT");
            emailLog.setSentAt(LocalDateTime.now());
            emailLogRepository.save(emailLog);
            
            log.info("Email sent successfully to: {}", request.getTo());
            return EmailResponse.success(emailLog.getId());
            
        } catch (Exception e) {
            log.error("Failed to send email to: {}", request.getTo(), e);
            emailLog.setStatus("FAILED");
            emailLog.setErrorMessage(e.getMessage());
            emailLogRepository.save(emailLog);
            
            return EmailResponse.failed(e.getMessage());
        }
    }
    
    public EmailResponse sendRegistrationEmail(String email, String name, String activationLink) {
        EmailRequest request = new EmailRequest();
        request.setTo(email);
        request.setSubject("Welcome to B2B Marketplace - Activate Your Account");
        request.setEmailType("REGISTRATION");
        request.setRecipientName(name);
        
        Map<String, Object> data = Map.of(
            "name", name,
            "activationLink", activationLink,
            "supportEmail", fromAddress
        );
        request.setTemplateData(data);
        
        return sendEmail(request);
    }
    
    public EmailResponse sendOrderConfirmationEmail(OrderEmailData orderData) {
        EmailRequest request = new EmailRequest();
        
        // Validate buyer email - use default if null
        String buyerEmail = orderData.getBuyerEmail();
        if (buyerEmail == null || buyerEmail.trim().isEmpty()) {
            log.warn("Buyer email is null for order {}. Email will not be sent.", orderData.getOrderNumber());
            buyerEmail = "noreply@b2bmarketplace.com"; // Use default to avoid DB constraint violation
        }
        
        request.setTo(buyerEmail);
        request.setSubject("Order Confirmation - Order #" + orderData.getOrderNumber());
        request.setEmailType("ORDER_CONFIRMATION");
        request.setOrderId(orderData.getOrderId());
        request.setRecipientName(orderData.getBuyerName() != null ? orderData.getBuyerName() : "Customer");
        
        // Use HashMap to allow null values
        Map<String, Object> data = new HashMap<>();
        data.put("buyerName", orderData.getBuyerName() != null ? orderData.getBuyerName() : "Customer");
        data.put("orderNumber", orderData.getOrderNumber() != null ? orderData.getOrderNumber() : "N/A");
        data.put("orderDate", orderData.getOrderDate() != null ? orderData.getOrderDate() : LocalDateTime.now().toString());
        data.put("totalAmount", orderData.getTotalAmount() != null ? orderData.getTotalAmount() : BigDecimal.ZERO);
        data.put("currency", orderData.getCurrency() != null ? orderData.getCurrency() : "USD");
        data.put("items", orderData.getItems() != null ? orderData.getItems() : new ArrayList<>());
        data.put("shippingAddress", orderData.getShippingAddress() != null ? orderData.getShippingAddress() : "Not provided");
        data.put("paymentMethod", orderData.getPaymentMethod() != null ? orderData.getPaymentMethod() : "Not specified");
        
        request.setTemplateData(data);
        
        return sendEmail(request);
    }
    
    public EmailResponse sendOrderStatusEmail(OrderEmailData orderData, String previousStatus) {
        EmailRequest request = new EmailRequest();
        
        // Validate buyer email - use default if null
        String buyerEmail = orderData.getBuyerEmail();
        if (buyerEmail == null || buyerEmail.trim().isEmpty()) {
            log.warn("Buyer email is null for order {}. Email will not be sent.", orderData.getOrderNumber());
            buyerEmail = "noreply@b2bmarketplace.com";
        }
        
        request.setTo(buyerEmail);
        request.setSubject("Order Status Update - Order #" + orderData.getOrderNumber());
        request.setEmailType("ORDER_STATUS");
        request.setOrderId(orderData.getOrderId());
        request.setRecipientName(orderData.getBuyerName() != null ? orderData.getBuyerName() : "Customer");
        
        // Use HashMap to allow null values
        Map<String, Object> data = new HashMap<>();
        data.put("buyerName", orderData.getBuyerName() != null ? orderData.getBuyerName() : "Customer");
        data.put("orderNumber", orderData.getOrderNumber() != null ? orderData.getOrderNumber() : "N/A");
        data.put("previousStatus", previousStatus != null ? previousStatus : "Unknown");
        data.put("currentStatus", orderData.getStatus() != null ? orderData.getStatus() : "Unknown");
        data.put("orderDate", orderData.getOrderDate() != null ? orderData.getOrderDate() : LocalDateTime.now().toString());
        data.put("totalAmount", orderData.getTotalAmount() != null ? orderData.getTotalAmount() : BigDecimal.ZERO);
        
        request.setTemplateData(data);
        
        return sendEmail(request);
    }
    
    public EmailResponse sendPasswordResetEmail(String email, String name, String resetLink) {
        EmailRequest request = new EmailRequest();
        request.setTo(email);
        request.setSubject("Password Reset Request - B2B Marketplace");
        request.setEmailType("PASSWORD_RESET");
        request.setRecipientName(name);
        
        Map<String, Object> data = Map.of(
            "name", name,
            "resetLink", resetLink,
            "expiryTime", "24 hours"
        );
        request.setTemplateData(data);
        
        return sendEmail(request);
    }
    
    public EmailResponse sendSupplierOrderNotification(OrderEmailData orderData) {
        EmailRequest request = new EmailRequest();
        
        // Validate supplier email - use buyerEmail as fallback for testing
        String supplierEmail = orderData.getSupplierEmail();
        if (supplierEmail == null || supplierEmail.trim().isEmpty()) {
            supplierEmail = orderData.getBuyerEmail();
            if (supplierEmail == null || supplierEmail.trim().isEmpty()) {
                log.warn("Supplier email is null for order {}. Email will not be sent.", orderData.getOrderNumber());
                supplierEmail = "noreply@b2bmarketplace.com";
            }
        }
        
        request.setTo(supplierEmail);
        request.setSubject("New Order Received - Order #" + orderData.getOrderNumber());
        request.setEmailType("SUPPLIER_ORDER_NOTIFICATION");
        request.setOrderId(orderData.getOrderId());
        request.setRecipientName(orderData.getSupplierName() != null ? orderData.getSupplierName() : "Supplier");
        
        // Use HashMap to allow null values
        Map<String, Object> data = new HashMap<>();
        data.put("supplierName", orderData.getSupplierName() != null ? orderData.getSupplierName() : "Supplier");
        data.put("orderNumber", orderData.getOrderNumber() != null ? orderData.getOrderNumber() : "N/A");
        data.put("buyerName", orderData.getBuyerName() != null ? orderData.getBuyerName() : "Customer");
        data.put("orderDate", orderData.getOrderDate() != null ? orderData.getOrderDate() : LocalDateTime.now().toString());
        data.put("totalAmount", orderData.getTotalAmount() != null ? orderData.getTotalAmount() : BigDecimal.ZERO);
        data.put("items", orderData.getItems() != null ? orderData.getItems() : new ArrayList<>());
        
        request.setTemplateData(data);
        
        return sendEmail(request);
    }
    
    private String generateEmailContent(EmailRequest request) {
        Context context = new Context();
        if (request.getTemplateData() != null) {
            request.getTemplateData().forEach(context::setVariable);
        }
        
        String templateName = getTemplateName(request.getEmailType());
        return templateEngine.process(templateName, context);
    }
    
    private String getTemplateName(String emailType) {
        return switch (emailType) {
            case "REGISTRATION" -> "registration";
            case "ORDER_CONFIRMATION" -> "order-confirmation";
            case "ORDER_STATUS" -> "order-status";
            case "PASSWORD_RESET" -> "password-reset";
            case "SUPPLIER_ORDER_NOTIFICATION" -> "supplier-order-notification";
            default -> "generic";
        };
    }
    
    private EmailLog createEmailLog(EmailRequest request) {
        EmailLog log = new EmailLog();
        log.setRecipient(request.getTo());
        log.setSubject(request.getSubject());
        log.setEmailType(request.getEmailType());
        log.setStatus("PENDING");
        log.setOrderId(request.getOrderId());
        log.setUserId(request.getUserId());
        return emailLogRepository.save(log);
    }
}
