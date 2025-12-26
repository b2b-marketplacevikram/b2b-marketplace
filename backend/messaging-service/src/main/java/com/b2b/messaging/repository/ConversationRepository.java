package com.b2b.messaging.repository;

import com.b2b.messaging.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findByBuyerIdAndSupplierId(Long buyerId, Long supplierId);
    
    List<Conversation> findByBuyerIdOrSupplierIdOrderByUpdatedAtDesc(Long buyerId, Long supplierId);
    
    @Query("SELECT c FROM Conversation c WHERE c.buyerId = ?1 OR c.supplierId = ?1 ORDER BY c.updatedAt DESC")
    List<Conversation> findByUserId(Long userId);
}
