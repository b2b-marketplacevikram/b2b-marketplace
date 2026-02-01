package com.b2b.marketplace.product.repository;

import com.b2b.marketplace.product.entity.ProductClassification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductClassificationRepository extends JpaRepository<ProductClassification, Long> {
    List<ProductClassification> findByProductId(Long productId);
    void deleteByProductId(Long productId);
    void deleteByProductIdAndClassId(Long productId, Long classId);
}
