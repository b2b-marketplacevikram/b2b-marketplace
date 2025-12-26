package com.b2b.marketplace.product.repository;

import com.b2b.marketplace.product.entity.Bundle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BundleRepository extends JpaRepository<Bundle, Long> {
    
    List<Bundle> findBySupplierId(Long supplierId);
    
    List<Bundle> findByIsActiveTrue();
    
    List<Bundle> findByIsFeaturedTrueAndIsActiveTrue();
    
    @Query("SELECT b FROM Bundle b WHERE b.isActive = true AND b.name LIKE %:keyword%")
    List<Bundle> searchByKeyword(@Param("keyword") String keyword);
    
    @Query("SELECT b FROM Bundle b JOIN b.items bi WHERE bi.productId = :productId AND b.isActive = true")
    List<Bundle> findByProductId(@Param("productId") Long productId);
}
