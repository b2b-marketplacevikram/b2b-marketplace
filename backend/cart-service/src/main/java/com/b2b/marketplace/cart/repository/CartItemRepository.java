package com.b2b.marketplace.cart.repository;

import com.b2b.marketplace.cart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    List<CartItem> findByBuyerId(Long buyerId);
    
    Optional<CartItem> findByBuyerIdAndProductId(Long buyerId, Long productId);
    
    @Modifying
    @Query("DELETE FROM CartItem c WHERE c.buyerId = :buyerId")
    void deleteByBuyerId(Long buyerId);
    
    @Query("SELECT COUNT(c) FROM CartItem c WHERE c.buyerId = :buyerId")
    Integer countByBuyerId(Long buyerId);
    
    @Modifying
    @Query("DELETE FROM CartItem c WHERE c.buyerId = :buyerId AND c.productId = :productId")
    void deleteByBuyerIdAndProductId(Long buyerId, Long productId);
}
