package com.b2b.marketplace.order.repository;

import com.b2b.marketplace.order.entity.RefundTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefundTransactionRepository extends JpaRepository<RefundTransaction, Long> {
    
    Optional<RefundTransaction> findByTicketNumber(String ticketNumber);
    
    Optional<RefundTransaction> findByDisputeId(Long disputeId);
    
    boolean existsByTicketNumber(String ticketNumber);
}
