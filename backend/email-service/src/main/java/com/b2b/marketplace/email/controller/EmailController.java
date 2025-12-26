package com.b2b.marketplace.email.controller;

import com.b2b.marketplace.email.dto.EmailRequest;
import com.b2b.marketplace.email.dto.EmailResponse;
import com.b2b.marketplace.email.dto.OrderEmailData;
import com.b2b.marketplace.email.entity.EmailLog;
import com.b2b.marketplace.email.repository.EmailLogRepository;
import com.b2b.marketplace.email.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class EmailController {
    
    private final EmailService emailService;
    private final EmailLogRepository emailLogRepository;
    
    @PostMapping("/send")
    public ResponseEntity<EmailResponse> sendEmail(@Valid @RequestBody EmailRequest request) {
        EmailResponse response = emailService.sendEmail(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/registration")
    public ResponseEntity<EmailResponse> sendRegistrationEmail(
            @RequestParam String email,
            @RequestParam String name,
            @RequestParam String activationLink) {
        EmailResponse response = emailService.sendRegistrationEmail(email, name, activationLink);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/order/confirmation")
    public ResponseEntity<EmailResponse> sendOrderConfirmation(@RequestBody OrderEmailData orderData) {
        EmailResponse response = emailService.sendOrderConfirmationEmail(orderData);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/order/status")
    public ResponseEntity<EmailResponse> sendOrderStatus(
            @RequestBody OrderEmailData orderData,
            @RequestParam String previousStatus) {
        EmailResponse response = emailService.sendOrderStatusEmail(orderData, previousStatus);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/password-reset")
    public ResponseEntity<EmailResponse> sendPasswordReset(
            @RequestParam String email,
            @RequestParam String name,
            @RequestParam String resetLink) {
        EmailResponse response = emailService.sendPasswordResetEmail(email, name, resetLink);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/supplier/order-notification")
    public ResponseEntity<EmailResponse> sendSupplierOrderNotification(@RequestBody OrderEmailData orderData) {
        EmailResponse response = emailService.sendSupplierOrderNotification(orderData);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/logs")
    public ResponseEntity<List<EmailLog>> getEmailLogs(@RequestParam(required = false) String status) {
        if (status != null) {
            return ResponseEntity.ok(emailLogRepository.findByStatus(status));
        }
        return ResponseEntity.ok(emailLogRepository.findAll());
    }
    
    @GetMapping("/logs/{id}")
    public ResponseEntity<EmailLog> getEmailLog(@PathVariable Long id) {
        return emailLogRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/logs/user/{userId}")
    public ResponseEntity<List<EmailLog>> getUserEmailLogs(@PathVariable Long userId) {
        return ResponseEntity.ok(emailLogRepository.findByUserId(userId));
    }
    
    @GetMapping("/logs/order/{orderId}")
    public ResponseEntity<List<EmailLog>> getOrderEmailLogs(@PathVariable Long orderId) {
        return ResponseEntity.ok(emailLogRepository.findByOrderId(orderId));
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getEmailStats() {
        Map<String, Long> stats = Map.of(
            "totalSent", emailLogRepository.countByStatus("SENT"),
            "totalFailed", emailLogRepository.countByStatus("FAILED"),
            "totalPending", emailLogRepository.countByStatus("PENDING")
        );
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "Email Service",
            "port", "8087"
        ));
    }
}
