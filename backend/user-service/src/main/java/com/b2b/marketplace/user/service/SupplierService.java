package com.b2b.marketplace.user.service;

import com.b2b.marketplace.user.entity.Supplier;
import com.b2b.marketplace.user.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupplierService {
    
    private final SupplierRepository supplierRepository;

    public Supplier getSupplierById(Long id) {
        log.info("Fetching supplier by ID: {}", id);
        return supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));
    }

    public Supplier getSupplierByUserId(Long userId) {
        log.info("Fetching supplier by user ID: {}", userId);
        return supplierRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Supplier not found for user id: " + userId));
    }

    public Optional<Supplier> getSupplierByEmail(String email) {
        log.info("Fetching supplier by email: {}", email);
        return supplierRepository.findByEmail(email);
    }

    public Supplier saveSupplier(Supplier supplier) {
        log.info("Saving supplier: {}", supplier.getId());
        return supplierRepository.save(supplier);
    }
}
