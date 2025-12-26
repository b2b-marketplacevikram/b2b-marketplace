package com.b2b.marketplace.product.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "promotions")
@Data
public class Promotion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PromotionType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "promotion_level")
    private PromotionLevel promotionLevel; // ORDER_LEVEL, PRODUCT_LEVEL

    @Column(name = "min_order_amount", precision = 10, scale = 2)
    private BigDecimal minOrderAmount; // For order-level promotions

    @Column(name = "max_discount_amount", precision = 10, scale = 2)
    private BigDecimal maxDiscountAmount; // Cap for percentage discounts

    @Column(name = "discount_percentage", precision = 5, scale = 2)
    private BigDecimal discountPercentage;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "buy_quantity")
    private Integer buyQuantity;

    @Column(name = "get_quantity")
    private Integer getQuantity;

    @Column(name = "valid_from", nullable = false)
    private LocalDateTime validFrom;

    @Column(name = "valid_until", nullable = false)
    private LocalDateTime validUntil;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "priority")
    private Integer priority = 0;

    @Column(name = "applicable_to")
    private String applicableTo; // ALL, SPECIFIC_PRODUCTS, SPECIFIC_CATEGORIES

    @Column(name = "product_ids", columnDefinition = "TEXT")
    private String productIds;

    @Column(name = "category_ids", columnDefinition = "TEXT")
    private String categoryIds;

    @Column(name = "banner_image_url")
    private String bannerImageUrl;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum PromotionType {
        PERCENTAGE_OFF, FIXED_AMOUNT_OFF, BUY_X_GET_Y, FLASH_SALE
    }

    public enum PromotionLevel {
        ORDER_LEVEL,    // Applied to entire order (e.g., 10% off orders above $100)
        PRODUCT_LEVEL   // Applied to specific products (e.g., Buy 2 Get 1 Free)
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        return isActive && 
               now.isAfter(validFrom) && 
               now.isBefore(validUntil);
    }
}
