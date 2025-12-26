package com.b2b.marketplace.product.controller;

import com.b2b.marketplace.product.dto.ApiResponse;
import com.b2b.marketplace.product.entity.Promotion;
import com.b2b.marketplace.product.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
public class PromotionController {
    
    private final PromotionService promotionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Promotion>>> getAllPromotions() {
        return ResponseEntity.ok(ApiResponse.success(promotionService.getAllPromotions()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Promotion>>> getActivePromotions() {
        return ResponseEntity.ok(ApiResponse.success(promotionService.getActivePromotions()));
    }

    @GetMapping("/order-level")
    public ResponseEntity<ApiResponse<List<Promotion>>> getOrderLevelPromotions() {
        return ResponseEntity.ok(ApiResponse.success(promotionService.getOrderLevelPromotions()));
    }

    @GetMapping("/product-level")
    public ResponseEntity<ApiResponse<List<Promotion>>> getProductLevelPromotions() {
        return ResponseEntity.ok(ApiResponse.success(promotionService.getProductLevelPromotions()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Promotion>> getPromotionById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(promotionService.getPromotionById(id)));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<Promotion>>> getPromotionsForProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(promotionService.getPromotionsForProduct(productId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Promotion>> createPromotion(@RequestBody Promotion promotion) {
        return ResponseEntity.ok(ApiResponse.success(promotionService.createPromotion(promotion)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Promotion>> updatePromotion(
            @PathVariable Long id,
            @RequestBody Promotion promotion) {
        return ResponseEntity.ok(ApiResponse.success(promotionService.updatePromotion(id, promotion)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePromotion(@PathVariable Long id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.ok(ApiResponse.success("Promotion deleted successfully", null));
    }

    @PostMapping("/{id}/calculate-discount")
    public ResponseEntity<ApiResponse<BigDecimal>> calculatePromotionDiscount(
            @PathVariable Long id,
            @RequestParam BigDecimal originalPrice,
            @RequestParam Integer quantity) {
        Promotion promotion = promotionService.getPromotionById(id);
        BigDecimal discount = promotionService.calculatePromotionDiscount(promotion, originalPrice, quantity);
        return ResponseEntity.ok(ApiResponse.success(discount));
    }

    @PostMapping("/order-level/calculate")
    public ResponseEntity<ApiResponse<BigDecimal>> calculateOrderLevelDiscount(
            @RequestParam Long promotionId,
            @RequestParam BigDecimal orderAmount) {
        Promotion promotion = promotionService.getPromotionById(promotionId);
        BigDecimal discount = promotionService.calculateOrderLevelDiscount(promotion, orderAmount);
        return ResponseEntity.ok(ApiResponse.success(discount));
    }

    @GetMapping("/order-level/best")
    public ResponseEntity<ApiResponse<Promotion>> findBestOrderLevelPromotion(
            @RequestParam BigDecimal orderAmount) {
        Promotion bestPromotion = promotionService.findBestOrderLevelPromotion(orderAmount);
        return ResponseEntity.ok(ApiResponse.success(bestPromotion));
    }

    @PostMapping("/product-level/calculate")
    public ResponseEntity<ApiResponse<BigDecimal>> calculateProductLevelDiscount(
            @RequestParam Long promotionId,
            @RequestParam BigDecimal productPrice,
            @RequestParam Integer quantity) {
        Promotion promotion = promotionService.getPromotionById(promotionId);
        BigDecimal discount = promotionService.calculateProductLevelDiscount(promotion, productPrice, quantity);
        return ResponseEntity.ok(ApiResponse.success(discount));
    }
}
