package com.b2b.marketplace.order.controller;

import com.b2b.marketplace.order.dto.*;
import com.b2b.marketplace.order.service.QuoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Quote (RFQ) management.
 * Supports the complete quote lifecycle: create → respond → negotiate → approve → convert to order
 */
@RestController
@RequestMapping("/api/quotes")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class QuoteController {

    @Autowired
    private QuoteService quoteService;

    // ==================== Buyer Endpoints ====================

    /**
     * Create a new quote request (buyer action)
     */
    @PostMapping
    public ResponseEntity<?> createQuote(@RequestBody CreateQuoteRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                try {
                    Long userId = Long.parseLong(auth.getName());
                    request.setBuyerId(userId);
                } catch (NumberFormatException e) {
                    // Keep the buyerId from request
                }
            }

            QuoteResponse response = quoteService.createQuote(request);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Quote request submitted successfully",
                "data", response
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Get all quotes for the authenticated buyer
     */
    @GetMapping("/buyer")
    public ResponseEntity<?> getBuyerQuotes(
            @RequestParam(required = false) String status) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long buyerId = Long.parseLong(auth.getName());

            List<QuoteResponse> quotes = quoteService.getBuyerQuotes(buyerId, status);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", quotes
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Get all quotes for a specific buyer (admin/support use)
     */
    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<?> getBuyerQuotesById(
            @PathVariable Long buyerId,
            @RequestParam(required = false) String status) {
        try {
            List<QuoteResponse> quotes = quoteService.getBuyerQuotes(buyerId, status);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", quotes
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Buyer sends counter-offer
     */
    @PostMapping("/{quoteNumber}/counter-offer")
    public ResponseEntity<?> counterOffer(
            @PathVariable String quoteNumber,
            @RequestBody Map<String, String> request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long buyerId = Long.parseLong(auth.getName());

            QuoteResponse response = quoteService.counterOffer(
                    quoteNumber, 
                    request.get("message"), 
                    buyerId
            );
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Counter-offer sent",
                "data", response
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Buyer cancels quote
     */
    @PostMapping("/{quoteNumber}/cancel")
    public ResponseEntity<?> cancelQuote(@PathVariable String quoteNumber) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long buyerId = Long.parseLong(auth.getName());

            QuoteResponse response = quoteService.cancelQuote(quoteNumber, buyerId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Quote cancelled",
                "data", response
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Convert approved quote to order (buyer action)
     */
    @PostMapping("/{quoteNumber}/convert")
    public ResponseEntity<?> convertToOrder(
            @PathVariable String quoteNumber,
            @RequestBody(required = false) Map<String, Object> request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long buyerId = Long.parseLong(auth.getName());

            String paymentType = request != null && request.get("paymentType") != null 
                ? request.get("paymentType").toString() : "BANK_TRANSFER";
            String shippingAddress = request != null && request.get("shippingAddress") != null 
                ? request.get("shippingAddress").toString() : null;
            String notes = request != null && request.get("notes") != null 
                ? request.get("notes").toString() : null;
            
            QuoteResponse response = quoteService.convertToOrder(quoteNumber, buyerId, paymentType, shippingAddress, notes);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Quote converted to order: " + response.getOrderNumber(),
                "data", response
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // ==================== Supplier Endpoints ====================

    /**
     * Get all quotes for the authenticated supplier
     */
    @GetMapping("/supplier")
    public ResponseEntity<?> getSupplierQuotes(
            @RequestParam(required = false) String status) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long supplierId = Long.parseLong(auth.getName());

            List<QuoteResponse> quotes = quoteService.getSupplierQuotes(supplierId, status);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", quotes
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Get all quotes for a specific supplier
     */
    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<?> getSupplierQuotesById(
            @PathVariable Long supplierId,
            @RequestParam(required = false) String status) {
        try {
            List<QuoteResponse> quotes = quoteService.getSupplierQuotes(supplierId, status);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", quotes
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Get supplier quote statistics
     */
    @GetMapping("/supplier/{supplierId}/stats")
    public ResponseEntity<?> getSupplierQuoteStats(@PathVariable Long supplierId) {
        try {
            Map<String, Object> stats = quoteService.getSupplierQuoteStats(supplierId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", stats
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Supplier responds to quote with pricing
     */
    @PostMapping("/{quoteNumber}/respond")
    public ResponseEntity<?> respondToQuote(
            @PathVariable String quoteNumber,
            @RequestBody SupplierQuoteResponse request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long supplierId = Long.parseLong(auth.getName());

            QuoteResponse response = quoteService.respondToQuote(quoteNumber, request, supplierId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Quote response sent",
                "data", response
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Supplier approves quote with final pricing
     */
    @PostMapping("/{quoteNumber}/approve")
    public ResponseEntity<?> approveQuote(
            @PathVariable String quoteNumber,
            @RequestBody ApproveQuoteRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long supplierId = Long.parseLong(auth.getName());

            QuoteResponse response = quoteService.approveQuote(quoteNumber, request, supplierId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Quote approved and ready for order",
                "data", response
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Supplier rejects quote
     */
    @PostMapping("/{quoteNumber}/reject")
    public ResponseEntity<?> rejectQuote(
            @PathVariable String quoteNumber,
            @RequestBody Map<String, String> request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long supplierId = Long.parseLong(auth.getName());

            QuoteResponse response = quoteService.rejectQuote(
                    quoteNumber, 
                    request.get("reason"), 
                    supplierId
            );
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Quote rejected",
                "data", response
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Supplier extends quote validity
     */
    @PostMapping("/{quoteNumber}/extend")
    public ResponseEntity<?> extendValidity(
            @PathVariable String quoteNumber,
            @RequestBody Map<String, Integer> request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Long supplierId = Long.parseLong(auth.getName());

            Integer additionalDays = request.get("additionalDays");
            if (additionalDays == null || additionalDays <= 0) {
                additionalDays = 7; // Default 7 days extension
            }

            QuoteResponse response = quoteService.extendValidity(quoteNumber, additionalDays, supplierId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Quote validity extended by " + additionalDays + " days",
                "data", response
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // ==================== Common Endpoints ====================

    /**
     * Get quote by quote number
     */
    @GetMapping("/{quoteNumber}")
    public ResponseEntity<?> getQuote(@PathVariable String quoteNumber) {
        try {
            QuoteResponse response = quoteService.getQuoteByNumber(quoteNumber);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", response
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Add message to quote negotiation thread
     */
    @PostMapping("/{quoteNumber}/messages")
    public ResponseEntity<?> addMessage(
            @PathVariable String quoteNumber,
            @RequestBody QuoteMessageRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                request.setSenderId(Long.parseLong(auth.getName()));
            }

            QuoteResponse response = quoteService.addMessage(quoteNumber, request);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Message sent",
                "data", response
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}
