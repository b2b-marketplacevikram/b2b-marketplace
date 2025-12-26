package com.b2b.marketplace.product.service;

import com.b2b.marketplace.product.entity.Promotion;
import com.b2b.marketplace.product.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class PromotionService {
    
    private final PromotionRepository promotionRepository;

    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }

    public List<Promotion> getActivePromotions() {
        return promotionRepository.findActivePromotions(LocalDateTime.now());
    }

    public Promotion getPromotionById(Long id) {
        return promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found with id: " + id));
    }

    @Transactional
    public Promotion createPromotion(Promotion promotion) {
        return promotionRepository.save(promotion);
    }

    @Transactional
    public Promotion updatePromotion(Long id, Promotion promotionData) {
        Promotion promotion = getPromotionById(id);
        
        promotion.setName(promotionData.getName());
        promotion.setDescription(promotionData.getDescription());
        promotion.setType(promotionData.getType());
        promotion.setPromotionLevel(promotionData.getPromotionLevel());
        promotion.setDiscountPercentage(promotionData.getDiscountPercentage());
        promotion.setDiscountAmount(promotionData.getDiscountAmount());
        promotion.setBuyQuantity(promotionData.getBuyQuantity());
        promotion.setGetQuantity(promotionData.getGetQuantity());
        promotion.setMinOrderAmount(promotionData.getMinOrderAmount());
        promotion.setMaxDiscountAmount(promotionData.getMaxDiscountAmount());
        promotion.setValidFrom(promotionData.getValidFrom());
        promotion.setValidUntil(promotionData.getValidUntil());
        promotion.setIsActive(promotionData.getIsActive());
        promotion.setPriority(promotionData.getPriority());
        promotion.setApplicableTo(promotionData.getApplicableTo());
        promotion.setProductIds(promotionData.getProductIds());
        promotion.setCategoryIds(promotionData.getCategoryIds());
        promotion.setBannerImageUrl(promotionData.getBannerImageUrl());
        
        return promotionRepository.save(promotion);
    }

    @Transactional
    public void deletePromotion(Long id) {
        promotionRepository.deleteById(id);
    }

    public BigDecimal calculatePromotionDiscount(Promotion promotion, BigDecimal originalPrice, Integer quantity) {
        BigDecimal discount = BigDecimal.ZERO;
        
        switch (promotion.getType()) {
            case PERCENTAGE_OFF:
                discount = originalPrice.multiply(promotion.getDiscountPercentage())
                        .divide(BigDecimal.valueOf(100));
                break;
            case FIXED_AMOUNT_OFF:
                discount = promotion.getDiscountAmount();
                break;
            case BUY_X_GET_Y:
                if (quantity >= promotion.getBuyQuantity()) {
                    int freeItems = (quantity / promotion.getBuyQuantity()) * promotion.getGetQuantity();
                    discount = originalPrice.multiply(BigDecimal.valueOf(freeItems));
                }
                break;
            case FLASH_SALE:
                if (promotion.getDiscountPercentage() != null) {
                    discount = originalPrice.multiply(promotion.getDiscountPercentage())
                            .divide(BigDecimal.valueOf(100));
                }
                break;
        }
        
        return discount;
    }

    public List<Promotion> getPromotionsForProduct(Long productId) {
        List<Promotion> activePromotions = getActivePromotions();
        return activePromotions.stream()
                .filter(p -> isPromotionApplicableToProduct(p, productId))
                .toList();
    }

    private boolean isPromotionApplicableToProduct(Promotion promotion, Long productId) {
        if ("ALL".equals(promotion.getApplicableTo())) {
            return true;
        }
        
        if ("SPECIFIC_PRODUCTS".equals(promotion.getApplicableTo()) && 
            promotion.getProductIds() != null) {
            return promotion.getProductIds().contains(productId.toString());
        }
        
        return false;
    }

    /**
     * Get order-level promotions that apply to the entire order
     */
    public List<Promotion> getOrderLevelPromotions() {
        List<Promotion> activePromotions = getActivePromotions();
        return activePromotions.stream()
                .filter(p -> p.getPromotionLevel() == Promotion.PromotionLevel.ORDER_LEVEL)
                .toList();
    }

    /**
     * Get product-level promotions for specific products
     */
    public List<Promotion> getProductLevelPromotions() {
        List<Promotion> activePromotions = getActivePromotions();
        return activePromotions.stream()
                .filter(p -> p.getPromotionLevel() == Promotion.PromotionLevel.PRODUCT_LEVEL)
                .toList();
    }

    /**
     * Calculate order-level promotion discount
     * @param promotion The order-level promotion
     * @param orderAmount Total order amount
     * @return Calculated discount amount
     */
    public BigDecimal calculateOrderLevelDiscount(Promotion promotion, BigDecimal orderAmount) {
        if (promotion.getPromotionLevel() != Promotion.PromotionLevel.ORDER_LEVEL) {
            throw new IllegalArgumentException("Promotion is not an order-level promotion");
        }

        // Check minimum order amount requirement
        if (promotion.getMinOrderAmount() != null && 
            orderAmount.compareTo(promotion.getMinOrderAmount()) < 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal discount = BigDecimal.ZERO;

        switch (promotion.getType()) {
            case PERCENTAGE_OFF:
                discount = orderAmount.multiply(promotion.getDiscountPercentage())
                        .divide(BigDecimal.valueOf(100));
                // Apply max discount cap if specified
                if (promotion.getMaxDiscountAmount() != null && 
                    discount.compareTo(promotion.getMaxDiscountAmount()) > 0) {
                    discount = promotion.getMaxDiscountAmount();
                }
                break;
            case FIXED_AMOUNT_OFF:
                discount = promotion.getDiscountAmount();
                // Don't exceed order amount
                if (discount.compareTo(orderAmount) > 0) {
                    discount = orderAmount;
                }
                break;
            case FLASH_SALE:
                if (promotion.getDiscountPercentage() != null) {
                    discount = orderAmount.multiply(promotion.getDiscountPercentage())
                            .divide(BigDecimal.valueOf(100));
                    if (promotion.getMaxDiscountAmount() != null && 
                        discount.compareTo(promotion.getMaxDiscountAmount()) > 0) {
                        discount = promotion.getMaxDiscountAmount();
                    }
                }
                break;
            default:
                break;
        }

        return discount;
    }

    /**
     * Find best order-level promotion for a given order amount
     * @param orderAmount Total order amount
     * @return Best promotion offering maximum discount, or null if none applicable
     */
    public Promotion findBestOrderLevelPromotion(BigDecimal orderAmount) {
        List<Promotion> orderPromotions = getOrderLevelPromotions();
        
        Promotion bestPromotion = null;
        BigDecimal maxDiscount = BigDecimal.ZERO;

        for (Promotion promotion : orderPromotions) {
            BigDecimal discount = calculateOrderLevelDiscount(promotion, orderAmount);
            if (discount.compareTo(maxDiscount) > 0) {
                maxDiscount = discount;
                bestPromotion = promotion;
            }
        }

        return bestPromotion;
    }

    /**
     * Calculate product-level promotion discount
     * @param promotion The product-level promotion
     * @param productPrice Price per unit
     * @param quantity Quantity being purchased
     * @return Calculated discount amount
     */
    public BigDecimal calculateProductLevelDiscount(Promotion promotion, BigDecimal productPrice, Integer quantity) {
        if (promotion.getPromotionLevel() != Promotion.PromotionLevel.PRODUCT_LEVEL) {
            throw new IllegalArgumentException("Promotion is not a product-level promotion");
        }

        return calculatePromotionDiscount(promotion, productPrice, quantity);
    }
}
