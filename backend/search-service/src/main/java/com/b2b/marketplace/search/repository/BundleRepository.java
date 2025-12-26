package com.b2b.marketplace.search.repository;

import com.b2b.marketplace.search.entity.Bundle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BundleRepository extends JpaRepository<Bundle, Long> {
    
    @Query("SELECT b FROM Bundle b WHERE b.isActive = true")
    List<Bundle> findAllActive();
    
    List<Bundle> findBySupplierId(Long supplierId);
    
    List<Bundle> findByIsActiveTrue();
    
    List<Bundle> findByIsFeaturedTrueAndIsActiveTrue();
}
