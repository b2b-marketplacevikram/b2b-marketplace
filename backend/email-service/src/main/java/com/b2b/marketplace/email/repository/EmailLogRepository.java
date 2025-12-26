package com.b2b.marketplace.email.repository;

import com.b2b.marketplace.email.entity.EmailLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {
    
    List<EmailLog> findByRecipient(String recipient);
    
    List<EmailLog> findByStatus(String status);
    
    List<EmailLog> findByEmailType(String emailType);
    
    List<EmailLog> findByOrderId(Long orderId);
    
    List<EmailLog> findByUserId(Long userId);
    
    List<EmailLog> findByStatusAndRetryCountLessThan(String status, Integer maxRetries);
    
    List<EmailLog> findBySentAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    Long countByStatus(String status);
    
    Long countByEmailType(String emailType);
}
