package com.b2b.marketplace.product.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "supplier_id", nullable = false)
    private Long supplierId;

    @Column(name = "category_id")
    private Long categoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    private Category category;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(unique = true, length = 255)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "unit_price", precision = 10, scale = 2)
    private BigDecimal unitPrice;
    
    // GST Compliance - MRP for products that have MRP
    @Column(name = "mrp", precision = 10, scale = 2)
    private BigDecimal mrp;

    @Column(length = 50)
    private String unit;

    @Column(name = "moq")
    private Integer moq; // Minimum Order Quantity

    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    @Column(name = "lead_time_days")
    private Integer leadTimeDays;

    // E-Commerce Rules 2020 - Country of Origin (mandatory)
    @Column(name = "country_of_origin", length = 100)
    private String countryOfOrigin;
    
    // Legacy field - kept for backward compatibility
    @Column(length = 100)
    private String origin;

    @Column(length = 100)
    private String brand;

    @Column(length = 50)
    private String model;
    
    // GST Compliance - HSN Code (mandatory for GST invoices)
    @Column(name = "hsn_code", length = 10)
    private String hsnCode;
    
    // GST Rate (5%, 12%, 18%, 28%)
    @Column(name = "gst_rate", precision = 5, scale = 2)
    private BigDecimal gstRate;
    
    // Legal Metrology - Manufacturing Date
    @Column(name = "manufacturing_date")
    private LocalDate manufacturingDate;
    
    // Legal Metrology - Expiry Date / Best Before
    @Column(name = "expiry_date")
    private LocalDate expiryDate;
    
    // Legal Metrology - Net Quantity
    @Column(name = "net_quantity", length = 50)
    private String netQuantity;
    
    // Legal Metrology - Package Dimensions
    @Column(name = "weight_kg", precision = 10, scale = 3)
    private BigDecimal weightKg;
    
    @Column(name = "length_cm", precision = 10, scale = 2)
    private BigDecimal lengthCm;
    
    @Column(name = "width_cm", precision = 10, scale = 2)
    private BigDecimal widthCm;
    
    @Column(name = "height_cm", precision = 10, scale = 2)
    private BigDecimal heightCm;
    
    // Warranty Information
    @Column(name = "warranty_months")
    private Integer warrantyMonths;
    
    @Column(name = "warranty_terms", length = 500)
    private String warrantyTerms;
    
    // Manufacturer Details
    @Column(name = "manufacturer_name", length = 200)
    private String manufacturerName;
    
    @Column(name = "manufacturer_address", length = 500)
    private String manufacturerAddress;
    
    // Importer Details (for imported products)
    @Column(name = "importer_name", length = 200)
    private String importerName;
    
    @Column(name = "importer_address", length = 500)
    private String importerAddress;

    @Column(columnDefinition = "JSON")
    private String specifications;

    @Column(name = "is_active", columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean isActive = true;

    @Column(name = "is_featured", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isFeatured = false;

    @Column(name = "average_rating")
    private Double averageRating;

    @Column(name = "review_count")
    private Integer reviewCount = 0;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductImage> images = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
