package com.b2b.marketplace.order.controller;

import com.b2b.marketplace.order.dto.CreateOrderRequest;
import com.b2b.marketplace.order.dto.OrderResponse;
import com.b2b.marketplace.order.dto.UpdateOrderStatusRequest;
import com.b2b.marketplace.order.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request) {
        try {
            // Extract user ID from JWT token
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            // Check if user is authenticated (not anonymousUser)
            if (authentication == null || !authentication.isAuthenticated() 
                    || "anonymousUser".equals(authentication.getName())) {
                return ResponseEntity.status(401).body("User not authenticated. Please login.");
            }
            
            Long userId;
            try {
                userId = Long.parseLong(authentication.getName());
            } catch (NumberFormatException e) {
                return ResponseEntity.status(401).body("Invalid authentication token.");
            }
            
            // Set the authenticated user as the buyer
            request.setBuyerId(userId);
            
            OrderResponse response = orderService.createOrder(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByBuyer(
            @PathVariable Long buyerId,
            @RequestParam(required = false) String status) {
        List<OrderResponse> orders = orderService.getOrdersByBuyer(buyerId, status);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<OrderResponse>> getOrdersBySupplier(
            @PathVariable Long supplierId,
            @RequestParam(required = false) String status) {
        List<OrderResponse> orders = orderService.getOrdersBySupplier(supplierId, status);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/supplier/user/{userId}")
    public ResponseEntity<List<OrderResponse>> getOrdersBySupplierUserId(
            @PathVariable Long userId,
            @RequestParam(required = false) String status) {
        List<OrderResponse> orders = orderService.getOrdersBySupplierUserId(userId, status);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        try {
            OrderResponse order = orderService.getOrderById(id);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<?> getOrderByOrderNumber(@PathVariable String orderNumber) {
        try {
            OrderResponse order = orderService.getOrderByOrderNumber(orderNumber);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody UpdateOrderStatusRequest request) {
        try {
            OrderResponse response = orderService.updateOrderStatus(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        try {
            OrderResponse response = orderService.cancelOrder(id, reason);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<?> refundOrder(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        try {
            OrderResponse response = orderService.refundOrder(id, reason);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
