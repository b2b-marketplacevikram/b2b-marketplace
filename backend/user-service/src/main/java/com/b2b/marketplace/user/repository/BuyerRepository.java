package com.b2b.marketplace.user.repository;

import com.b2b.marketplace.user.entity.Buyer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BuyerRepository extends JpaRepository<Buyer, Long> {
    Optional<Buyer> findByUserId(Long userId);
    
    @Query("SELECT b FROM Buyer b JOIN b.user u WHERE u.email = :email")
    Optional<Buyer> findByEmail(@Param("email") String email);
}
