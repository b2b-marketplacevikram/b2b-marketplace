package com.b2b.marketplace.order.repository;

import com.b2b.marketplace.order.entity.Buyer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BuyerRepository extends JpaRepository<Buyer, Long> {
    
    @Query("SELECT b FROM Buyer b WHERE b.userId = :userId")
    Optional<Buyer> findByUserId(@Param("userId") Long userId);
}
