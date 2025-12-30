package com.b2b.marketplace.order.repository;

import com.b2b.marketplace.order.entity.QuoteMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuoteMessageRepository extends JpaRepository<QuoteMessage, Long> {
    
    List<QuoteMessage> findByQuoteIdOrderByCreatedAtAsc(Long quoteId);
    
    @Query("SELECT COUNT(m) FROM QuoteMessage m WHERE m.quote.id = :quoteId AND m.isRead = false AND m.senderId != :userId")
    long countUnreadMessages(@Param("quoteId") Long quoteId, @Param("userId") Long userId);
    
    @Modifying
    @Query("UPDATE QuoteMessage m SET m.isRead = true WHERE m.quote.id = :quoteId AND m.senderId != :userId")
    void markMessagesAsRead(@Param("quoteId") Long quoteId, @Param("userId") Long userId);
}
