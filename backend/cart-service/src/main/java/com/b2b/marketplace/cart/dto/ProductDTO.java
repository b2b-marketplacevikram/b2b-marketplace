package com.b2b.marketplace.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long id;
    private String name;
    private String description;
    private BigDecimal unitPrice;  // Changed from 'price' to match ProductResponse
    private Integer stockQuantity;
    private List<ProductImageDTO> images;  // Changed to match ProductResponse structure
    private Long supplierId;
    private String supplierName;
    
    // Helper method for backward compatibility
    public BigDecimal getPrice() {
        return unitPrice;
    }
    
    public void setPrice(BigDecimal price) {
        this.unitPrice = price;
    }
    
    // Helper method to get first image URL
    public String getImageUrl() {
        if (images != null && !images.isEmpty()) {
            return images.get(0).getImageUrl();
        }
        return null;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductImageDTO {
        private Long id;
        private String imageUrl;
        private Integer displayOrder;
    }
}
