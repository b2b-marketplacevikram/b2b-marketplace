package com.b2b.marketplace.user.controller;

import com.b2b.marketplace.user.entity.Supplier;
import com.b2b.marketplace.user.service.SupplierService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SupplierController {
    
    private final SupplierService supplierService;

    @GetMapping("/{id}")
    public ResponseEntity<Supplier> getSupplierById(@PathVariable Long id) {
        log.info("Fetching supplier with ID: {}", id);
        try {
            Supplier supplier = supplierService.getSupplierById(id);
            return ResponseEntity.ok(supplier);
        } catch (RuntimeException e) {
            log.error("Error fetching supplier: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Supplier> getSupplierByUserId(@PathVariable Long userId) {
        log.info("Fetching supplier for user ID: {}", userId);
        try {
            Supplier supplier = supplierService.getSupplierByUserId(userId);
            return ResponseEntity.ok(supplier);
        } catch (RuntimeException e) {
            log.error("Error fetching supplier: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Supplier> getSupplierByEmail(@PathVariable String email) {
        log.info("Fetching supplier for email: {}", email);
        return supplierService.getSupplierByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
