package com.b2b.marketplace.product.dto;

import lombok.Data;

@Data
public class ProductAttributeValueDTO {
    private Long id;
    private Long attributeId;
    private String attributeName;
    private String attributeDisplayName;
    private String attributeValue;
    private String unit;
    private String dataType;
}
