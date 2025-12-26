package com.b2b.marketplace.cart.controller;

import com.b2b.marketplace.cart.dto.*;
import com.b2b.marketplace.cart.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class CartController {
    
    private final CartService cartService;

    @PostMapping
    public ResponseEntity<CartItemDTO> addToCart(@RequestBody AddToCartRequest request) {
        log.info("POST /api/cart - Add to cart request: {}", request);
        CartItemDTO result = cartService.addToCart(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping("/{buyerId}")
    public ResponseEntity<CartSummaryDTO> getCart(@PathVariable Long buyerId) {
        log.info("GET /api/cart/{} - Get cart", buyerId);
        CartSummaryDTO cart = cartService.getCart(buyerId);
        return ResponseEntity.ok(cart);
    }

    @GetMapping("/{buyerId}/count")
    public ResponseEntity<Integer> getCartItemCount(@PathVariable Long buyerId) {
        log.info("GET /api/cart/{}/count - Get cart item count", buyerId);
        Integer count = cartService.getCartItemCount(buyerId);
        return ResponseEntity.ok(count);
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<CartItemDTO> updateCartItem(
            @PathVariable Long cartItemId,
            @RequestBody UpdateCartRequest request) {
        log.info("PUT /api/cart/items/{} - Update cart item: {}", cartItemId, request);
        CartItemDTO result = cartService.updateCartItem(cartItemId, request);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long cartItemId) {
        log.info("DELETE /api/cart/items/{} - Remove from cart", cartItemId);
        cartService.removeFromCart(cartItemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{buyerId}")
    public ResponseEntity<Void> clearCart(@PathVariable Long buyerId) {
        log.info("DELETE /api/cart/{} - Clear cart", buyerId);
        cartService.clearCart(buyerId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Cart Service is running");
    }
}
