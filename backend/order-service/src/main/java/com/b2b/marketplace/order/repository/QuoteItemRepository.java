package com.b2b.marketplace.order.repository;

import com.b2b.marketplace.order.entity.QuoteItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuoteItemRepository extends JpaRepository<QuoteItem, Long> {
    
    List<QuoteItem> findByQuoteId(Long quoteId);
    
    void deleteByQuoteId(Long quoteId);
}
