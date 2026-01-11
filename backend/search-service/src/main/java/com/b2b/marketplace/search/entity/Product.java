package com.b2b.marketplace.search.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    
    @Column(length = 2000)
    private String description;
    
    private String sku;
    
    @Column(name = "unit_price")
    private BigDecimal unitPrice;
    
    private Integer moq;
    
    @Column(name = "stock_quantity")
    private Integer stockQuantity;
    
    @Column(name = "category_id")
    private Long categoryId;
    
    @Column(name = "supplier_id")
    private Long supplierId;
    
    private String origin;
    
    @Column(name = "average_rating")
    private Double averageRating;
    
    @Column(name = "review_count")
    private Integer reviewCount;
    
    @Column(name = "is_featured")
    private Boolean isFeatured;
    
    @Column(name = "is_active")
    private Boolean isActive;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id")
    private List<ProductImage> images;
}
