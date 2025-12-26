package com.b2b.marketplace.cart.service;

import com.b2b.marketplace.cart.dto.*;
import com.b2b.marketplace.cart.entity.Buyer;
import com.b2b.marketplace.cart.entity.CartItem;
import com.b2b.marketplace.cart.repository.BuyerRepository;
import com.b2b.marketplace.cart.repository.CartItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {
    
    private final CartItemRepository cartItemRepository;
    private final BuyerRepository buyerRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String PRODUCT_SERVICE_URL = "http://localhost:8082/api/products";

    @Transactional
    public CartItemDTO addToCart(AddToCartRequest request) {
        log.info("Adding to cart - BuyerId: {}, ProductId: {}, Quantity: {}", 
                request.getBuyerId(), request.getProductId(), request.getQuantity());
        
        // Convert user ID to buyer ID if needed
        Long buyerId = getBuyerIdFromUserId(request.getBuyerId());
        
        // Check if item already exists in cart
        Optional<CartItem> existingItem = cartItemRepository.findByBuyerIdAndProductId(
                buyerId, request.getProductId());
        
        CartItem cartItem;
        if (existingItem.isPresent()) {
            // Update quantity
            cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
        } else {
            // Create new cart item
            cartItem = new CartItem();
            cartItem.setBuyerId(buyerId);
            cartItem.setProductId(request.getProductId());
            cartItem.setQuantity(request.getQuantity());
        }
        
        cartItem = cartItemRepository.save(cartItem);
        return enrichCartItemWithProductDetails(cartItem);
    }
    
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

    @Transactional
    public CartItemDTO updateCartItem(Long cartItemId, UpdateCartRequest request) {
        log.info("Updating cart item {} with quantity: {}", cartItemId, request.getQuantity());
        
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        if (request.getQuantity() <= 0) {
            cartItemRepository.delete(cartItem);
            return null;
        }
        
        cartItem.setQuantity(request.getQuantity());
        cartItem = cartItemRepository.save(cartItem);
        
        return enrichCartItemWithProductDetails(cartItem);
    }

    @Transactional(readOnly = true)
    public CartSummaryDTO getCart(Long userId) {
        log.info("Getting cart for user/buyer: {}", userId);
        
        // Convert user ID to buyer ID if needed
        Long buyerId = getBuyerIdFromUserId(userId);
        log.info("Resolved buyer ID: {}", buyerId);
        
        List<CartItem> cartItems = cartItemRepository.findByBuyerId(buyerId);
        List<CartItemDTO> cartItemDTOs = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        int totalItems = 0;
        
        for (CartItem item : cartItems) {
            CartItemDTO dto = enrichCartItemWithProductDetails(item);
            cartItemDTOs.add(dto);
            totalAmount = totalAmount.add(dto.getSubtotal());
            totalItems += item.getQuantity();
        }
        
        CartSummaryDTO summary = new CartSummaryDTO();
        summary.setBuyerId(buyerId);
        summary.setItems(cartItemDTOs);
        summary.setTotalItems(totalItems);
        summary.setTotalAmount(totalAmount);
        
        return summary;
    }

    @Transactional
    public void removeFromCart(Long cartItemId) {
        log.info("Removing cart item: {}", cartItemId);
        cartItemRepository.deleteById(cartItemId);
    }

    @Transactional
    public void clearCart(Long userId) {
        Long buyerId = getBuyerIdFromUserId(userId);
        log.info("Clearing cart for buyer: {}", buyerId);
        cartItemRepository.deleteByBuyerId(buyerId);
    }

    public Integer getCartItemCount(Long userId) {
        Long buyerId = getBuyerIdFromUserId(userId);
        return cartItemRepository.countByBuyerId(buyerId);
    }

    private CartItemDTO enrichCartItemWithProductDetails(CartItem cartItem) {
        CartItemDTO dto = new CartItemDTO();
        dto.setId(cartItem.getId());
        dto.setBuyerId(cartItem.getBuyerId());
        dto.setProductId(cartItem.getProductId());
        dto.setQuantity(cartItem.getQuantity());
        
        try {
            // Fetch product details from Product Service (wrapped in ApiResponse)
            String url = PRODUCT_SERVICE_URL + "/" + cartItem.getProductId();
            log.debug("Fetching product from: {}", url);
            
            ProductApiResponse response = restTemplate.getForObject(url, ProductApiResponse.class);
            
            if (response != null && response.getData() != null) {
                ProductDTO product = response.getData();
                log.debug("Product fetched - ID: {}, Name: {}, Price: {}", 
                    product.getId(), product.getName(), product.getUnitPrice());
                
                if (product.getUnitPrice() != null) {
                    dto.setProductName(product.getName());
                    dto.setProductImage(product.getImageUrl());
                    dto.setUnitPrice(product.getUnitPrice());
                    dto.setSubtotal(product.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
                    dto.setSupplierName(product.getSupplierName());
                    dto.setSupplierId(product.getSupplierId());
                    dto.setAvailableStock(product.getStockQuantity());
                } else {
                    // Product exists but price is null - set defaults
                    log.warn("Product {} has null price", cartItem.getProductId());
                    dto.setProductName(product.getName());
                    dto.setProductImage(product.getImageUrl());
                    dto.setUnitPrice(BigDecimal.ZERO);
                    dto.setSubtotal(BigDecimal.ZERO);
                    dto.setSupplierName(product.getSupplierName());
                    dto.setSupplierId(product.getSupplierId());
                    dto.setAvailableStock(product.getStockQuantity());
                }
            }
        } catch (Exception e) {
            log.error("Error fetching product details for product {}: {}", cartItem.getProductId(), e.getMessage(), e);
            // Set default values if product service is unavailable
            dto.setProductName("Product " + cartItem.getProductId());
            dto.setUnitPrice(BigDecimal.ZERO);
            dto.setSubtotal(BigDecimal.ZERO);
        }
        
        return dto;
    }
    
    // Inner class to deserialize Product Service ApiResponse
    private static class ProductApiResponse {
        private boolean success;
        private String message;
        private ProductDTO data;
        
        public boolean isSuccess() {
            return success;
        }
        
        public void setSuccess(boolean success) {
            this.success = success;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
        
        public ProductDTO getData() {
            return data;
        }
        
        public void setData(ProductDTO data) {
            this.data = data;
        }
    }
}
