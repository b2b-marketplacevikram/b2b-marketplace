package com.b2b.marketplace.product.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequest {
    private Long supplierId;
    private Long categoryId;
    private String name;
    private String description;
    private BigDecimal unitPrice;
    private String unit;
    private Integer moq;
    private Integer stockQuantity;
    private Integer leadTimeDays;
    private String origin;
    private String brand;
    private String model;
    private String specifications;
    private List<SpecificationDTO> specificationsList; // Dynamic specifications (legacy)
    private List<Long> classificationIds; // Classification classes assigned to product
    private List<ProductAttributeValueDTO> attributeValues; // Attribute values entered by supplier
    private Boolean isActive = true;
    private Boolean isFeatured = false;
    private List<String> imageUrls;
}
