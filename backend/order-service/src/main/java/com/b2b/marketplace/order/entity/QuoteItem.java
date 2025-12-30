package com.b2b.marketplace.order.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Quote item entity for individual products in a quote.
 */
@Entity
@Table(name = "quote_items")
@Data
public class QuoteItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quote_id", nullable = false)
    private Quote quote;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "product_image")
    private String productImage;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "requested_quantity")
    private Integer requestedQuantity;

    @Column(name = "original_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "quoted_price", precision = 12, scale = 2)
    private BigDecimal quotedPrice;

    @Column(name = "final_price", precision = 12, scale = 2)
    private BigDecimal finalPrice;

    @Column(name = "unit")
    private String unit = "piece";

    @Column(columnDefinition = "TEXT")
    private String specifications;

    @Column(name = "supplier_notes", columnDefinition = "TEXT")
    private String supplierNotes;

    @Column(name = "lead_time_days")
    private Integer leadTimeDays;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (requestedQuantity == null) {
            requestedQuantity = quantity;
        }
    }

    public BigDecimal getLineTotal() {
        BigDecimal price = finalPrice != null ? finalPrice : 
                          (quotedPrice != null ? quotedPrice : originalPrice);
        return price.multiply(BigDecimal.valueOf(quantity));
    }
}
