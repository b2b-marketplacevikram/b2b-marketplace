package com.b2b.marketplace.payment.repository;

import com.b2b.marketplace.payment.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    Optional<PaymentTransaction> findByTransactionId(String transactionId);
    List<PaymentTransaction> findByOrderId(Long orderId);
    List<PaymentTransaction> findByStatus(PaymentTransaction.TransactionStatus status);
}
