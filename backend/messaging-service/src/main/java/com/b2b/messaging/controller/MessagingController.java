package com.b2b.messaging.controller;

import com.b2b.messaging.entity.Conversation;
import com.b2b.messaging.model.ChatMessage;
import com.b2b.messaging.model.ConversationDTO;
import com.b2b.messaging.service.MessagingService;
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
public class MessagingController {

    private final MessagingService messagingService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        log.info("Received message via WebSocket: {}", chatMessage);
        messagingService.sendMessage(chatMessage);
    }

    @MessageMapping("/chat.typing")
    public void sendTypingIndicator(@Payload Map<String, Object> payload) {
        Long conversationId = ((Number) payload.get("conversationId")).longValue();
        Long senderId = ((Number) payload.get("senderId")).longValue();
        Long receiverId = ((Number) payload.get("receiverId")).longValue();
        
        messagingService.sendTypingIndicator(conversationId, senderId, receiverId);
    }

    @PostMapping("/api/messages/send")
    public ResponseEntity<ChatMessage> sendMessageRest(@RequestBody ChatMessage chatMessage) {
        log.info("Received message via REST: {}", chatMessage);
        ChatMessage sent = messagingService.sendMessage(chatMessage);
        return ResponseEntity.ok(sent);
    }

    @GetMapping("/api/conversations/user/{userId}")
    public ResponseEntity<List<ConversationDTO>> getUserConversations(@PathVariable Long userId) {
        return ResponseEntity.ok(messagingService.getUserConversations(userId));
    }

    @GetMapping("/api/conversations/{conversationId}/messages")
    public ResponseEntity<List<ChatMessage>> getConversationMessages(
            @PathVariable Long conversationId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(messagingService.getConversationMessages(conversationId, userId));
    }

    @PutMapping("/api/conversations/{conversationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long conversationId,
            @RequestParam Long userId) {
        messagingService.markMessagesAsRead(conversationId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/api/conversations/between")
    public ResponseEntity<Conversation> getConversation(
            @RequestParam Long buyerId,
            @RequestParam Long supplierId) {
        return messagingService.getConversation(buyerId, supplierId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/api/conversations/create")
    public ResponseEntity<Conversation> createConversation(@RequestBody Map<String, Long> request) {
        // Support both user1Id/user2Id and buyerId/supplierId parameter names
        Long user1Id = request.get("user1Id") != null ? request.get("user1Id") : request.get("buyerId");
        Long user2Id = request.get("user2Id") != null ? request.get("user2Id") : request.get("supplierId");
        Conversation conversation = messagingService.getOrCreateConversation(user1Id, user2Id);
        return ResponseEntity.ok(conversation);
    }

    @DeleteMapping("/api/conversations/{conversationId}/clear")
    public ResponseEntity<Map<String, String>> clearConversation(
            @PathVariable Long conversationId,
            @RequestParam Long userId) {
        log.info("Clear conversation request: conversationId={}, userId={}", conversationId, userId);
        messagingService.clearConversation(conversationId, userId);
        return ResponseEntity.ok(Map.of(
            "status", "success",
            "message", "Conversation cleared. Data will be retained for 6 months."
        ));
    }

    @PostMapping("/api/conversations/{conversationId}/restore")
    public ResponseEntity<Map<String, String>> restoreConversation(
            @PathVariable Long conversationId,
            @RequestParam Long userId) {
        log.info("Restore conversation request: conversationId={}, userId={}", conversationId, userId);
        messagingService.restoreConversation(conversationId, userId);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Conversation restored"));
    }

    @GetMapping("/api/messaging/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "messaging-service",
            "websocket", "enabled"
        ));
    }
}
