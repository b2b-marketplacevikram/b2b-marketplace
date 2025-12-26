package com.b2b.notification.repository;

import com.b2b.notification.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
    List<NotificationEntity> findByUserIdOrderByTimestampDesc(Long userId);
    List<NotificationEntity> findByUserIdAndReadFalseOrderByTimestampDesc(Long userId);
    long countByUserIdAndReadFalse(Long userId);
}
