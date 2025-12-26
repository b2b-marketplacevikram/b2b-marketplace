package com.b2b.marketplace.search.repository;

import com.b2b.marketplace.search.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    @Query("SELECT p FROM Product p WHERE p.isActive = true")
    List<Product> findAllActive();
    
    @Query("SELECT p FROM Product p WHERE p.categoryId = :categoryId AND p.isActive = true")
    List<Product> findByCategoryId(Long categoryId);
}
