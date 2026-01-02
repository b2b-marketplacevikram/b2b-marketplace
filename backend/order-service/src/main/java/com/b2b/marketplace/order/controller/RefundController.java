package com.b2b.marketplace.order.controller;

import com.b2b.marketplace.order.dto.BuyerBankDetailsDTO;
import com.b2b.marketplace.order.dto.RefundRequestDTO;
import com.b2b.marketplace.order.entity.BuyerBankDetails;
import com.b2b.marketplace.order.entity.Order;
import com.b2b.marketplace.order.entity.RefundRequest;
import com.b2b.marketplace.order.entity.RefundRequest.RefundMethod;
import com.b2b.marketplace.order.entity.RefundRequest.RefundStatus;
import com.b2b.marketplace.order.repository.BuyerBankDetailsRepository;
import com.b2b.marketplace.order.repository.OrderRepository;
import com.b2b.marketplace.order.repository.RefundRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/refunds")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class RefundController {

    @Autowired
    private RefundRequestRepository refundRequestRepository;

    @Autowired
    private BuyerBankDetailsRepository buyerBankDetailsRepository;

    @Autowired
    private OrderRepository orderRepository;

    /**
     * Supplier initiates a refund request
     */
    @PostMapping("/initiate")
    public ResponseEntity<?> initiateRefund(@RequestBody RefundRequestDTO dto) {
        try {
            // Find the order
            Order order = orderRepository.findByOrderNumber(dto.getOrderNumber())
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            // Check if refund already exists
            if (refundRequestRepository.existsByOrderIdAndStatusIn(order.getId(), 
                    Arrays.asList(RefundStatus.PENDING, RefundStatus.BUYER_CONFIRMED, RefundStatus.PROCESSING))) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "A refund request already exists for this order"
                ));
            }

            // Create refund request
            RefundRequest refund = new RefundRequest();
            refund.setOrderId(order.getId());
            refund.setOrderNumber(order.getOrderNumber());
            refund.setBuyerId(order.getBuyerId());
            refund.setSupplierId(order.getSupplierId());
            refund.setRefundAmount(dto.getRefundAmount() != null ? dto.getRefundAmount() : order.getTotalAmount());
            refund.setRefundMethod(RefundMethod.valueOf(dto.getRefundMethod()));
            refund.setReason(dto.getReason());
            refund.setSupplierNotes(dto.getSupplierNotes());
            refund.setStatus(RefundStatus.PENDING);

            // Get current user ID
            try {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                refund.setInitiatedBy(Long.parseLong(auth.getName()));
            } catch (Exception e) {
                // Ignore if no auth
            }

            refundRequestRepository.save(refund);

            // Update order status to REFUND_PENDING
            order.setStatus(Order.OrderStatus.CANCELLED);
            order.setPaymentStatus(Order.PaymentStatus.REFUND_PENDING);
            orderRepository.save(order);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Refund request initiated. Waiting for buyer confirmation.",
                    "refundId", refund.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Buyer confirms the refund
     */
    @PostMapping("/{refundId}/confirm")
    public ResponseEntity<?> confirmRefund(
            @PathVariable Long refundId,
            @RequestBody(required = false) Map<String, Object> body) {
        try {
            RefundRequest refund = refundRequestRepository.findById(refundId)
                    .orElseThrow(() -> new RuntimeException("Refund request not found"));

            if (refund.getStatus() != RefundStatus.PENDING) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Refund request is not in pending status"
                ));
            }

            // If refund method is BANK_TRANSFER, buyer must provide bank details
            if (refund.getRefundMethod() == RefundMethod.BANK_TRANSFER) {
                Long bankDetailsId = body != null ? 
                        Long.valueOf(body.get("bankDetailsId").toString()) : null;
                if (bankDetailsId == null) {
                    return ResponseEntity.badRequest().body(Map.of(
                            "success", false,
                            "message", "Please select bank details for refund"
                    ));
                }
                refund.setBuyerBankDetailsId(bankDetailsId);
            }

            if (body != null && body.get("buyerNotes") != null) {
                refund.setBuyerNotes(body.get("buyerNotes").toString());
            }

            refund.setStatus(RefundStatus.BUYER_CONFIRMED);
            refund.setConfirmedAt(LocalDateTime.now());
            refundRequestRepository.save(refund);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Refund confirmed. Supplier will process the refund."
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Buyer rejects the refund method and requests different method
     */
    @PostMapping("/{refundId}/reject")
    public ResponseEntity<?> rejectRefund(
            @PathVariable Long refundId,
            @RequestBody Map<String, String> body) {
        try {
            RefundRequest refund = refundRequestRepository.findById(refundId)
                    .orElseThrow(() -> new RuntimeException("Refund request not found"));

            refund.setStatus(RefundStatus.REJECTED);
            refund.setBuyerNotes(body.get("reason"));
            refundRequestRepository.save(refund);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Refund request rejected. Supplier will be notified."
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Supplier marks refund as completed
     */
    @PostMapping("/{refundId}/complete")
    public ResponseEntity<?> completeRefund(@PathVariable Long refundId) {
        try {
            RefundRequest refund = refundRequestRepository.findById(refundId)
                    .orElseThrow(() -> new RuntimeException("Refund request not found"));

            if (refund.getStatus() != RefundStatus.BUYER_CONFIRMED && 
                refund.getStatus() != RefundStatus.PROCESSING) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Refund must be confirmed by buyer first"
                ));
            }

            refund.setStatus(RefundStatus.COMPLETED);
            refund.setCompletedAt(LocalDateTime.now());
            refundRequestRepository.save(refund);

            // Update order payment status
            Order order = orderRepository.findById(refund.getOrderId()).orElse(null);
            if (order != null) {
                order.setPaymentStatus(Order.PaymentStatus.REFUNDED);
                order.setRefundedAt(LocalDateTime.now());
                order.setRefundReason(refund.getReason());
                order.setRefundAmount(refund.getRefundAmount());
                orderRepository.save(order);
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Refund completed successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Get refund requests for a buyer
     */
    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<?> getBuyerRefunds(@PathVariable Long buyerId) {
        try {
            List<RefundRequest> refunds = refundRequestRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId);
            return ResponseEntity.ok(refunds);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get pending refunds for buyer (needs confirmation)
     */
    @GetMapping("/buyer/{buyerId}/pending")
    public ResponseEntity<?> getBuyerPendingRefunds(@PathVariable Long buyerId) {
        try {
            List<RefundRequest> refunds = refundRequestRepository
                    .findByBuyerIdAndStatusOrderByCreatedAtDesc(buyerId, RefundStatus.PENDING);
            return ResponseEntity.ok(refunds);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get refund requests for a supplier
     */
    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<?> getSupplierRefunds(@PathVariable Long supplierId) {
        try {
            List<RefundRequest> refunds = refundRequestRepository.findBySupplierIdOrderByCreatedAtDesc(supplierId);
            return ResponseEntity.ok(refunds);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get refund by ID
     */
    @GetMapping("/{refundId}")
    public ResponseEntity<?> getRefund(@PathVariable Long refundId) {
        try {
            RefundRequest refund = refundRequestRepository.findById(refundId)
                    .orElseThrow(() -> new RuntimeException("Refund not found"));
            
            Map<String, Object> response = new HashMap<>();
            response.put("refund", refund);
            
            // If BANK_TRANSFER, include buyer bank details
            if (refund.getRefundMethod() == RefundMethod.BANK_TRANSFER && 
                refund.getBuyerBankDetailsId() != null) {
                BuyerBankDetails bankDetails = buyerBankDetailsRepository
                        .findById(refund.getBuyerBankDetailsId()).orElse(null);
                response.put("buyerBankDetails", bankDetails);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== Buyer Bank Details APIs ====================

    /**
     * Get buyer's bank details
     */
    @GetMapping("/bank-details/buyer/{buyerId}")
    public ResponseEntity<?> getBuyerBankDetails(@PathVariable Long buyerId) {
        try {
            List<BuyerBankDetails> details = buyerBankDetailsRepository.findByBuyerId(buyerId);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Add buyer bank details
     */
    @PostMapping("/bank-details/buyer/{buyerId}")
    public ResponseEntity<?> addBuyerBankDetails(
            @PathVariable Long buyerId,
            @RequestBody BuyerBankDetailsDTO dto) {
        try {
            // If this is first bank details, make it primary
            boolean hasBankDetails = buyerBankDetailsRepository.existsByBuyerId(buyerId);

            BuyerBankDetails details = new BuyerBankDetails();
            details.setBuyerId(buyerId);
            details.setBankName(dto.getBankName());
            details.setAccountHolderName(dto.getAccountHolderName());
            details.setAccountNumber(dto.getAccountNumber());
            details.setIfscCode(dto.getIfscCode());
            details.setUpiId(dto.getUpiId());
            details.setSwiftCode(dto.getSwiftCode());
            details.setBranchName(dto.getBranchName());
            details.setIsPrimary(!hasBankDetails || Boolean.TRUE.equals(dto.getIsPrimary()));

            // If setting as primary, unset other primaries
            if (details.getIsPrimary()) {
                buyerBankDetailsRepository.findByBuyerId(buyerId).forEach(bd -> {
                    if (bd.getIsPrimary()) {
                        bd.setIsPrimary(false);
                        buyerBankDetailsRepository.save(bd);
                    }
                });
            }

            buyerBankDetailsRepository.save(details);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Bank details added successfully",
                    "data", details
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Update buyer bank details
     */
    @PutMapping("/bank-details/{id}")
    public ResponseEntity<?> updateBuyerBankDetails(
            @PathVariable Long id,
            @RequestBody BuyerBankDetailsDTO dto) {
        try {
            BuyerBankDetails details = buyerBankDetailsRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Bank details not found"));

            if (dto.getBankName() != null) details.setBankName(dto.getBankName());
            if (dto.getAccountHolderName() != null) details.setAccountHolderName(dto.getAccountHolderName());
            if (dto.getAccountNumber() != null) details.setAccountNumber(dto.getAccountNumber());
            if (dto.getIfscCode() != null) details.setIfscCode(dto.getIfscCode());
            if (dto.getUpiId() != null) details.setUpiId(dto.getUpiId());
            if (dto.getSwiftCode() != null) details.setSwiftCode(dto.getSwiftCode());
            if (dto.getBranchName() != null) details.setBranchName(dto.getBranchName());

            buyerBankDetailsRepository.save(details);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Bank details updated",
                    "data", details
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Delete buyer bank details
     */
    @DeleteMapping("/bank-details/{id}")
    public ResponseEntity<?> deleteBuyerBankDetails(@PathVariable Long id) {
        try {
            buyerBankDetailsRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Bank details deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
