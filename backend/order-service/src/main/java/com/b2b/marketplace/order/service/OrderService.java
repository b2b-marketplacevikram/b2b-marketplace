package com.b2b.marketplace.order.service;

import com.b2b.marketplace.order.dto.BuyerDTO;
import com.b2b.marketplace.order.dto.CreateOrderRequest;
import com.b2b.marketplace.order.dto.OrderResponse;
import com.b2b.marketplace.order.dto.UpdateOrderStatusRequest;
import com.b2b.marketplace.order.dto.PaymentProofRequest;
import com.b2b.marketplace.order.dto.VerifyPaymentRequest;
import com.b2b.marketplace.order.dto.SupplierBankDetailsResponse;
import com.b2b.marketplace.order.dto.SupplierBankDetailsRequest;
import com.b2b.marketplace.order.entity.Buyer;
import com.b2b.marketplace.order.entity.Order;
import com.b2b.marketplace.order.entity.SupplierBankDetails;
import com.b2b.marketplace.order.entity.OrderItem;
import com.b2b.marketplace.order.entity.Supplier;
import com.b2b.marketplace.order.repository.BuyerRepository;
import com.b2b.marketplace.order.repository.OrderRepository;
import com.b2b.marketplace.order.repository.SupplierRepository;
import com.b2b.marketplace.order.repository.SupplierBankDetailsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {
    
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private BuyerRepository buyerRepository;
    
    @Autowired
    private SupplierRepository supplierRepository;
    
    @Autowired
    private SupplierBankDetailsRepository supplierBankDetailsRepository;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String EMAIL_SERVICE_URL = "http://localhost:8087/api/email";
    private static final String USER_SERVICE_URL = "http://localhost:8081/api/users";
    private static final String NOTIFICATION_SERVICE_URL = "http://localhost:8086/api/notifications";
    private static final String PRODUCT_SERVICE_URL = "http://localhost:8082/api/products";

    // ==================== Stock Management ====================
    
    /**
     * Reduce stock for a product after order is placed
     */
    private void reduceProductStock(Long productId, Integer quantity) {
        try {
            String url = PRODUCT_SERVICE_URL + "/" + productId + "/reduce-stock?quantity=" + quantity;
            restTemplate.postForEntity(url, null, Map.class);
            log.info("Stock reduced for product {}: quantity={}", productId, quantity);
        } catch (Exception e) {
            log.error("Failed to reduce stock for product {}: {}", productId, e.getMessage());
            throw new RuntimeException("Failed to reduce stock: " + e.getMessage());
        }
    }
    
    /**
     * Restore stock for a product when order is cancelled
     */
    private void restoreProductStock(Long productId, Integer quantity) {
        try {
            String url = PRODUCT_SERVICE_URL + "/" + productId + "/restore-stock?quantity=" + quantity;
            restTemplate.postForEntity(url, null, Map.class);
            log.info("Stock restored for product {}: quantity={}", productId, quantity);
        } catch (Exception e) {
            log.error("Failed to restore stock for product {}: {}", productId, e.getMessage());
            // Don't throw - this is a recovery operation
        }
    }

    // ==================== B2B Payment Methods ====================
    
    /**
     * Submit payment proof for bank transfer/UPI orders
     */
    @Transactional
    public OrderResponse submitPaymentProof(String orderNumber, PaymentProofRequest request) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
            .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));
        
        order.setPaymentReference(request.getPaymentReference());
        order.setPaymentProofUrl(request.getPaymentProofUrl());
        order.setPaymentStatus(Order.PaymentStatus.AWAITING_VERIFICATION);
        
        order = orderRepository.save(order);
        log.info("Payment proof submitted for order {}: Reference={}", orderNumber, request.getPaymentReference());
        
        return mapToResponse(order);
    }
    
    /**
     * Verify payment (Supplier/Admin action)
     */
    @Transactional
    public OrderResponse verifyPayment(String orderNumber, VerifyPaymentRequest request, Long verifiedBy) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
            .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));
        
        if (request.getApproved()) {
            order.setPaymentStatus(Order.PaymentStatus.PAID);
            order.setStatus(Order.OrderStatus.PAYMENT_VERIFIED);
            order.setPaymentVerifiedAt(LocalDateTime.now());
            order.setPaymentVerifiedBy(verifiedBy);
            log.info("Payment verified for order {}", orderNumber);
        } else {
            order.setPaymentStatus(Order.PaymentStatus.FAILED);
            order.setNotes(order.getNotes() != null 
                ? order.getNotes() + "\nPayment rejected: " + request.getRejectionReason()
                : "Payment rejected: " + request.getRejectionReason());
            log.info("Payment rejected for order {}: {}", orderNumber, request.getRejectionReason());
        }
        
        order = orderRepository.save(order);
        return mapToResponse(order);
    }
    
    /**
     * Get orders awaiting payment verification for a supplier
     */
    public List<OrderResponse> getOrdersAwaitingPaymentVerification(Long supplierId) {
        List<Order> orders = orderRepository.findBySupplierIdAndPaymentStatus(
            supplierId, Order.PaymentStatus.AWAITING_VERIFICATION);
        return orders.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    /**
     * Get supplier bank details
     */
    public SupplierBankDetailsResponse getSupplierBankDetails(Long supplierId) {
        Optional<SupplierBankDetails> bankDetailsOpt = supplierBankDetailsRepository.findBySupplierIdAndIsPrimaryTrue(supplierId);
        
        if (bankDetailsOpt.isEmpty()) {
            bankDetailsOpt = supplierBankDetailsRepository.findFirstBySupplierId(supplierId);
        }
        
        if (bankDetailsOpt.isPresent()) {
            SupplierBankDetails entity = bankDetailsOpt.get();
            SupplierBankDetailsResponse response = new SupplierBankDetailsResponse();
            response.setId(entity.getId());
            response.setBankName(entity.getBankName());
            response.setAccountHolderName(entity.getAccountHolderName());
            response.setAccountNumber(entity.getAccountNumber());
            response.setIfscCode(entity.getIfscCode());
            response.setUpiId(entity.getUpiId());
            response.setSwiftCode(entity.getSwiftCode());
            response.setBranchName(entity.getBranchName());
            response.setIsPrimary(entity.getIsPrimary());
            response.setIsVerified(entity.getIsVerified());
            return response;
        }
        
        return null;
    }
    
    /**
     * Save or update supplier bank details
     */
    @Transactional
    public SupplierBankDetailsResponse saveSupplierBankDetails(Long supplierId, SupplierBankDetailsRequest request) {
        SupplierBankDetails entity;
        
        // Check if bank details already exist for this supplier
        Optional<SupplierBankDetails> existingOpt = supplierBankDetailsRepository.findFirstBySupplierId(supplierId);
        
        if (existingOpt.isPresent()) {
            entity = existingOpt.get();
        } else {
            entity = new SupplierBankDetails();
            entity.setSupplierId(supplierId);
        }
        
        entity.setBankName(request.getBankName());
        entity.setAccountHolderName(request.getAccountHolderName());
        entity.setAccountNumber(request.getAccountNumber());
        entity.setIfscCode(request.getIfscCode());
        entity.setUpiId(request.getUpiId());
        entity.setSwiftCode(request.getSwiftCode());
        entity.setBranchName(request.getBranchName());
        entity.setBranchAddress(request.getBranchAddress());
        entity.setIsPrimary(request.getIsPrimary() != null ? request.getIsPrimary() : true);
        
        entity = supplierBankDetailsRepository.save(entity);
        
        // Map to response
        SupplierBankDetailsResponse response = new SupplierBankDetailsResponse();
        response.setId(entity.getId());
        response.setBankName(entity.getBankName());
        response.setAccountHolderName(entity.getAccountHolderName());
        response.setAccountNumber(entity.getAccountNumber());
        response.setIfscCode(entity.getIfscCode());
        response.setUpiId(entity.getUpiId());
        response.setSwiftCode(entity.getSwiftCode());
        response.setBranchName(entity.getBranchName());
        response.setIsPrimary(entity.getIsPrimary());
        response.setIsVerified(entity.getIsVerified());
        
        return response;
    }

    /**
     * Convert user_id to buyer_id by querying the database.
     * Frontend passes user_id, but database expects buyer_id.
     */
    private Long getBuyerIdFromUserId(Long userId) {
        log.info("Converting user ID {} to buyer ID", userId);
        
        // First, try to find buyer by user_id in the database
        Optional<Buyer> buyerOpt = buyerRepository.findByUserId(userId);
        if (buyerOpt.isPresent()) {
            Long buyerId = buyerOpt.get().getId();
            log.info("Found buyer ID {} for user ID {}", buyerId, userId);
            return buyerId;
        }
        
        // If not found, create a new buyer record for this user
        log.warn("No buyer found for user ID {}, creating new buyer record", userId);
        Buyer newBuyer = new Buyer();
        newBuyer.setUserId(userId);
        newBuyer = buyerRepository.save(newBuyer);
        log.info("Created new buyer ID {} for user ID {}", newBuyer.getId(), userId);
        return newBuyer.getId();
    }

    private Long getSupplierIdFromUserId(Long userId) {
        log.info("Converting user ID {} to supplier ID", userId);
        
        Optional<Supplier> supplierOpt = supplierRepository.findByUserId(userId);
        if (supplierOpt.isPresent()) {
            Long supplierId = supplierOpt.get().getId();
            log.info("Found supplier ID {} for user ID {}", supplierId, userId);
            return supplierId;
        }
        
        log.warn("No supplier found for user ID {}, creating new supplier record", userId);
        Supplier newSupplier = new Supplier();
        newSupplier.setUserId(userId);
        newSupplier.setCompanyName("Default Supplier " + userId); // Required field with default value
        newSupplier = supplierRepository.save(newSupplier);
        log.info("Created new supplier ID {} for user ID {}", newSupplier.getId(), userId);
        return newSupplier.getId();
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        // Convert user_id to buyer_id (frontend sends user_id, DB needs buyer_id)
        Long buyerId = getBuyerIdFromUserId(request.getBuyerId());
        
        // Get supplier from the product being ordered
        Long supplierId = null;
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            Long productId = request.getItems().get(0).getProductId();
            try {
                String productServiceUrl = "http://localhost:8082/api/products/" + productId;
                Map<String, Object> productResponse = restTemplate.getForObject(productServiceUrl, Map.class);
                if (productResponse != null && productResponse.containsKey("data")) {
                    Map<String, Object> productData = (Map<String, Object>) productResponse.get("data");
                    if (productData != null && productData.containsKey("supplierId")) {
                        Object supplierIdObj = productData.get("supplierId");
                        supplierId = supplierIdObj instanceof Integer ? 
                                ((Integer) supplierIdObj).longValue() : (Long) supplierIdObj;
                    }
                }
            } catch (Exception e) {
                log.error("Failed to fetch product details for product {}: {}", productId, e.getMessage());
                throw new RuntimeException("Unable to determine supplier for the product");
            }
        }
        
        if (supplierId == null) {
            throw new RuntimeException("Unable to determine supplier for the order");
        }
        
        // Generate unique order number
        String orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        
        // Create order
        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setBuyerId(buyerId);
        order.setSupplierId(supplierId);
        order.setPaymentMethod(request.getPaymentMethod());
        order.setSubtotal(request.getSubtotal());
        order.setTaxAmount(request.getTaxAmount());
        order.setShippingCost(request.getShippingCost());
        order.setTotalAmount(request.getTotalAmount());
        order.setShippingAddress(request.getShippingAddress());
        order.setBillingAddress(request.getBillingAddress());
        order.setShippingMethod(request.getShippingMethod());
        order.setNotes(request.getNotes());
        order.setStatus(Order.OrderStatus.PENDING);
        order.setPaymentStatus(Order.PaymentStatus.PENDING);

        // Add order items
        for (CreateOrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            OrderItem item = new OrderItem();
            item.setProductId(itemRequest.getProductId());
            item.setProductName(itemRequest.getProductName());
            item.setProductImage(itemRequest.getProductImage());
            item.setQuantity(itemRequest.getQuantity());
            item.setUnitPrice(itemRequest.getUnitPrice());
            item.setTotalPrice(itemRequest.getTotalPrice());
            order.addItem(item);
        }

        // Set B2B PO-Based Payment Fields
        if (request.getPoNumber() != null) {
            order.setPoNumber(request.getPoNumber());
        }
        
        // Handle payment type and calculate commission
        String paymentType = request.getPaymentType();
        if (paymentType != null) {
            order.setPaymentType(Order.PaymentType.valueOf(paymentType));
            
            // Calculate commission for urgent online payments
            if (paymentType.equals("URGENT_ONLINE")) {
                order.setIsUrgent(true);
                BigDecimal commissionRate = new BigDecimal("2.00"); // 2% commission
                BigDecimal commissionAmount = request.getTotalAmount()
                    .multiply(commissionRate)
                    .divide(new BigDecimal("100"));
                order.setPaymentCommissionRate(commissionRate);
                order.setPaymentCommissionAmount(commissionAmount);
                order.setPaymentCommissionPaidBy(Order.CommissionPaidBy.BUYER);
                // Add commission to total
                order.setTotalAmount(request.getTotalAmount().add(commissionAmount));
                order.setStatus(Order.OrderStatus.PENDING);
            } else if (paymentType.equals("BANK_TRANSFER") || paymentType.equals("UPI")) {
                // Zero commission - awaiting manual payment
                order.setPaymentCommissionRate(BigDecimal.ZERO);
                order.setPaymentCommissionAmount(BigDecimal.ZERO);
                order.setStatus(Order.OrderStatus.AWAITING_PAYMENT);
            } else if (paymentType.equals("CREDIT_TERMS")) {
                // Credit terms for trusted buyers
                order.setPaymentCommissionRate(BigDecimal.ZERO);
                order.setPaymentCommissionAmount(BigDecimal.ZERO);
                order.setCreditTermsDays(request.getCreditTermsDays() != null ? request.getCreditTermsDays() : 30);
                order.setStatus(Order.OrderStatus.CONFIRMED); // Ship immediately for credit buyers
            }
        }
        
        order.setIsUrgent(request.getIsUrgent() != null && request.getIsUrgent());

        // Save order
        order = orderRepository.save(order);
        
        // Reduce stock for each ordered item
        for (OrderItem item : order.getItems()) {
            try {
                reduceProductStock(item.getProductId(), item.getQuantity());
            } catch (Exception e) {
                log.error("Failed to reduce stock for product {}: {}", item.getProductId(), e.getMessage());
                // Continue with order - stock reduction failure shouldn't block order
            }
        }
        
        // Send order confirmation email asynchronously
        try {
            sendOrderConfirmationEmail(order);
        } catch (Exception e) {
            log.error("Failed to send order confirmation email for order {}: {}", order.getOrderNumber(), e.getMessage());
            // Don't fail the order creation if email fails
        }
        
        // Send real-time notification to buyer and supplier
        try {
            sendOrderCreatedNotification(order);
        } catch (Exception e) {
            log.error("Failed to send order notification for order {}: {}", order.getOrderNumber(), e.getMessage());
        }

        return mapToResponse(order);
    }
    
    private void sendOrderConfirmationEmail(Order order) {
        try {
            log.info("Sending order confirmation email for order: {}", order.getOrderNumber());
            
            // Fetch buyer details from User Service
            Map<String, Object> buyer = fetchUserDetails(order.getBuyerId());
            String buyerName = buyer != null ? (String) buyer.get("fullName") : "Customer";
            String buyerEmail = buyer != null ? (String) buyer.get("email") : null;
            
            // Fetch supplier details from User Service
            Map<String, Object> supplier = fetchUserDetails(order.getSupplierId());
            String supplierName = supplier != null ? (String) supplier.get("fullName") : "Supplier";
            
            // Build order data for email
            Map<String, Object> orderData = new HashMap<>();
            orderData.put("orderId", order.getId());
            orderData.put("orderNumber", order.getOrderNumber());
            orderData.put("buyerId", order.getBuyerId());
            orderData.put("buyerName", buyerName);
            orderData.put("buyerEmail", buyerEmail);
            orderData.put("supplierName", supplierName);
            orderData.put("totalAmount", order.getTotalAmount());
            orderData.put("currency", "USD");
            orderData.put("status", order.getStatus().toString());
            orderData.put("orderDate", order.getCreatedAt().toString());
            orderData.put("shippingAddress", order.getShippingAddress());
            orderData.put("paymentMethod", order.getPaymentMethod());
            
            // Add order items
            List<Map<String, Object>> items = order.getItems().stream().map(item -> {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("productName", item.getProductName());
                itemMap.put("quantity", item.getQuantity());
                itemMap.put("unitPrice", item.getUnitPrice());
                itemMap.put("totalPrice", item.getTotalPrice());
                return itemMap;
            }).collect(Collectors.toList());
            orderData.put("items", items);
            
            // Call Email Service - send orderData directly, not wrapped
            restTemplate.postForObject(
                EMAIL_SERVICE_URL + "/order/confirmation",
                orderData,
                Map.class
            );
            
            log.info("Order confirmation email sent successfully for order: {}", order.getOrderNumber());
        } catch (Exception e) {
            log.error("Error sending order confirmation email: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    private void sendOrderStatusUpdateEmail(Order order, String previousStatus) {
        try {
            log.info("Sending order status update email for order: {}", order.getOrderNumber());
            
            // Fetch buyer details from User Service
            Map<String, Object> buyer = fetchUserDetails(order.getBuyerId());
            String buyerName = buyer != null ? (String) buyer.get("fullName") : "Customer";
            String buyerEmail = buyer != null ? (String) buyer.get("email") : null;
            
            // Build order data for email
            Map<String, Object> orderData = new HashMap<>();
            orderData.put("orderId", order.getId());
            orderData.put("orderNumber", order.getOrderNumber());
            orderData.put("buyerId", order.getBuyerId());
            orderData.put("buyerName", buyerName);
            orderData.put("buyerEmail", buyerEmail);
            orderData.put("totalAmount", order.getTotalAmount());
            orderData.put("currency", "USD");
            orderData.put("status", order.getStatus().toString());
            orderData.put("orderDate", order.getCreatedAt().toString());
            orderData.put("shippingAddress", order.getShippingAddress());
            orderData.put("paymentMethod", order.getPaymentMethod());
            
            // Call Email Service with previous status
            String url = EMAIL_SERVICE_URL + "/order/status?previousStatus=" + previousStatus;
            restTemplate.postForObject(url, orderData, Map.class);
            
            log.info("Order status update email sent successfully for order: {}", order.getOrderNumber());
        } catch (Exception e) {
            log.error("Error sending order status update email: {}", e.getMessage(), e);
            throw e;
        }
    }

    public List<OrderResponse> getOrdersByBuyer(Long buyerId, String status) {
        // Convert user_id to buyer_id if needed
        buyerId = getBuyerIdFromUserId(buyerId);
        
        List<Order> orders;
        if (status != null && !status.isEmpty()) {
            orders = orderRepository.findByBuyerIdAndStatusOrderByCreatedAtDesc(
                    buyerId, Order.OrderStatus.valueOf(status.toUpperCase()));
        } else {
            orders = orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId);
        }
        return orders.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<OrderResponse> getOrdersBySupplier(Long supplierId, String status) {
        List<Order> orders;
        if (status != null && !status.isEmpty()) {
            orders = orderRepository.findBySupplierIdAndStatusOrderByCreatedAtDesc(
                    supplierId, Order.OrderStatus.valueOf(status.toUpperCase()));
        } else {
            orders = orderRepository.findBySupplierIdOrderByCreatedAtDesc(supplierId);
        }
        return orders.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<OrderResponse> getOrdersBySupplierUserId(Long userId, String status) {
        Long supplierId = getSupplierIdFromUserId(userId);
        return getOrdersBySupplier(supplierId, status);
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToResponse(order);
    }

    public OrderResponse getOrderByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Order.OrderStatus previousStatus = order.getStatus();
        Order.OrderStatus newStatus = Order.OrderStatus.valueOf(request.getStatus().toUpperCase());
        order.setStatus(newStatus);

        if (request.getTrackingNumber() != null) {
            order.setTrackingNumber(request.getTrackingNumber());
        }

        // Update timestamps based on status
        LocalDateTime now = LocalDateTime.now();
        switch (newStatus) {
            case CONFIRMED:
                order.setConfirmedAt(now);
                order.setPaymentStatus(Order.PaymentStatus.PAID);
                break;
            case SHIPPED:
                order.setShippedAt(now);
                break;
            case DELIVERED:
                order.setDeliveredAt(now);
                break;
        }

        order = orderRepository.save(order);
        
        // Send order status update email
        try {
            sendOrderStatusUpdateEmail(order, previousStatus.toString());
        } catch (Exception e) {
            log.error("Failed to send order status update email for order {}: {}", order.getOrderNumber(), e.getMessage());
            // Don't fail the status update if email fails
        }
        
        // Send real-time notification to buyer and supplier
        try {
            sendOrderStatusNotification(order, previousStatus.toString(), newStatus.toString());
        } catch (Exception e) {
            log.error("Failed to send order status notification for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
        
        return mapToResponse(order);
    }

    private OrderResponse mapToResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setOrderNumber(order.getOrderNumber());
        response.setBuyerId(order.getBuyerId());
        response.setSupplierId(order.getSupplierId());
        response.setStatus(order.getStatus().name());
        response.setPaymentStatus(order.getPaymentStatus().name());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setSubtotal(order.getSubtotal());
        response.setTaxAmount(order.getTaxAmount());
        response.setShippingCost(order.getShippingCost());
        response.setTotalAmount(order.getTotalAmount());
        response.setCurrency(order.getCurrency());
        response.setShippingAddress(order.getShippingAddress());
        response.setBillingAddress(order.getBillingAddress());
        response.setTrackingNumber(order.getTrackingNumber());
        response.setShippingMethod(order.getShippingMethod());
        response.setEstimatedDeliveryDate(order.getEstimatedDeliveryDate());
        response.setNotes(order.getNotes());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());
        response.setConfirmedAt(order.getConfirmedAt());
        response.setShippedAt(order.getShippedAt());
        response.setDeliveredAt(order.getDeliveredAt());
        response.setCancelledAt(order.getCancelledAt());
        response.setRefundedAt(order.getRefundedAt());
        response.setCancellationReason(order.getCancellationReason());
        response.setRefundReason(order.getRefundReason());
        response.setRefundAmount(order.getRefundAmount());

        // Map items
        List<OrderResponse.OrderItemResponse> items = order.getItems().stream()
                .map(item -> {
                    OrderResponse.OrderItemResponse itemResponse = new OrderResponse.OrderItemResponse();
                    itemResponse.setId(item.getId());
                    itemResponse.setProductId(item.getProductId());
                    itemResponse.setProductName(item.getProductName());
                    itemResponse.setProductImage(item.getProductImage());
                    itemResponse.setQuantity(item.getQuantity());
                    itemResponse.setUnitPrice(item.getUnitPrice());
                    itemResponse.setTotalPrice(item.getTotalPrice());
                    return itemResponse;
                })
                .collect(Collectors.toList());
        response.setItems(items);

        return response;
    }
    
    private Map<String, Object> fetchUserDetails(Long userId) {
        try {
            if (userId == null) {
                return null;
            }
            
            String url = USER_SERVICE_URL + "/" + userId;
            log.info("Fetching user details from: {}", url);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> userDetails = restTemplate.getForObject(url, Map.class);
            
            log.info("Fetched user details for userId {}: {}", userId, userDetails);
            return userDetails;
        } catch (Exception e) {
            log.error("Failed to fetch user details for userId {}: {}", userId, e.getMessage());
            return null;
        }
    }
    
    private void sendOrderCreatedNotification(Order order) {
        try {
            log.info("Sending order created notification for order: {}", order.getOrderNumber());
            
            // Notify buyer
            Map<String, Object> buyerNotification = new HashMap<>();
            buyerNotification.put("userId", order.getBuyerId());
            buyerNotification.put("type", "ORDER_CREATED");
            buyerNotification.put("title", "Order Placed Successfully");
            buyerNotification.put("message", String.format("Your order #%s has been placed successfully. Total: $%.2f", 
                order.getOrderNumber(), order.getTotalAmount()));
            buyerNotification.put("orderId", order.getId());
            buyerNotification.put("orderStatus", order.getStatus().toString());
            buyerNotification.put("severity", "SUCCESS");
            
            restTemplate.postForObject(NOTIFICATION_SERVICE_URL + "/send", buyerNotification, Map.class);
            
            // Notify supplier
            Map<String, Object> supplierNotification = new HashMap<>();
            supplierNotification.put("userId", order.getSupplierId());
            supplierNotification.put("type", "NEW_ORDER_RECEIVED");
            supplierNotification.put("title", "New Order Received");
            supplierNotification.put("message", String.format("You have received a new order #%s. Total: $%.2f", 
                order.getOrderNumber(), order.getTotalAmount()));
            supplierNotification.put("orderId", order.getId());
            supplierNotification.put("orderStatus", order.getStatus().toString());
            supplierNotification.put("severity", "INFO");
            
            restTemplate.postForObject(NOTIFICATION_SERVICE_URL + "/send", supplierNotification, Map.class);
            
            log.info("Order created notifications sent successfully");
        } catch (org.springframework.web.client.ResourceAccessException e) {
            log.warn("Notification service not available at {}: {} - Order created successfully without notifications", 
                NOTIFICATION_SERVICE_URL, e.getMessage());
        } catch (Exception e) {
            log.error("Error sending order created notification: {}", e.getMessage());
            throw e;
        }
    }
    
    private void sendOrderStatusNotification(Order order, String previousStatus, String newStatus) {
        try {
            log.info("Sending order status notification for order: {} from {} to {}", 
                order.getOrderNumber(), previousStatus, newStatus);
            
            String severity = "INFO";
            String title = "Order Status Updated";
            String buyerMessage = String.format("Your order #%s status changed from %s to %s", 
                order.getOrderNumber(), previousStatus, newStatus);
            String supplierMessage = String.format("Order #%s status changed from %s to %s", 
                order.getOrderNumber(), previousStatus, newStatus);
            
            // Customize message based on status
            if ("DELIVERED".equals(newStatus)) {
                severity = "SUCCESS";
                title = "Order Delivered!";
                buyerMessage = String.format("Your order #%s has been delivered successfully!", order.getOrderNumber());
                supplierMessage = String.format("Order #%s has been delivered", order.getOrderNumber());
            } else if ("SHIPPED".equals(newStatus)) {
                severity = "INFO";
                title = "Order Shipped";
                buyerMessage = String.format("Your order #%s has been shipped", order.getOrderNumber());
                if (order.getTrackingNumber() != null) {
                    buyerMessage += ". Tracking: " + order.getTrackingNumber();
                }
            } else if ("CANCELLED".equals(newStatus)) {
                severity = "WARNING";
                title = "Order Cancelled";
                buyerMessage = String.format("Your order #%s has been cancelled", order.getOrderNumber());
                supplierMessage = String.format("Order #%s has been cancelled", order.getOrderNumber());
            } else if ("CONFIRMED".equals(newStatus)) {
                severity = "SUCCESS";
                title = "Order Confirmed";
                buyerMessage = String.format("Your order #%s has been confirmed and is being processed", order.getOrderNumber());
                supplierMessage = String.format("Order #%s has been confirmed", order.getOrderNumber());
            }
            
            // Notify buyer
            Map<String, Object> buyerNotification = new HashMap<>();
            buyerNotification.put("userId", order.getBuyerId());
            buyerNotification.put("type", "ORDER_STATUS_CHANGED");
            buyerNotification.put("title", title);
            buyerNotification.put("message", buyerMessage);
            buyerNotification.put("orderId", order.getId());
            buyerNotification.put("orderStatus", newStatus);
            buyerNotification.put("severity", severity);
            
            restTemplate.postForObject(NOTIFICATION_SERVICE_URL + "/send", buyerNotification, Map.class);
            
            // Notify supplier
            Map<String, Object> supplierNotification = new HashMap<>();
            supplierNotification.put("userId", order.getSupplierId());
            supplierNotification.put("type", "ORDER_STATUS_CHANGED");
            supplierNotification.put("title", title);
            supplierNotification.put("message", supplierMessage);
            supplierNotification.put("orderId", order.getId());
            supplierNotification.put("orderStatus", newStatus);
            supplierNotification.put("severity", severity);
            
            restTemplate.postForObject(NOTIFICATION_SERVICE_URL + "/send", supplierNotification, Map.class);
            
            log.info("Order status notifications sent successfully");
        } catch (Exception e) {
            log.error("Error sending order status notification: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId, String reason) {
        log.info("Cancelling order {}, reason: {}", orderId, reason);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        
        // Validate order can be cancelled
        if (order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new RuntimeException("Cannot cancel a delivered order. Please request a refund instead.");
        }
        
        if (order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new RuntimeException("Order is already cancelled");
        }
        
        if (order.getStatus() == Order.OrderStatus.REFUNDED) {
            throw new RuntimeException("Order has been refunded and cannot be cancelled");
        }
        
        // Update order status
        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setCancelledAt(LocalDateTime.now());
        order.setCancellationReason(reason != null ? reason : "Cancelled by customer");
        
        // If payment was made, initiate refund
        if (order.getPaymentStatus() == Order.PaymentStatus.PAID) {
            order.setPaymentStatus(Order.PaymentStatus.REFUNDED);
            order.setRefundAmount(order.getTotalAmount());
            order.setRefundedAt(LocalDateTime.now());
            order.setRefundReason("Order cancelled - " + (reason != null ? reason : "No reason provided"));
        }
        
        Order savedOrder = orderRepository.save(order);
        
        // Restore stock for all items in the cancelled order
        for (OrderItem item : savedOrder.getItems()) {
            try {
                restoreProductStock(item.getProductId(), item.getQuantity());
                log.info("Restored stock for product {} quantity {}", item.getProductId(), item.getQuantity());
            } catch (Exception e) {
                log.error("Failed to restore stock for product {}: {}", item.getProductId(), e.getMessage());
            }
        }
        
        // Send notifications
        try {
            sendCancellationNotification(savedOrder);
        } catch (Exception e) {
            log.error("Failed to send cancellation notification: {}", e.getMessage());
        }
        
        return mapToResponse(savedOrder);
    }

    @Transactional
    public OrderResponse refundOrder(Long orderId, String reason) {
        log.info("Processing refund for order {}, reason: {}", orderId, reason);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        
        // Validate order can be refunded
        if (order.getPaymentStatus() != Order.PaymentStatus.PAID) {
            throw new RuntimeException("Cannot refund an order that hasn't been paid");
        }
        
        if (order.getPaymentStatus() == Order.PaymentStatus.REFUNDED) {
            throw new RuntimeException("Order has already been refunded");
        }
        
        if (order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new RuntimeException("Order is cancelled. Refund was already processed during cancellation.");
        }
        
        // Update order status
        order.setStatus(Order.OrderStatus.REFUNDED);
        order.setPaymentStatus(Order.PaymentStatus.REFUNDED);
        order.setRefundedAt(LocalDateTime.now());
        order.setRefundAmount(order.getTotalAmount());
        order.setRefundReason(reason != null ? reason : "Refund requested by customer");
        
        Order savedOrder = orderRepository.save(order);
        
        // Send notifications
        try {
            sendRefundNotification(savedOrder);
        } catch (Exception e) {
            log.error("Failed to send refund notification: {}", e.getMessage());
        }
        
        return mapToResponse(savedOrder);
    }

    private void sendCancellationNotification(Order order) {
        try {
            // Fetch user details
            Map<String, Object> buyerDetails = fetchUserDetails(order.getBuyerId());
            String buyerEmail = buyerDetails != null ? (String) buyerDetails.get("email") : null;
            String buyerName = buyerDetails != null ? (String) buyerDetails.get("fullName") : "Customer";
            
            // Send email to buyer
            if (buyerEmail != null) {
                Map<String, Object> emailRequest = new HashMap<>();
                emailRequest.put("to", buyerEmail);
                emailRequest.put("subject", "Order Cancelled - " + order.getOrderNumber());
                emailRequest.put("body", String.format(
                    "Dear %s,\n\n" +
                    "Your order %s has been cancelled.\n\n" +
                    "Cancellation Details:\n" +
                    "Order Number: %s\n" +
                    "Total Amount: $%.2f\n" +
                    "Reason: %s\n\n" +
                    (order.getPaymentStatus() == Order.PaymentStatus.REFUNDED ? 
                        "Refund Amount: $%.2f\n" +
                        "Your refund will be processed within 5-7 business days.\n\n" : "") +
                    "If you have any questions, please contact our support team.\n\n" +
                    "Best regards,\n" +
                    "B2B Marketplace Team",
                    buyerName,
                    order.getOrderNumber(),
                    order.getOrderNumber(),
                    order.getTotalAmount(),
                    order.getCancellationReason() != null ? order.getCancellationReason() : "No reason provided",
                    order.getRefundAmount() != null ? order.getRefundAmount() : BigDecimal.ZERO
                ));
                emailRequest.put("userId", order.getBuyerId());
                
                restTemplate.postForObject(EMAIL_SERVICE_URL + "/send", emailRequest, Map.class);
            }
            
            // Send notification to buyer
            Map<String, Object> buyerNotification = new HashMap<>();
            buyerNotification.put("userId", order.getBuyerId());
            buyerNotification.put("type", "ORDER_CANCELLED");
            buyerNotification.put("title", "Order Cancelled");
            buyerNotification.put("message", String.format("Your order %s has been cancelled. %s", 
                order.getOrderNumber(),
                order.getPaymentStatus() == Order.PaymentStatus.REFUNDED ? 
                    "Refund of $" + order.getRefundAmount() + " is being processed." : ""));
            buyerNotification.put("orderId", order.getId());
            buyerNotification.put("orderStatus", "CANCELLED");
            buyerNotification.put("severity", "warning");
            
            restTemplate.postForObject(NOTIFICATION_SERVICE_URL + "/send", buyerNotification, Map.class);
            
            // Notify supplier
            Map<String, Object> supplierNotification = new HashMap<>();
            supplierNotification.put("userId", order.getSupplierId());
            supplierNotification.put("type", "ORDER_CANCELLED");
            supplierNotification.put("title", "Order Cancelled by Customer");
            supplierNotification.put("message", String.format("Order %s has been cancelled by the customer", 
                order.getOrderNumber()));
            supplierNotification.put("orderId", order.getId());
            supplierNotification.put("orderStatus", "CANCELLED");
            supplierNotification.put("severity", "warning");
            
            restTemplate.postForObject(NOTIFICATION_SERVICE_URL + "/send", supplierNotification, Map.class);
            
            log.info("Cancellation notifications sent successfully");
        } catch (Exception e) {
            log.error("Error sending cancellation notification: {}", e.getMessage(), e);
        }
    }

    private void sendRefundNotification(Order order) {
        try {
            // Fetch user details
            Map<String, Object> buyerDetails = fetchUserDetails(order.getBuyerId());
            String buyerEmail = buyerDetails != null ? (String) buyerDetails.get("email") : null;
            String buyerName = buyerDetails != null ? (String) buyerDetails.get("fullName") : "Customer";
            
            // Send email to buyer
            if (buyerEmail != null) {
                Map<String, Object> emailRequest = new HashMap<>();
                emailRequest.put("to", buyerEmail);
                emailRequest.put("subject", "Refund Processed - " + order.getOrderNumber());
                emailRequest.put("body", String.format(
                    "Dear %s,\n\n" +
                    "A refund has been processed for your order %s.\n\n" +
                    "Refund Details:\n" +
                    "Order Number: %s\n" +
                    "Refund Amount: $%.2f\n" +
                    "Reason: %s\n\n" +
                    "The refund will be credited to your original payment method within 5-7 business days.\n\n" +
                    "If you have any questions, please contact our support team.\n\n" +
                    "Best regards,\n" +
                    "B2B Marketplace Team",
                    buyerName,
                    order.getOrderNumber(),
                    order.getOrderNumber(),
                    order.getRefundAmount(),
                    order.getRefundReason() != null ? order.getRefundReason() : "No reason provided"
                ));
                emailRequest.put("userId", order.getBuyerId());
                
                restTemplate.postForObject(EMAIL_SERVICE_URL + "/send", emailRequest, Map.class);
            }
            
            // Send notification to buyer
            Map<String, Object> buyerNotification = new HashMap<>();
            buyerNotification.put("userId", order.getBuyerId());
            buyerNotification.put("type", "ORDER_REFUNDED");
            buyerNotification.put("title", "Refund Processed");
            buyerNotification.put("message", String.format("Refund of $%.2f for order %s has been processed", 
                order.getRefundAmount(), order.getOrderNumber()));
            buyerNotification.put("orderId", order.getId());
            buyerNotification.put("orderStatus", "REFUNDED");
            buyerNotification.put("severity", "success");
            
            restTemplate.postForObject(NOTIFICATION_SERVICE_URL + "/send", buyerNotification, Map.class);
            
            // Notify supplier
            Map<String, Object> supplierNotification = new HashMap<>();
            supplierNotification.put("userId", order.getSupplierId());
            supplierNotification.put("type", "ORDER_REFUNDED");
            supplierNotification.put("title", "Order Refunded");
            supplierNotification.put("message", String.format("Order %s has been refunded", 
                order.getOrderNumber()));
            supplierNotification.put("orderId", order.getId());
            supplierNotification.put("orderStatus", "REFUNDED");
            supplierNotification.put("severity", "info");
            
            restTemplate.postForObject(NOTIFICATION_SERVICE_URL + "/send", supplierNotification, Map.class);
            
            log.info("Refund notifications sent successfully");
        } catch (Exception e) {
            log.error("Error sending refund notification: {}", e.getMessage(), e);
        }
    }
}
