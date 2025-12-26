package com.b2b.marketplace.product.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CategoryResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private Long parentId;
    private Boolean isActive;
    private Integer displayOrder;
    private String icon;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
