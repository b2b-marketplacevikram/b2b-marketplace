package com.b2b.marketplace.search.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "bundles")
@Data
public class Bundle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "supplier_id")
    private Long supplierId;
    
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "discount_percentage")
    private BigDecimal discountPercentage;
    
    @Column(name = "original_price")
    private BigDecimal originalPrice;
    
    @Column(name = "bundle_price")
    private BigDecimal bundlePrice;
    
    @Column(name = "min_order_quantity")
    private Integer minOrderQuantity;
    
    @Column(name = "is_active")
    private Boolean isActive;
    
    @Column(name = "is_featured")
    private Boolean isFeatured;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
    
    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;
}
