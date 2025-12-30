package com.b2b.marketplace.order.controller;

import com.b2b.marketplace.order.dto.*;
import com.b2b.marketplace.order.service.DisputeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Dispute/Ticket Controller - REST API for order disputes
 * 
 * Compliant with Indian E-Commerce Laws:
 * - Consumer Protection Act 2019
 * - Consumer Protection (E-Commerce) Rules 2020
 * 
 * Endpoints:
 * - Buyer: Create, view, escalate, accept resolution
 * - Supplier: Acknowledge, respond, propose resolution
 * - Common: Add messages, view details
 */
@RestController
@RequestMapping("/disputes")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class DisputeController {
    
    private final DisputeService disputeService;
    
    // ==================== BUYER ENDPOINTS ====================
    
    /**
     * Create a new dispute/ticket (Buyer action)
     */
    @PostMapping
    public ResponseEntity<?> createDispute(@RequestBody CreateDisputeRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long userId = Long.parseLong(auth.getName());
            request.setBuyerId(userId);
            
            DisputeResponse response = disputeService.createDispute(request);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Dispute ticket created: " + response.getTicketNumber(),
                "data", response
            ));
        } catch (Exception e) {
            log.error("Failed to create dispute", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Get dispute by ticket number
     */
    @GetMapping("/{ticketNumber}")
    public ResponseEntity<?> getDispute(@PathVariable String ticketNumber) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long userId = Long.parseLong(auth.getName());
            
            DisputeResponse response = disputeService.getByTicketNumber(ticketNumber, false);
            
            // Check authorization
            boolean isAuthorized = response.getBuyerId().equals(userId) || 
                                   response.getSupplierId().equals(userId);
            if (!isAuthorized) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Not authorized to view this dispute"
                ));
            }
            
            // Include internal messages if supplier
            boolean includeInternal = response.getSupplierId().equals(userId);
            if (includeInternal) {
                response = disputeService.getByTicketNumber(ticketNumber, true);
            }
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", response
            ));
        } catch (Exception e) {
            log.error("Failed to get dispute", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Get all disputes for buyer
     */
    @GetMapping("/buyer")
    public ResponseEntity<?> getBuyerDisputes(@RequestParam(required = false) String status) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long buyerId = Long.parseLong(auth.getName());
            
            List<DisputeResponse> disputes = disputeService.getBuyerDisputes(buyerId, status);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", disputes
            ));
        } catch (Exception e) {
            log.error("Failed to get buyer disputes", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Escalate dispute (Buyer action)
     */
    @PostMapping("/{ticketNumber}/escalate")
    public ResponseEntity<?> escalateDispute(
            @PathVariable String ticketNumber,
            @RequestBody Map<String, String> request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long buyerId = Long.parseLong(auth.getName());
            
            String reason = request.get("reason");
            DisputeResponse response = disputeService.escalateDispute(ticketNumber, buyerId, reason);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Dispute escalated to " + response.getEscalationLevelLabel(),
                "data", response
            ));
        } catch (Exception e) {
            log.error("Failed to escalate dispute", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Accept proposed resolution (Buyer action)
     */
    @PostMapping("/{ticketNumber}/accept-resolution")
    public ResponseEntity<?> acceptResolution(
            @PathVariable String ticketNumber,
            @RequestBody(required = false) Map<String, Object> request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long buyerId = Long.parseLong(auth.getName());
            
            Integer rating = request != null && request.get("rating") != null ? 
                    ((Number) request.get("rating")).intValue() : null;
            String feedback = request != null ? (String) request.get("feedback") : null;
            
            DisputeResponse response = disputeService.acceptResolution(ticketNumber, buyerId, rating, feedback);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Resolution accepted. Dispute resolved.",
                "data", response
            ));
        } catch (Exception e) {
            log.error("Failed to accept resolution", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    // ==================== SUPPLIER ENDPOINTS ====================
    
    /**
     * Get all disputes for supplier
     */
    @GetMapping("/supplier")
    public ResponseEntity<?> getSupplierDisputes(@RequestParam(required = false) String status) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long supplierId = Long.parseLong(auth.getName());
            
            List<DisputeResponse> disputes = disputeService.getSupplierDisputes(supplierId, status);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", disputes
            ));
        } catch (Exception e) {
            log.error("Failed to get supplier disputes", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Get supplier dispute statistics
     */
    @GetMapping("/supplier/stats")
    public ResponseEntity<?> getSupplierStats() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long supplierId = Long.parseLong(auth.getName());
            
            Map<String, Object> stats = disputeService.getSupplierStats(supplierId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", stats
            ));
        } catch (Exception e) {
            log.error("Failed to get supplier stats", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Acknowledge dispute (Supplier action) - Must be done within 48 hours
     */
    @PostMapping("/{ticketNumber}/acknowledge")
    public ResponseEntity<?> acknowledgeDispute(
            @PathVariable String ticketNumber,
            @RequestBody(required = false) Map<String, String> request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long supplierId = Long.parseLong(auth.getName());
            
            String message = request != null ? request.get("message") : null;
            DisputeResponse response = disputeService.acknowledgeDispute(ticketNumber, supplierId, message);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Dispute acknowledged",
                "data", response
            ));
        } catch (Exception e) {
            log.error("Failed to acknowledge dispute", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Respond to dispute with optional resolution proposal (Supplier action)
     */
    @PostMapping("/{ticketNumber}/respond")
    public ResponseEntity<?> supplierRespond(
            @PathVariable String ticketNumber,
            @RequestBody Map<String, Object> request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long supplierId = Long.parseLong(auth.getName());
            
            String message = (String) request.get("message");
            String proposedResolution = (String) request.get("proposedResolution");
            BigDecimal proposedRefundAmount = request.get("proposedRefundAmount") != null ?
                    new BigDecimal(request.get("proposedRefundAmount").toString()) : null;
            
            DisputeResponse response = disputeService.supplierRespond(
                    ticketNumber, supplierId, message, proposedResolution, proposedRefundAmount);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", proposedResolution != null ? "Resolution proposed" : "Response sent",
                "data", response
            ));
        } catch (Exception e) {
            log.error("Failed to respond to dispute", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    // ==================== COMMON ENDPOINTS ====================
    
    /**
     * Add message to dispute thread
     */
    @PostMapping("/{ticketNumber}/messages")
    public ResponseEntity<?> addMessage(
            @PathVariable String ticketNumber,
            @RequestBody Map<String, Object> request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long senderId = Long.parseLong(auth.getName());
            
            String senderName = (String) request.get("senderName");
            String senderType = (String) request.get("senderType");
            String message = (String) request.get("message");
            @SuppressWarnings("unchecked")
            List<String> attachments = (List<String>) request.get("attachments");
            Boolean isInternal = (Boolean) request.get("isInternal");
            
            DisputeResponse response = disputeService.addMessage(
                    ticketNumber, senderId, senderName, senderType, message, attachments, isInternal);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Message sent",
                "data", response
            ));
        } catch (Exception e) {
            log.error("Failed to add message", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Close dispute
     */
    @PostMapping("/{ticketNumber}/close")
    public ResponseEntity<?> closeDispute(
            @PathVariable String ticketNumber,
            @RequestBody(required = false) Map<String, String> request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long userId = Long.parseLong(auth.getName());
            
            String reason = request != null ? request.get("reason") : null;
            DisputeResponse response = disputeService.closeDispute(ticketNumber, userId, reason);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Dispute closed",
                "data", response
            ));
        } catch (Exception e) {
            log.error("Failed to close dispute", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Get disputes for a specific order
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getOrderDisputes(@PathVariable Long orderId) {
        try {
            // This would need order validation - simplified for now
            List<DisputeResponse> disputes = disputeService.getBuyerDisputes(orderId, null);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", disputes
            ));
        } catch (Exception e) {
            log.error("Failed to get order disputes", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}
