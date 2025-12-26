package com.b2b.messaging.repository;

import com.b2b.messaging.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversationIdOrderBySentAtAsc(Long conversationId);
    
    List<Message> findByConversationIdAndReceiverIdAndReadFalse(Long conversationId, Long receiverId);
    
    long countByConversationIdAndReceiverIdAndReadFalse(Long conversationId, Long receiverId);
}
