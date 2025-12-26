package com.b2b.notification.controller;

import com.b2b.notification.model.Notification;
import com.b2b.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Handle WebSocket connection
     */
    @MessageMapping("/connect")
    public void handleConnect(@Payload Map<String, Object> message, 
                             SimpMessageHeaderAccessor headerAccessor) {
        Long userId = ((Number) message.get("userId")).longValue();
        log.info("User {} connected to WebSocket", userId);
        headerAccessor.getSessionAttributes().put("userId", userId);
    }

    /**
     * REST endpoint to send notification (called by other services)
     */
    @PostMapping("/api/notifications/send")
    public ResponseEntity<Notification> sendNotification(@RequestBody Map<String, Object> request) {
        Long userId = ((Number) request.get("userId")).longValue();
        String type = (String) request.get("type");
        String title = (String) request.get("title");
        String message = (String) request.get("message");
        Long orderId = request.get("orderId") != null ? 
                      ((Number) request.get("orderId")).longValue() : null;
        String orderStatus = (String) request.get("orderStatus");
        String severity = request.get("severity") != null ? 
                         (String) request.get("severity") : "INFO";

        Notification notification = notificationService.sendNotificationToUser(
                userId, type, title, message, orderId, orderStatus, severity);

        return ResponseEntity.ok(notification);
    }

    /**
     * Get all notifications for a user
     */
    @GetMapping("/api/notifications/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    /**
     * Get unread notifications
     */
    @GetMapping("/api/notifications/user/{userId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    /**
     * Get unread count
     */
    @GetMapping("/api/notifications/user/{userId}/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(userId)));
    }

    /**
     * Mark notification as read
     */
    @PutMapping("/api/notifications/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    /**
     * Mark all as read
     */
    @PutMapping("/api/notifications/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Health check
     */
    @GetMapping("/api/notifications/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "notification-service",
                "websocket", "enabled"
        ));
    }
}
