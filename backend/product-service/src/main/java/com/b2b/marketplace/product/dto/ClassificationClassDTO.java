package com.b2b.marketplace.product.dto;

import lombok.Data;
import java.util.List;

@Data
public class ClassificationClassDTO {
    private Long id;
    private String name;
    private String displayName;
    private String description;
    private Integer displayOrder;
    private List<ClassificationAttributeDTO> attributes;
}
