package com.b2b.marketplace.product.repository;

import com.b2b.marketplace.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    List<Product> findBySupplierId(Long supplierId);
    
    List<Product> findByCategoryId(Long categoryId);
    
    List<Product> findByIsActiveTrue();
    
    List<Product> findByIsFeaturedTrue();
    
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Product> searchByKeyword(@Param("keyword") String keyword);
    
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "p.categoryId = :categoryId AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Product> searchByCategoryAndKeyword(
        @Param("categoryId") Long categoryId, 
        @Param("keyword") String keyword
    );
    
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "p.unitPrice BETWEEN :minPrice AND :maxPrice")
    List<Product> findByPriceRange(
        @Param("minPrice") BigDecimal minPrice, 
        @Param("maxPrice") BigDecimal maxPrice
    );
    
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "p.categoryId = :categoryId AND " +
           "p.unitPrice BETWEEN :minPrice AND :maxPrice")
    List<Product> findByCategoryAndPriceRange(
        @Param("categoryId") Long categoryId,
        @Param("minPrice") BigDecimal minPrice, 
        @Param("maxPrice") BigDecimal maxPrice
    );
    
    @Query("SELECT p FROM Product p WHERE p.isActive = true " +
           "ORDER BY p.averageRating DESC, p.reviewCount DESC")
    List<Product> findTopRatedProducts();
}
