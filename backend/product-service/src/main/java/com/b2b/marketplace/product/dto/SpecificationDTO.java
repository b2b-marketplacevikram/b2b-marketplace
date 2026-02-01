package com.b2b.marketplace.product.dto;

import lombok.Data;

@Data
public class SpecificationDTO {
    private Long id;
    private String category;
    private String attributeName;
    private String attributeValue;
    private Integer displayOrder;
}
