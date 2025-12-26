package com.b2b.marketplace.user.repository;

import com.b2b.marketplace.user.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findByUserId(Long userId);
    
    @Query("SELECT s FROM Supplier s JOIN s.user u WHERE u.email = :email")
    Optional<Supplier> findByEmail(@Param("email") String email);
}
