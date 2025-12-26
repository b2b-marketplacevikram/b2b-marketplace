package com.b2b.notification.service;

import com.b2b.notification.entity.NotificationEntity;
import com.b2b.notification.model.Notification;
import com.b2b.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Send a notification to a specific user via WebSocket and save to database
     */
    public Notification sendNotificationToUser(Long userId, String type, String title, 
                                               String message, Long orderId, String orderStatus, 
                                               String severity) {
        log.info("Sending notification to user {}: {}", userId, title);

        // Create and save notification entity
        NotificationEntity entity = new NotificationEntity();
        entity.setUserId(userId);
        entity.setType(type);
        entity.setTitle(title);
        entity.setMessage(message);
        entity.setOrderId(orderId);
        entity.setOrderStatus(orderStatus);
        entity.setTimestamp(LocalDateTime.now());
        entity.setRead(false);
        entity.setSeverity(severity);

        entity = notificationRepository.save(entity);

        // Convert to DTO
        Notification notification = convertToDto(entity);

        // Send via WebSocket to specific user
        messagingTemplate.convertAndSend("/topic/user/" + userId, notification);

        return notification;
    }

    /**
     * Send order status update notification
     */
    public Notification sendOrderStatusUpdate(Long userId, Long orderId, String oldStatus, 
                                              String newStatus, String userType) {
        String title = "Order Status Updated";
        String message = String.format("Your order #%d status changed from %s to %s", 
                                      orderId, oldStatus, newStatus);
        
        String severity = "INFO";
        if ("DELIVERED".equals(newStatus)) {
            severity = "SUCCESS";
            title = "Order Delivered!";
            message = String.format("Your order #%d has been delivered successfully", orderId);
        } else if ("CANCELLED".equals(newStatus)) {
            severity = "WARNING";
            title = "Order Cancelled";
            message = String.format("Order #%d has been cancelled", orderId);
        }

        return sendNotificationToUser(userId, "ORDER_STATUS_CHANGED", title, message, 
                                     orderId, newStatus, severity);
    }

    /**
     * Get all notifications for a user
     */
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByTimestampDesc(userId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get unread notifications for a user
     */
    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndReadFalseOrderByTimestampDesc(userId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get unread notification count
     */
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    /**
     * Mark notification as read
     */
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    /**
     * Mark all notifications as read for a user
     */
    public void markAllAsRead(Long userId) {
        List<NotificationEntity> notifications = 
            notificationRepository.findByUserIdAndReadFalseOrderByTimestampDesc(userId);
        
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    /**
     * Convert entity to DTO
     */
    private Notification convertToDto(NotificationEntity entity) {
        return new Notification(
                entity.getId(),
                entity.getType(),
                entity.getTitle(),
                entity.getMessage(),
                entity.getUserId(),
                entity.getOrderId(),
                entity.getOrderStatus(),
                entity.getTimestamp(),
                entity.isRead(),
                entity.getSeverity()
        );
    }
}
