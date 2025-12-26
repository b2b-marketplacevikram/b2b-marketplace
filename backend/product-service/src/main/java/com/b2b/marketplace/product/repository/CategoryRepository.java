package com.b2b.marketplace.product.repository;

import com.b2b.marketplace.product.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    Optional<Category> findBySlug(String slug);
    
    List<Category> findByIsActiveTrue();
    
    List<Category> findByParentIdIsNull();
    
    List<Category> findByParentId(Long parentId);
    
    boolean existsBySlug(String slug);
}
