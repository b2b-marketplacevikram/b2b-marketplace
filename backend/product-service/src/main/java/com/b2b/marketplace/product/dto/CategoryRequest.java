package com.b2b.marketplace.product.dto;

import lombok.Data;

@Data
public class CategoryRequest {
    private String name;
    private String slug;
    private String description;
    private Long parentId;
    private Boolean isActive = true;
    private Integer displayOrder = 0;
    private String icon;
    private String imageUrl;
}
