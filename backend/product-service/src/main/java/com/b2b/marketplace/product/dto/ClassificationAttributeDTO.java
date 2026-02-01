package com.b2b.marketplace.product.dto;

import lombok.Data;

@Data
public class ClassificationAttributeDTO {
    private Long id;
    private Long classId;
    private String name;
    private String displayName;
    private String dataType;
    private String unit;
    private String allowedValues;
    private Boolean isRequired;
    private Integer displayOrder;
    private String helpText;
    private String value;  // The actual value entered by supplier for this product
}
