package com.b2b.marketplace.product.repository;

import com.b2b.marketplace.product.entity.ProductAttributeValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductAttributeValueRepository extends JpaRepository<ProductAttributeValue, Long> {
    List<ProductAttributeValue> findByProductId(Long productId);
    Optional<ProductAttributeValue> findByProductIdAndAttributeId(Long productId, Long attributeId);
    void deleteByProductId(Long productId);
}
