package com.b2b.marketplace.product.repository;

import com.b2b.marketplace.product.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND p.validFrom <= :now AND p.validUntil >= :now ORDER BY p.priority DESC")
    List<Promotion> findActivePromotions(LocalDateTime now);
    
    List<Promotion> findByIsActiveTrue();
}
