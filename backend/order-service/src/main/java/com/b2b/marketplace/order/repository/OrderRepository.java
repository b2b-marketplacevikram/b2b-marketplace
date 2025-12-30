package com.b2b.marketplace.order.repository;

import com.b2b.marketplace.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);
    List<Order> findBySupplierIdOrderByCreatedAtDesc(Long supplierId);
    List<Order> findBySupplierIdAndStatusOrderByCreatedAtDesc(Long supplierId, Order.OrderStatus status);
    List<Order> findByBuyerIdAndStatusOrderByCreatedAtDesc(Long buyerId, Order.OrderStatus status);
    List<Order> findBySupplierIdAndCreatedAtBetween(Long supplierId, LocalDateTime start, LocalDateTime end);
    
    // B2B Payment verification queries
    List<Order> findBySupplierIdAndPaymentStatus(Long supplierId, Order.PaymentStatus paymentStatus);
    List<Order> findByPoNumber(String poNumber);
    List<Order> findByPaymentTypeAndPaymentStatus(Order.PaymentType paymentType, Order.PaymentStatus paymentStatus);
}
