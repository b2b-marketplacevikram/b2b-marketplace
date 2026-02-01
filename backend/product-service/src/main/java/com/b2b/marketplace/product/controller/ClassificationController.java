package com.b2b.marketplace.product.controller;

import com.b2b.marketplace.product.dto.ClassificationClassDTO;
import com.b2b.marketplace.product.service.ClassificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classifications")
@RequiredArgsConstructor
public class ClassificationController {

    private final ClassificationService classificationService;

    /**
     * Get all classification classes with their attributes
     * Used by suppliers when creating/editing products
     */
    @GetMapping
    public ResponseEntity<List<ClassificationClassDTO>> getAllClassifications() {
        List<ClassificationClassDTO> classifications = classificationService.getAllClassifications();
        return ResponseEntity.ok(classifications);
    }

    /**
     * Get classification attributes for specific product
     * Used to display specifications on product detail page
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ClassificationClassDTO>> getProductClassifications(
            @PathVariable Long productId) {
        List<ClassificationClassDTO> classifications = classificationService.getProductClassifications(productId);
        return ResponseEntity.ok(classifications);
    }
}
