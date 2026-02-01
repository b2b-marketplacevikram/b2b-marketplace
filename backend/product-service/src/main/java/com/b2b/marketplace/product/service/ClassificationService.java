package com.b2b.marketplace.product.service;

import com.b2b.marketplace.product.dto.*;
import com.b2b.marketplace.product.entity.*;
import com.b2b.marketplace.product.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClassificationService {

    private final ClassificationClassRepository classificationClassRepository;
    private final ClassificationAttributeRepository classificationAttributeRepository;
    private final ProductClassificationRepository productClassificationRepository;
    private final ProductAttributeValueRepository productAttributeValueRepository;

    /**
     * Get all active classification classes with their attributes
     */
    @Transactional(readOnly = true)
    public List<ClassificationClassDTO> getAllClassifications() {
        List<ClassificationClass> classes = classificationClassRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
        
        return classes.stream().map(clazz -> {
            ClassificationClassDTO dto = new ClassificationClassDTO();
            dto.setId(clazz.getId());
            dto.setName(clazz.getName());
            dto.setDisplayName(clazz.getDisplayName());
            dto.setDescription(clazz.getDescription());
            dto.setDisplayOrder(clazz.getDisplayOrder());
            
            // Get attributes for this class
            List<ClassificationAttribute> attributes = classificationAttributeRepository
                    .findByClassIdAndIsActiveTrueOrderByDisplayOrderAsc(clazz.getId());
            
            List<ClassificationAttributeDTO> attributeDTOs = attributes.stream()
                    .map(this::mapToAttributeDTO)
                    .collect(Collectors.toList());
            
            dto.setAttributes(attributeDTOs);
            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * Get attributes for specific classification classes
     */
    @Transactional(readOnly = true)
    public Map<Long, List<ClassificationAttributeDTO>> getAttributesForClasses(List<Long> classIds) {
        List<ClassificationAttribute> attributes = classificationAttributeRepository
                .findByClassIdInAndIsActiveTrueOrderByClassIdAscDisplayOrderAsc(classIds);
        
        Map<Long, List<ClassificationAttributeDTO>> result = new HashMap<>();
        
        for (ClassificationAttribute attr : attributes) {
            result.computeIfAbsent(attr.getClassId(), k -> new ArrayList<>())
                   .add(mapToAttributeDTO(attr));
        }
        
        return result;
    }

    /**
     * Save product classifications and attribute values
     */
    @Transactional
    public void saveProductClassifications(Long productId, List<Long> classificationIds, 
                                          List<ProductAttributeValueDTO> attributeValues) {
        log.info("💾 Saving classifications for product {}", productId);
        log.info("  Classification IDs: {}", classificationIds);
        log.info("  Attribute Values: {}", attributeValues);
        
        // Delete existing classifications
        productClassificationRepository.deleteByProductId(productId);
        productAttributeValueRepository.deleteByProductId(productId);
        
        // Save new classifications
        if (classificationIds != null && !classificationIds.isEmpty()) {
            for (Long classId : classificationIds) {
                ProductClassification pc = new ProductClassification();
                pc.setProductId(productId);
                pc.setClassId(classId);
                productClassificationRepository.save(pc);
                log.info("  ✓ Saved classification: product={}, class={}", productId, classId);
            }
        }
        
        // Save attribute values
        if (attributeValues != null && !attributeValues.isEmpty()) {
            for (ProductAttributeValueDTO valueDTO : attributeValues) {
                if (valueDTO.getAttributeValue() != null && !valueDTO.getAttributeValue().trim().isEmpty()) {
                    ProductAttributeValue value = new ProductAttributeValue();
                    value.setProductId(productId);
                    value.setAttributeId(valueDTO.getAttributeId());
                    value.setAttributeValue(valueDTO.getAttributeValue());
                    productAttributeValueRepository.save(value);
                    log.info("  ✓ Saved attribute value: attr={}, value={}", valueDTO.getAttributeId(), valueDTO.getAttributeValue());
                }
            }
        }
        
        log.info("✅ Completed saving classifications for product {}", productId);
    }

    /**
     * Get product classifications with values
     */
    @Transactional(readOnly = true)
    public List<ClassificationClassDTO> getProductClassifications(Long productId) {
        // Get assigned classes
        List<ProductClassification> productClasses = productClassificationRepository.findByProductId(productId);
        List<Long> classIds = productClasses.stream()
                .map(ProductClassification::getClassId)
                .collect(Collectors.toList());
        
        if (classIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Get attribute values
        List<ProductAttributeValue> attributeValues = productAttributeValueRepository.findByProductId(productId);
        Map<Long, String> valueMap = attributeValues.stream()
                .collect(Collectors.toMap(
                    ProductAttributeValue::getAttributeId,
                    ProductAttributeValue::getAttributeValue
                ));
        
        // Build response
        List<ClassificationClassDTO> result = new ArrayList<>();
        
        for (Long classId : classIds) {
            ClassificationClass clazz = classificationClassRepository.findById(classId).orElse(null);
            if (clazz == null) continue;
            
            ClassificationClassDTO classDTO = new ClassificationClassDTO();
            classDTO.setId(clazz.getId());
            classDTO.setName(clazz.getName());
            classDTO.setDisplayName(clazz.getDisplayName());
            classDTO.setDescription(clazz.getDescription());
            
            // Get attributes with values
            List<ClassificationAttribute> attributes = classificationAttributeRepository
                    .findByClassIdAndIsActiveTrueOrderByDisplayOrderAsc(classId);
            
            List<ClassificationAttributeDTO> attributeDTOs = attributes.stream()
                    .map(attr -> {
                        ClassificationAttributeDTO dto = mapToAttributeDTO(attr);
                        // Set the actual value from the product_attribute_values table
                        String value = valueMap.get(attr.getId());
                        if (value != null) {
                            dto.setValue(value);
                        }
                        return dto;
                    })
                    .collect(Collectors.toList());
            
            classDTO.setAttributes(attributeDTOs);
            result.add(classDTO);
        }
        
        return result;
    }

    private ClassificationAttributeDTO mapToAttributeDTO(ClassificationAttribute attr) {
        ClassificationAttributeDTO dto = new ClassificationAttributeDTO();
        dto.setId(attr.getId());
        dto.setClassId(attr.getClassId());
        dto.setName(attr.getName());
        dto.setDisplayName(attr.getDisplayName());
        dto.setDataType(attr.getDataType() != null ? attr.getDataType().name() : "TEXT");
        dto.setUnit(attr.getUnit());
        dto.setAllowedValues(attr.getAllowedValues());
        dto.setIsRequired(attr.getIsRequired());
        dto.setDisplayOrder(attr.getDisplayOrder());
        dto.setHelpText(attr.getHelpText());
        return dto;
    }
}
