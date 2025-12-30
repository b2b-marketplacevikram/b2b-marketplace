package com.b2b.marketplace.order.repository;

import com.b2b.marketplace.order.entity.Quote;
import com.b2b.marketplace.order.entity.Quote.QuoteStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuoteRepository extends JpaRepository<Quote, Long> {
    
    Optional<Quote> findByQuoteNumber(String quoteNumber);
    
    // Buyer queries
    List<Quote> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);
    
    List<Quote> findByBuyerIdAndStatusOrderByCreatedAtDesc(Long buyerId, QuoteStatus status);
    
    @Query("SELECT q FROM Quote q WHERE q.buyerId = :buyerId AND q.status IN :statuses ORDER BY q.createdAt DESC")
    List<Quote> findByBuyerIdAndStatusIn(@Param("buyerId") Long buyerId, @Param("statuses") List<QuoteStatus> statuses);
    
    // Supplier queries
    List<Quote> findBySupplierIdOrderByCreatedAtDesc(Long supplierId);
    
    List<Quote> findBySupplierIdAndStatusOrderByCreatedAtDesc(Long supplierId, QuoteStatus status);
    
    @Query("SELECT q FROM Quote q WHERE q.supplierId = :supplierId AND q.status IN :statuses ORDER BY q.createdAt DESC")
    List<Quote> findBySupplierIdAndStatusIn(@Param("supplierId") Long supplierId, @Param("statuses") List<QuoteStatus> statuses);
    
    // Count queries
    long countByBuyerIdAndStatus(Long buyerId, QuoteStatus status);
    
    long countBySupplierIdAndStatus(Long supplierId, QuoteStatus status);
    
    // Pending quotes for supplier (needs attention)
    @Query("SELECT q FROM Quote q WHERE q.supplierId = :supplierId AND q.status = 'PENDING' ORDER BY q.createdAt ASC")
    List<Quote> findPendingQuotesForSupplier(@Param("supplierId") Long supplierId);
    
    // Expiring soon (within 3 days)
    @Query("SELECT q FROM Quote q WHERE q.supplierId = :supplierId AND q.status IN ('PENDING', 'SUPPLIER_RESPONDED', 'NEGOTIATING') AND q.validUntil <= :expiryDate ORDER BY q.validUntil ASC")
    List<Quote> findExpiringSoon(@Param("supplierId") Long supplierId, @Param("expiryDate") LocalDate expiryDate);
    
    // Expired quotes to update status
    @Query("SELECT q FROM Quote q WHERE q.status NOT IN ('CONVERTED', 'REJECTED', 'CANCELLED', 'EXPIRED') AND q.validUntil < :today")
    List<Quote> findExpiredQuotes(@Param("today") LocalDate today);
    
    // Analytics
    @Query("SELECT COUNT(q) FROM Quote q WHERE q.supplierId = :supplierId AND q.status = 'CONVERTED'")
    long countConvertedQuotes(@Param("supplierId") Long supplierId);
    
    @Query("SELECT COALESCE(SUM(q.finalTotal), 0) FROM Quote q WHERE q.supplierId = :supplierId AND q.status = 'CONVERTED'")
    java.math.BigDecimal sumConvertedQuoteValue(@Param("supplierId") Long supplierId);
}
