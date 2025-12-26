package com.b2b.marketplace.search.document;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Data
public class BundleDocument {
    private String id;
    private Long bundleId;
    private String docType = "bundle";
    private String name;
    private String description;
    private Long supplierId;
    private String supplierName;
    private BigDecimal discountPercentage;
    private BigDecimal originalPrice;
    private BigDecimal bundlePrice;
    private Integer totalItems;
    private Integer minOrderQuantity;
    private Boolean isFeatured;
    private Boolean isActive;
    private String imageUrl;
    private List<Long> productIds;
    private List<String> productNames;
    private Date createdAt;
    private Date updatedAt;
}
