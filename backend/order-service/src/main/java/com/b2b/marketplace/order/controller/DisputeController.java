package com.b2b.marketplace.order.controller;

import com.b2b.marketplace.order.dto.*;
import com.b2b.marketplace.order.entity.Supplier;
import com.b2b.marketplace.order.repository.SupplierRepository;
import com.b2b.marketplace.order.service.DisputeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
@RequestMapping("/api/disputes")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class
DisputeController {
    
    private static final Logger log = LoggerFactory.getLogger(DisputeController.class);
    
    private final DisputeService disputeService;
    private final SupplierRepository supplierRepository;
    
    public DisputeController(DisputeService disputeService, SupplierRepository supplierRepository) {
        this.disputeService = disputeService;
        this.supplierRepository = supplierRepository;
    }
    
    /**
     * Helper method to get supplier ID from user ID
     */
    private Long getSupplierIdFromUserId(Long userId) {
        return supplierRepository.findByUserId(userId)
                .map(Supplier::getId)
                .orElse(userId); // Fallback to userId if no supplier record found
    }
    
    // ==================== BUYER ENDPOINTS ====================
    
    /**
     * Create a new dispute/ticket (Buyer action)
     */
    @PostMapping
    public ResponseEntity<?> createDispute(@RequestBody CreateDisputeRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long userId = Long.parseLong(auth.getName());
            
            // Set buyer ID from authenticated user
            request.setBuyerId(userId);
            
            // Set default buyer name if not provided
            if (request.getBuyerName() == null || request.getBuyerName().isEmpty()) {
                request.setBuyerName("User " + userId);
            }
            
            log.info("Creating dispute for user: {}, order: {}", userId, request.getOrderNumber());
            
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
            Long supplierId = getSupplierIdFromUserId(userId);
            
            DisputeResponse response = disputeService.getByTicketNumber(ticketNumber, false);
            
            // Check authorization - compare with both buyer ID and supplier ID
            boolean isBuyer = response.getBuyerId().equals(userId);
            boolean isSupplier = response.getSupplierId().equals(supplierId);
            if (!isBuyer && !isSupplier) {
                log.warn("User {} (supplier {}) not authorized for dispute {} (buyer: {}, supplier: {})", 
                    userId, supplierId, ticketNumber, response.getBuyerId(), response.getSupplierId());
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Not authorized to view this dispute"
                ));
            }
            
            // Include internal messages if supplier
            if (isSupplier) {
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
            Long userId = Long.parseLong(auth.getName());
            Long supplierId = getSupplierIdFromUserId(userId);
            log.info("Fetching disputes for user {} -> supplier {}", userId, supplierId);
            
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
            Long userId = Long.parseLong(auth.getName());
            Long supplierId = getSupplierIdFromUserId(userId);
            
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
            Long userId = Long.parseLong(auth.getName());
            Long supplierId = getSupplierIdFromUserId(userId);
            
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
            Long userId = Long.parseLong(auth.getName());
            Long supplierId = getSupplierIdFromUserId(userId);
            
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

    // ==================== REFUND FLOW ENDPOINTS ====================

    /**
     * Save buyer bank details for refund (Buyer action)
     * POST /api/disputes/{ticketNumber}/bank-details
     */
    @PostMapping("/{ticketNumber}/bank-details")
    public ResponseEntity<?> saveBuyerBankDetails(
            @PathVariable String ticketNumber,
            @RequestBody BuyerBankDetailsDTO bankDetails) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long buyerId = Long.parseLong(auth.getName());

            DisputeResponse response = disputeService.saveBuyerBankDetails(ticketNumber, buyerId, bankDetails);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Bank details saved successfully",
                "data", response
            ));
        } catch (Exception e) {
            log.error("Failed to save bank details", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Get buyer bank details for a dispute (Supplier action - to know where to send refund)
     * GET /api/disputes/{ticketNumber}/bank-details
     */
    @GetMapping("/{ticketNumber}/bank-details")
    public ResponseEntity<?> getBuyerBankDetails(@PathVariable String ticketNumber) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long userId = Long.parseLong(auth.getName());
            Long supplierId = getSupplierIdFromUserId(userId);

            BuyerBankDetailsDTO bankDetails = disputeService.getBuyerBankDetailsForDispute(ticketNumber, supplierId);
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("success", true);
            response.put("data", bankDetails);
            if (bankDetails == null) {
                response.put("message", "Buyer has not submitted bank details yet");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to get bank details", e);
            Map<String, Object> errorResponse = new java.util.HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Upload refund payment proof
     * POST /api/disputes/upload/refund-proof
     */
    @PostMapping("/upload/refund-proof")
    public ResponseEntity<?> uploadRefundProof(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Please select a file to upload"
                ));
            }

            // Validate file type (images only)
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Only image files are allowed"
                ));
            }

            // Create upload directory if it doesn't exist
            String paymentProofsDir = "uploads/refund-proofs";
            java.nio.file.Path uploadPath = java.nio.file.Paths.get(paymentProofsDir);
            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = System.currentTimeMillis() + extension;
            
            // Save file
            java.nio.file.Path filePath = uploadPath.resolve(filename);
            java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            // Return the URL
            String fileUrl = "/uploads/refund-proofs/" + filename;
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "File uploaded successfully",
                "url", fileUrl,
                "filename", filename
            ));

        } catch (Exception e) {
            log.error("Failed to upload refund proof", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to upload file: " + e.getMessage()
            ));
        }
    }

    /**
     * Submit refund transaction details (Supplier action)
     * POST /api/disputes/{ticketNumber}/refund-transaction
     */
    @PostMapping("/{ticketNumber}/refund-transaction")
    public ResponseEntity<?> submitRefundTransaction(
            @PathVariable String ticketNumber,
            @RequestBody RefundTransactionDTO transactionData) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long userId = Long.parseLong(auth.getName());
            Long supplierId = getSupplierIdFromUserId(userId);

            DisputeResponse response = disputeService.submitRefundTransaction(ticketNumber, supplierId, transactionData);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Refund transaction details submitted. Awaiting buyer confirmation.",
                "data", response
            ));
        } catch (Exception e) {
            log.error("Failed to submit refund transaction", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Confirm refund received (Buyer action)
     * POST /api/disputes/{ticketNumber}/confirm-refund
     */
    @PostMapping("/{ticketNumber}/confirm-refund")
    public ResponseEntity<?> confirmRefundReceived(
            @PathVariable String ticketNumber,
            @RequestBody(required = false) Map<String, String> request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long buyerId = Long.parseLong(auth.getName());

            String notes = request != null ? request.get("notes") : null;
            DisputeResponse response = disputeService.confirmRefundReceived(ticketNumber, buyerId, notes);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Refund receipt confirmed. Dispute resolved.",
                "data", response
            ));
        } catch (Exception e) {
            log.error("Failed to confirm refund", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}
