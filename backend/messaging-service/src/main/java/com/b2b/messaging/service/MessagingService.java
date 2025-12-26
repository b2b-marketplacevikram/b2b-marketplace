package com.b2b.messaging.service;

import com.b2b.messaging.entity.Conversation;
import com.b2b.messaging.entity.Message;
import com.b2b.messaging.model.ChatMessage;
import com.b2b.messaging.model.ConversationDTO;
import com.b2b.messaging.repository.ConversationRepository;
import com.b2b.messaging.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessagingService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final RestTemplate restTemplate = new RestTemplate();
    
    private static final String USER_SERVICE_URL = "http://localhost:8081/api/users";

    @Transactional
    public ChatMessage sendMessage(ChatMessage chatMessage) {
        log.info("Sending message from {} to {}", chatMessage.getSenderId(), chatMessage.getReceiverId());

        // Get or create conversation
        Conversation conversation = getOrCreateConversation(
            chatMessage.getSenderId(), 
            chatMessage.getReceiverId()
        );

        // Save message
        Message message = new Message();
        message.setConversationId(conversation.getId());
        message.setSenderId(chatMessage.getSenderId());
        message.setReceiverId(chatMessage.getReceiverId());
        message.setContent(chatMessage.getContent());
        message.setRead(false);

        message = messageRepository.save(message);

        // Update conversation
        conversation.setLastMessage(chatMessage.getContent());
        conversation.setLastMessageId(message.getId());
        conversation.setUpdatedAt(LocalDateTime.now());
        
        // Increment unread count for receiver
        if (chatMessage.getReceiverId().equals(conversation.getBuyerId())) {
            conversation.setUnreadCountBuyer(conversation.getUnreadCountBuyer() + 1);
        } else {
            conversation.setUnreadCountSupplier(conversation.getUnreadCountSupplier() + 1);
        }
        
        conversationRepository.save(conversation);

        // Convert to DTO
        ChatMessage responseMessage = convertToDTO(message);
        responseMessage.setConversationId(conversation.getId());

        // Send via WebSocket to receiver
        messagingTemplate.convertAndSendToUser(
            chatMessage.getReceiverId().toString(),
            "/queue/messages",
            responseMessage
        );

        return responseMessage;
    }

    public List<ConversationDTO> getUserConversations(Long userId) {
        log.info("Getting conversations for user {}", userId);
        
        List<Conversation> conversations = conversationRepository.findByUserId(userId);
        List<ConversationDTO> conversationDTOs = new ArrayList<>();

        for (Conversation conv : conversations) {
            // Skip conversations that have been cleared by this user (unless new messages arrived)
            if (userId.equals(conv.getBuyerId()) && conv.getClearedByBuyer() != null) {
                // Skip if no new messages after clearing (updatedAt <= clearedByBuyer)
                if (!conv.getUpdatedAt().isAfter(conv.getClearedByBuyer())) {
                    log.info("Skipping conversation {} for buyer {} - cleared at {}, last update {}", 
                        conv.getId(), userId, conv.getClearedByBuyer(), conv.getUpdatedAt());
                    continue;
                }
            } else if (userId.equals(conv.getSupplierId()) && conv.getClearedBySupplier() != null) {
                // Skip if no new messages after clearing (updatedAt <= clearedBySupplier)
                if (!conv.getUpdatedAt().isAfter(conv.getClearedBySupplier())) {
                    log.info("Skipping conversation {} for supplier {} - cleared at {}, last update {}", 
                        conv.getId(), userId, conv.getClearedBySupplier(), conv.getUpdatedAt());
                    continue;
                }
            }

            ConversationDTO dto = new ConversationDTO();
            dto.setId(conv.getId());
            dto.setBuyerId(conv.getBuyerId());
            dto.setSupplierId(conv.getSupplierId());
            dto.setLastMessage(conv.getLastMessage());
            dto.setCreatedAt(conv.getCreatedAt());
            dto.setUpdatedAt(conv.getUpdatedAt());

            // Fetch user names
            Map<String, Object> buyer = fetchUserDetails(conv.getBuyerId());
            Map<String, Object> supplier = fetchUserDetails(conv.getSupplierId());
            
            // Use company name if available, otherwise fall back to full name
            dto.setBuyerName(buyer != null ? 
                (buyer.get("companyName") != null ? (String) buyer.get("companyName") : (String) buyer.get("fullName")) 
                : "Unknown");
            dto.setSupplierName(supplier != null ? 
                (supplier.get("companyName") != null ? (String) supplier.get("companyName") : (String) supplier.get("fullName")) 
                : "Unknown");

            // Set unread count based on user role
            if (userId.equals(conv.getBuyerId())) {
                dto.setUnreadCount(conv.getUnreadCountBuyer());
            } else {
                dto.setUnreadCount(conv.getUnreadCountSupplier());
            }

            conversationDTOs.add(dto);
        }

        return conversationDTOs;
    }

    public List<ChatMessage> getConversationMessages(Long conversationId, Long userId) {
        log.info("Getting messages for conversation {}", conversationId);
        
        List<Message> messages = messageRepository.findByConversationIdOrderBySentAtAsc(conversationId);
        
        return messages.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public void markMessagesAsRead(Long conversationId, Long userId) {
        log.info("Marking messages as read for conversation {} by user {}", conversationId, userId);
        
        List<Message> unreadMessages = messageRepository
            .findByConversationIdAndReceiverIdAndReadFalse(conversationId, userId);
        
        for (Message message : unreadMessages) {
            message.setRead(true);
            message.setReadAt(LocalDateTime.now());
        }
        
        messageRepository.saveAll(unreadMessages);

        // Update conversation unread count
        Optional<Conversation> convOpt = conversationRepository.findById(conversationId);
        if (convOpt.isPresent()) {
            Conversation conv = convOpt.get();
            if (userId.equals(conv.getBuyerId())) {
                conv.setUnreadCountBuyer(0);
            } else {
                conv.setUnreadCountSupplier(0);
            }
            conversationRepository.save(conv);
        }

        // Send read receipt via WebSocket
        ChatMessage receipt = new ChatMessage();
        receipt.setConversationId(conversationId);
        receipt.setReceiverId(userId);
        receipt.setType(ChatMessage.MessageType.READ_RECEIPT);
        receipt.setSentAt(LocalDateTime.now());

        // Send to the other user in conversation
        convOpt.ifPresent(conv -> {
            Long otherUserId = userId.equals(conv.getBuyerId()) ? 
                conv.getSupplierId() : conv.getBuyerId();
            
            messagingTemplate.convertAndSendToUser(
                otherUserId.toString(),
                "/queue/messages",
                receipt
            );
        });
    }

    public Optional<Conversation> getConversation(Long buyerId, Long supplierId) {
        return conversationRepository.findByBuyerIdAndSupplierId(buyerId, supplierId);
    }

    @Transactional
    public Conversation getOrCreateConversation(Long user1Id, Long user2Id) {
        // Fetch user details to determine actual roles
        Map<String, Object> user1Details = fetchUserDetails(user1Id);
        Map<String, Object> user2Details = fetchUserDetails(user2Id);
        
        Long buyerId;
        Long supplierId;
        
        // Determine buyer and supplier based on user types
        String user1Type = user1Details != null ? (String) user1Details.get("userType") : null;
        String user2Type = user2Details != null ? (String) user2Details.get("userType") : null;
        
        if ("BUYER".equalsIgnoreCase(user1Type)) {
            buyerId = user1Id;
            supplierId = user2Id;
        } else if ("BUYER".equalsIgnoreCase(user2Type)) {
            buyerId = user2Id;
            supplierId = user1Id;
        } else if ("SUPPLIER".equalsIgnoreCase(user1Type)) {
            buyerId = user2Id;
            supplierId = user1Id;
        } else if ("SUPPLIER".equalsIgnoreCase(user2Type)) {
            buyerId = user1Id;
            supplierId = user2Id;
        } else {
            // Fallback: use user1 as buyer, user2 as supplier (original call order)
            buyerId = user1Id;
            supplierId = user2Id;
        }
        
        // Check for existing conversation (try both orderings)
        Optional<Conversation> existing = conversationRepository
            .findByBuyerIdAndSupplierId(buyerId, supplierId);
        
        if (!existing.isPresent()) {
            // Also check reverse ordering in case of old data
            existing = conversationRepository.findByBuyerIdAndSupplierId(supplierId, buyerId);
        }

        if (existing.isPresent()) {
            return existing.get();
        }

        // Create new conversation
        Conversation conversation = new Conversation();
        conversation.setBuyerId(buyerId);
        conversation.setSupplierId(supplierId);
        conversation.setCreatedAt(LocalDateTime.now());
        conversation.setUpdatedAt(LocalDateTime.now());

        return conversationRepository.save(conversation);
    }

    public void sendTypingIndicator(Long conversationId, Long senderId, Long receiverId) {
        ChatMessage typingMessage = new ChatMessage();
        typingMessage.setConversationId(conversationId);
        typingMessage.setSenderId(senderId);
        typingMessage.setReceiverId(receiverId);
        typingMessage.setType(ChatMessage.MessageType.TYPING);
        typingMessage.setSentAt(LocalDateTime.now());

        messagingTemplate.convertAndSendToUser(
            receiverId.toString(),
            "/queue/messages",
            typingMessage
        );
    }

    private ChatMessage convertToDTO(Message message) {
        ChatMessage dto = new ChatMessage();
        dto.setId(message.getId());
        dto.setConversationId(message.getConversationId());
        dto.setSenderId(message.getSenderId());
        dto.setReceiverId(message.getReceiverId());
        dto.setContent(message.getContent());
        dto.setSentAt(message.getSentAt());
        dto.setRead(message.isRead());
        dto.setReadAt(message.getReadAt());
        dto.setType(ChatMessage.MessageType.CHAT);

        // Fetch sender name
        Map<String, Object> sender = fetchUserDetails(message.getSenderId());
        // Use company name if available, otherwise fall back to full name
        if (sender != null) {
            String companyName = (String) sender.get("companyName");
            String fullName = (String) sender.get("fullName");
            dto.setSenderName(companyName != null ? companyName : (fullName != null ? fullName : "Unknown"));
        } else {
            dto.setSenderName("Unknown");
        }

        return dto;
    }

    private Map<String, Object> fetchUserDetails(Long userId) {
        try {
            if (userId == null) {
                return null;
            }
            
            String url = USER_SERVICE_URL + "/" + userId;
            
            @SuppressWarnings("unchecked")
            Map<String, Object> userDetails = restTemplate.getForObject(url, Map.class);
            
            return userDetails;
        } catch (Exception e) {
            log.error("Failed to fetch user details for userId {}: {}", userId, e.getMessage());
            return null;
        }
    }

    /**
     * Clear a conversation for a specific user (soft delete)
     * The conversation stays in DB for 6 months but is hidden from the user's view
     * If new messages arrive, the conversation will reappear
     */
    @Transactional
    public void clearConversation(Long conversationId, Long userId) {
        log.info("Clearing conversation {} for user {}", conversationId, userId);
        
        Optional<Conversation> convOpt = conversationRepository.findById(conversationId);
        if (convOpt.isPresent()) {
            Conversation conversation = convOpt.get();
            LocalDateTime now = LocalDateTime.now();
            
            if (userId.equals(conversation.getBuyerId())) {
                conversation.setClearedByBuyer(now);
                conversation.setUnreadCountBuyer(0); // Reset unread count
            } else if (userId.equals(conversation.getSupplierId())) {
                conversation.setClearedBySupplier(now);
                conversation.setUnreadCountSupplier(0); // Reset unread count
            }
            
            conversationRepository.save(conversation);
            log.info("Conversation {} cleared for user {}", conversationId, userId);
        }
    }

    /**
     * Restore a cleared conversation (for when user wants to see it again)
     */
    @Transactional
    public void restoreConversation(Long conversationId, Long userId) {
        log.info("Restoring conversation {} for user {}", conversationId, userId);
        
        Optional<Conversation> convOpt = conversationRepository.findById(conversationId);
        if (convOpt.isPresent()) {
            Conversation conversation = convOpt.get();
            
            if (userId.equals(conversation.getBuyerId())) {
                conversation.setClearedByBuyer(null);
            } else if (userId.equals(conversation.getSupplierId())) {
                conversation.setClearedBySupplier(null);
            }
            
            conversationRepository.save(conversation);
        }
    }
}
