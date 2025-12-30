package com.b2b.marketplace.order.repository;

import com.b2b.marketplace.order.entity.Dispute;
import com.b2b.marketplace.order.entity.Dispute.DisputeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DisputeRepository extends JpaRepository<Dispute, Long> {
    
    Optional<Dispute> findByTicketNumber(String ticketNumber);
    
    // Buyer queries
    List<Dispute> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);
    
    List<Dispute> findByBuyerIdAndStatusOrderByCreatedAtDesc(Long buyerId, DisputeStatus status);
    
    @Query("SELECT d FROM Dispute d WHERE d.buyerId = :buyerId AND d.status NOT IN ('CLOSED', 'RESOLVED') ORDER BY d.createdAt DESC")
    List<Dispute> findActiveBuyerDisputes(@Param("buyerId") Long buyerId);
    
    // Supplier queries
    List<Dispute> findBySupplierIdOrderByCreatedAtDesc(Long supplierId);
    
    List<Dispute> findBySupplierIdAndStatusOrderByCreatedAtDesc(Long supplierId, DisputeStatus status);
    
    @Query("SELECT d FROM Dispute d WHERE d.supplierId = :supplierId AND d.status NOT IN ('CLOSED', 'RESOLVED') ORDER BY d.createdAt DESC")
    List<Dispute> findActiveSupplierDisputes(@Param("supplierId") Long supplierId);
    
    // Order-related queries
    List<Dispute> findByOrderIdOrderByCreatedAtDesc(Long orderId);
    
    List<Dispute> findByOrderNumber(String orderNumber);
    
    @Query("SELECT COUNT(d) FROM Dispute d WHERE d.orderId = :orderId AND d.status NOT IN ('CLOSED', 'RESOLVED')")
    long countActiveDisputesForOrder(@Param("orderId") Long orderId);
    
    // Compliance queries (Indian E-Commerce Rules)
    @Query("SELECT d FROM Dispute d WHERE d.acknowledgedAt IS NULL AND d.acknowledgmentDeadline < :now")
    List<Dispute> findOverdueForAcknowledgment(@Param("now") LocalDateTime now);
    
    @Query("SELECT d FROM Dispute d WHERE d.resolvedAt IS NULL AND d.resolutionDeadline < :now AND d.status NOT IN ('CLOSED', 'RESOLVED')")
    List<Dispute> findOverdueForResolution(@Param("now") LocalDateTime now);
    
    @Query("SELECT d FROM Dispute d WHERE d.supplierId = :supplierId AND d.resolvedAt IS NULL AND d.resolutionDeadline < :now")
    List<Dispute> findOverdueDisputesForSupplier(@Param("supplierId") Long supplierId, @Param("now") LocalDateTime now);
    
    // Statistics
    @Query("SELECT COUNT(d) FROM Dispute d WHERE d.supplierId = :supplierId")
    long countTotalDisputesForSupplier(@Param("supplierId") Long supplierId);
    
    @Query("SELECT COUNT(d) FROM Dispute d WHERE d.supplierId = :supplierId AND d.status = 'OPEN'")
    long countOpenDisputesForSupplier(@Param("supplierId") Long supplierId);
    
    @Query("SELECT COUNT(d) FROM Dispute d WHERE d.supplierId = :supplierId AND d.status IN ('RESOLVED', 'CLOSED')")
    long countResolvedDisputesForSupplier(@Param("supplierId") Long supplierId);
    
    @Query("SELECT COUNT(d) FROM Dispute d WHERE d.supplierId = :supplierId AND d.escalationLevel > 0")
    long countEscalatedDisputesForSupplier(@Param("supplierId") Long supplierId);
    
    @Query("SELECT AVG(d.buyerSatisfactionRating) FROM Dispute d WHERE d.supplierId = :supplierId AND d.buyerSatisfactionRating IS NOT NULL")
    Double getAverageResolutionRatingForSupplier(@Param("supplierId") Long supplierId);
    
    // Escalated disputes
    @Query("SELECT d FROM Dispute d WHERE d.status = 'ESCALATED' ORDER BY d.escalatedAt DESC")
    List<Dispute> findAllEscalatedDisputes();
    
    @Query("SELECT d FROM Dispute d WHERE d.escalationLevel >= :level ORDER BY d.escalatedAt DESC")
    List<Dispute> findByEscalationLevelGreaterThanEqual(@Param("level") Integer level);
    
    // Pending acknowledgment (for compliance alerts)
    @Query("SELECT d FROM Dispute d WHERE d.acknowledgedAt IS NULL AND d.status = 'OPEN' ORDER BY d.createdAt ASC")
    List<Dispute> findPendingAcknowledgment();
}
