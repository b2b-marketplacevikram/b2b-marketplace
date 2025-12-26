package com.b2b.marketplace.product.repository;

import com.b2b.marketplace.product.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    
    @Query("SELECT s FROM Supplier s WHERE s.userId = :userId")
    Optional<Supplier> findByUserId(@Param("userId") Long userId);
}
