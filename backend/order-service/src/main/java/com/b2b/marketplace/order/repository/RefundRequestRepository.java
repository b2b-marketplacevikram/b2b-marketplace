package com.b2b.marketplace.order.repository;

import com.b2b.marketplace.order.entity.RefundRequest;
import com.b2b.marketplace.order.entity.RefundRequest.RefundStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RefundRequestRepository extends JpaRepository<RefundRequest, Long> {
    List<RefundRequest> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);
    List<RefundRequest> findBySupplierIdOrderByCreatedAtDesc(Long supplierId);
    List<RefundRequest> findByBuyerIdAndStatusOrderByCreatedAtDesc(Long buyerId, RefundStatus status);
    Optional<RefundRequest> findByOrderId(Long orderId);
    Optional<RefundRequest> findByOrderNumber(String orderNumber);
    boolean existsByOrderIdAndStatusIn(Long orderId, List<RefundStatus> statuses);
}
