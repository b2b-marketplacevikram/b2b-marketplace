package com.b2b.marketplace.order.repository;

import com.b2b.marketplace.order.entity.SupplierBankDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierBankDetailsRepository extends JpaRepository<SupplierBankDetails, Long> {
    
    List<SupplierBankDetails> findBySupplierId(Long supplierId);
    
    Optional<SupplierBankDetails> findBySupplierIdAndIsPrimaryTrue(Long supplierId);
    
    Optional<SupplierBankDetails> findFirstBySupplierId(Long supplierId);
    
    boolean existsBySupplierId(Long supplierId);
}
