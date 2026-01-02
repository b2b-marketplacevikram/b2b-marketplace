package com.b2b.marketplace.order.repository;

import com.b2b.marketplace.order.entity.BuyerBankDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BuyerBankDetailsRepository extends JpaRepository<BuyerBankDetails, Long> {
    List<BuyerBankDetails> findByBuyerId(Long buyerId);
    Optional<BuyerBankDetails> findByBuyerIdAndIsPrimaryTrue(Long buyerId);
    Optional<BuyerBankDetails> findFirstByBuyerId(Long buyerId);
    boolean existsByBuyerId(Long buyerId);
}
