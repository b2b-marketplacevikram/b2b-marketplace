package com.b2b.marketplace.order.service;

import com.b2b.marketplace.order.dto.*;
import com.b2b.marketplace.order.entity.*;
import com.b2b.marketplace.order.entity.Dispute.*;
import com.b2b.marketplace.order.entity.DisputeMessage.*;
import com.b2b.marketplace.order.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Dispute Service - Business logic for order disputes
 * 
 * Compliant with Indian E-Commerce Laws:
 * - Consumer Protection Act 2019
 * - Consumer Protection (E-Commerce) Rules 2020
 * 
 * Key Requirements:
 * - Acknowledge within 48 hours
 * - Resolve within 30 days
 * - Grievance Officer escalation mechanism
 * - Refund processing
 */
@Service
public class DisputeService {
    
    private static final Logger log = LoggerFactory.getLogger(DisputeService.class);
    
    private final DisputeRepository disputeRepository;
    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper;
    
    public DisputeService(DisputeRepository disputeRepository, OrderRepository orderRepository, ObjectMapper objectMapper) {
        this.disputeRepository = disputeRepository;
        this.orderRepository = orderRepository;
        this.objectMapper = objectMapper;
    }
    
    /**
     * Create a new dispute/ticket (Buyer action)
     */
    @Transactional
    public DisputeResponse createDispute(CreateDisputeRequest request) {
        log.info("Creating dispute for order: {}", request.getOrderNumber());
        
        // Verify order exists
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found: " + request.getOrderId()));
        
        // Check if active dispute already exists for this order
        long activeDisputes = disputeRepository.countActiveDisputesForOrder(request.getOrderId());
        if (activeDisputes > 0) {
            throw new RuntimeException("An active dispute already exists for this order. Please use the existing ticket.");
        }
        
        Dispute dispute = new Dispute();
        dispute.setOrderId(request.getOrderId());
        dispute.setOrderNumber(request.getOrderNumber());
        
        // Set buyer info
        dispute.setBuyerId(request.getBuyerId());
        dispute.setBuyerName(request.getBuyerName());
        dispute.setBuyerEmail(request.getBuyerEmail());
        dispute.setBuyerPhone(request.getBuyerPhone());
        
        // Set supplier info
        dispute.setSupplierId(request.getSupplierId() != null ? request.getSupplierId() : order.getSupplierId());
        dispute.setSupplierName(request.getSupplierName());
        
        // Set dispute details
        dispute.setDisputeType(DisputeType.valueOf(request.getDisputeType()));
        dispute.setPriority(request.getPriority() != null ? 
                DisputePriority.valueOf(request.getPriority()) : DisputePriority.MEDIUM);
        dispute.setSubject(request.getSubject());
        dispute.setDescription(request.getDescription());
        dispute.setStatus(DisputeStatus.OPEN);
        
        // Set affected items
        if (request.getAffectedItems() != null && !request.getAffectedItems().isEmpty()) {
            try {
                dispute.setAffectedItems(objectMapper.writeValueAsString(request.getAffectedItems()));
            } catch (Exception e) {
                log.warn("Failed to serialize affected items", e);
            }
        }
        
        // Set evidence URLs
        if (request.getEvidenceUrls() != null && !request.getEvidenceUrls().isEmpty()) {
            try {
                dispute.setEvidenceUrls(objectMapper.writeValueAsString(request.getEvidenceUrls()));
            } catch (Exception e) {
                log.warn("Failed to serialize evidence URLs", e);
            }
        }
        
        // Set refund request
        dispute.setRefundRequested(request.getRefundRequested());
        if (Boolean.TRUE.equals(request.getRefundRequested())) {
            dispute.setRefundAmount(request.getRefundAmount());
            dispute.setRefundStatus(RefundStatus.REQUESTED);
        }
        
        // Add initial message
        DisputeMessage initialMessage = new DisputeMessage();
        initialMessage.setSenderId(request.getBuyerId());
        initialMessage.setSenderName(request.getBuyerName());
        initialMessage.setSenderType(SenderType.BUYER);
        initialMessage.setMessage(request.getDescription());
        initialMessage.setMessageType(MessageType.TEXT);
        dispute.addMessage(initialMessage);
        
        // Add system message
        DisputeMessage systemMessage = new DisputeMessage();
        systemMessage.setSenderType(SenderType.SYSTEM);
        systemMessage.setSenderName("System");
        systemMessage.setMessageType(MessageType.SYSTEM);
        systemMessage.setMessage("Dispute ticket created. As per Consumer Protection Rules 2020, " +
                "this grievance will be acknowledged within 48 hours and resolved within 30 days.");
        dispute.addMessage(systemMessage);
        
        Dispute savedDispute = disputeRepository.save(dispute);
        log.info("Dispute created with ticket: {}", savedDispute.getTicketNumber());
        
        return mapToResponse(savedDispute, false);
    }
    
    /**
     * Get dispute by ticket number
     */
    public DisputeResponse getByTicketNumber(String ticketNumber, boolean includeInternal) {
        Dispute dispute = disputeRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new RuntimeException("Dispute not found: " + ticketNumber));
        return mapToResponse(dispute, includeInternal);
    }
    
    /**
     * Get disputes for buyer
     */
    public List<DisputeResponse> getBuyerDisputes(Long buyerId, String status) {
        List<Dispute> disputes;
        if (status != null && !status.isEmpty() && !"ALL".equalsIgnoreCase(status)) {
            disputes = disputeRepository.findByBuyerIdAndStatusOrderByCreatedAtDesc(
                    buyerId, DisputeStatus.valueOf(status));
        } else {
            disputes = disputeRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId);
        }
        return disputes.stream()
                .map(d -> mapToResponse(d, false))
                .collect(Collectors.toList());
    }
    
    /**
     * Get disputes for supplier
     */
    public List<DisputeResponse> getSupplierDisputes(Long supplierId, String status) {
        List<Dispute> disputes;
        if (status != null && !status.isEmpty() && !"ALL".equalsIgnoreCase(status)) {
            disputes = disputeRepository.findBySupplierIdAndStatusOrderByCreatedAtDesc(
                    supplierId, DisputeStatus.valueOf(status));
        } else {
            disputes = disputeRepository.findBySupplierIdOrderByCreatedAtDesc(supplierId);
        }
        return disputes.stream()
                .map(d -> mapToResponse(d, true))
                .collect(Collectors.toList());
    }
    
    /**
     * Acknowledge dispute (Supplier action) - Must be done within 48 hours
     */
    @Transactional
    public DisputeResponse acknowledgeDispute(String ticketNumber, Long supplierId, String message) {
        Dispute dispute = disputeRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new RuntimeException("Dispute not found: " + ticketNumber));
        
        if (!dispute.getSupplierId().equals(supplierId)) {
            throw new RuntimeException("Not authorized to acknowledge this dispute");
        }
        
        if (dispute.getAcknowledgedAt() != null) {
            throw new RuntimeException("Dispute already acknowledged");
        }
        
        dispute.setAcknowledgedAt(LocalDateTime.now());
        dispute.setStatus(DisputeStatus.ACKNOWLEDGED);
        
        // Add acknowledgment message
        DisputeMessage msg = new DisputeMessage();
        msg.setSenderId(supplierId);
        msg.setSenderName(dispute.getSupplierName());
        msg.setSenderType(SenderType.SUPPLIER);
        msg.setMessageType(MessageType.STATUS_UPDATE);
        msg.setMessage(message != null ? message : 
                "We have received your complaint and are looking into it. We will respond shortly.");
        dispute.addMessage(msg);
        
        Dispute saved = disputeRepository.save(dispute);
        log.info("Dispute {} acknowledged by supplier {}", ticketNumber, supplierId);
        
        return mapToResponse(saved, true);
    }
    
    /**
     * Supplier responds to dispute with proposed resolution
     */
    @Transactional
    public DisputeResponse supplierRespond(String ticketNumber, Long supplierId, 
            String message, String proposedResolution, BigDecimal proposedRefundAmount) {
        
        Dispute dispute = disputeRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new RuntimeException("Dispute not found: " + ticketNumber));
        
        if (!dispute.getSupplierId().equals(supplierId)) {
            throw new RuntimeException("Not authorized to respond to this dispute");
        }
        
        // Auto-acknowledge if not yet acknowledged
        if (dispute.getAcknowledgedAt() == null) {
            dispute.setAcknowledgedAt(LocalDateTime.now());
        }
        
        dispute.setStatus(DisputeStatus.SUPPLIER_RESPONDED);
        
        // If resolution proposed
        if (proposedResolution != null && !proposedResolution.isEmpty()) {
            dispute.setResolutionType(ResolutionType.valueOf(proposedResolution));
            dispute.setStatus(DisputeStatus.RESOLUTION_PROPOSED);
            
            if (proposedRefundAmount != null) {
                dispute.setRefundAmount(proposedRefundAmount);
                dispute.setRefundStatus(RefundStatus.APPROVED);
            }
        }
        
        // Add response message
        DisputeMessage msg = new DisputeMessage();
        msg.setSenderId(supplierId);
        msg.setSenderName(dispute.getSupplierName());
        msg.setSenderType(SenderType.SUPPLIER);
        msg.setMessageType(proposedResolution != null ? MessageType.RESOLUTION : MessageType.TEXT);
        msg.setMessage(message);
        dispute.addMessage(msg);
        
        Dispute saved = disputeRepository.save(dispute);
        log.info("Supplier responded to dispute: {}", ticketNumber);
        
        return mapToResponse(saved, true);
    }
    
    /**
     * Buyer accepts proposed resolution
     */
    @Transactional
    public DisputeResponse acceptResolution(String ticketNumber, Long buyerId, Integer rating, String feedback) {
        Dispute dispute = disputeRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new RuntimeException("Dispute not found: " + ticketNumber));
        
        if (!dispute.getBuyerId().equals(buyerId)) {
            throw new RuntimeException("Not authorized to accept this resolution");
        }
        
        dispute.setStatus(DisputeStatus.RESOLVED);
        dispute.setResolvedAt(LocalDateTime.now());
        
        // Set satisfaction rating
        if (rating != null) {
            dispute.setBuyerSatisfactionRating(rating);
        }
        if (feedback != null) {
            dispute.setBuyerFeedback(feedback);
        }
        
        // Process refund if approved
        if (dispute.getRefundStatus() == RefundStatus.APPROVED && dispute.getRefundAmount() != null) {
            dispute.setRefundStatus(RefundStatus.PROCESSING);
            // In a real system, trigger refund processing here
        }
        
        // Add system message
        DisputeMessage msg = new DisputeMessage();
        msg.setSenderType(SenderType.SYSTEM);
        msg.setSenderName("System");
        msg.setMessageType(MessageType.RESOLUTION);
        msg.setMessage("Resolution accepted by buyer. Dispute resolved.");
        dispute.addMessage(msg);
        
        Dispute saved = disputeRepository.save(dispute);
        log.info("Dispute {} resolved - resolution accepted by buyer", ticketNumber);
        
        return mapToResponse(saved, false);
    }
    
    /**
     * Escalate dispute (Buyer action)
     */
    @Transactional
    public DisputeResponse escalateDispute(String ticketNumber, Long buyerId, String reason) {
        Dispute dispute = disputeRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new RuntimeException("Dispute not found: " + ticketNumber));
        
        if (!dispute.getBuyerId().equals(buyerId)) {
            throw new RuntimeException("Not authorized to escalate this dispute");
        }
        
        // Increment escalation level
        int newLevel = (dispute.getEscalationLevel() != null ? dispute.getEscalationLevel() : 0) + 1;
        if (newLevel > 3) {
            throw new RuntimeException("Dispute already at maximum escalation level");
        }
        
        dispute.setEscalationLevel(newLevel);
        dispute.setEscalatedAt(LocalDateTime.now());
        dispute.setEscalationReason(reason);
        dispute.setStatus(DisputeStatus.ESCALATED);
        
        String levelName = switch (newLevel) {
            case 1 -> "Senior Support";
            case 2 -> "Management";
            case 3 -> "Grievance Officer (as per Consumer Protection Rules 2020)";
            default -> "Level " + newLevel;
        };
        
        // Add escalation message
        DisputeMessage msg = new DisputeMessage();
        msg.setSenderId(buyerId);
        msg.setSenderName(dispute.getBuyerName());
        msg.setSenderType(SenderType.BUYER);
        msg.setMessageType(MessageType.ESCALATION);
        msg.setMessage("Dispute escalated to " + levelName + ". Reason: " + reason);
        dispute.addMessage(msg);
        
        Dispute saved = disputeRepository.save(dispute);
        log.info("Dispute {} escalated to level {}", ticketNumber, newLevel);
        
        return mapToResponse(saved, false);
    }
    
    /**
     * Add message to dispute thread
     */
    @Transactional
    public DisputeResponse addMessage(String ticketNumber, Long senderId, String senderName,
            String senderType, String message, List<String> attachments, Boolean isInternal) {
        
        Dispute dispute = disputeRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new RuntimeException("Dispute not found: " + ticketNumber));
        
        DisputeMessage msg = new DisputeMessage();
        msg.setSenderId(senderId);
        msg.setSenderName(senderName);
        msg.setSenderType(SenderType.valueOf(senderType));
        msg.setMessageType(MessageType.TEXT);
        msg.setMessage(message);
        msg.setIsInternal(isInternal != null && isInternal);
        
        if (attachments != null && !attachments.isEmpty()) {
            try {
                msg.setAttachments(objectMapper.writeValueAsString(attachments));
            } catch (Exception e) {
                log.warn("Failed to serialize attachments", e);
            }
        }
        
        dispute.addMessage(msg);
        
        // Update status if needed
        if ("BUYER".equals(senderType) && dispute.getStatus() == DisputeStatus.AWAITING_BUYER) {
            dispute.setStatus(DisputeStatus.UNDER_REVIEW);
        } else if ("SUPPLIER".equals(senderType)) {
            dispute.setStatus(DisputeStatus.SUPPLIER_RESPONDED);
        }
        
        Dispute saved = disputeRepository.save(dispute);
        boolean includeInternal = !"BUYER".equals(senderType);
        return mapToResponse(saved, includeInternal);
    }
    
    /**
     * Close dispute
     */
    @Transactional
    public DisputeResponse closeDispute(String ticketNumber, Long closedBy, String reason) {
        Dispute dispute = disputeRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new RuntimeException("Dispute not found: " + ticketNumber));
        
        dispute.setStatus(DisputeStatus.CLOSED);
        dispute.setClosedAt(LocalDateTime.now());
        
        DisputeMessage msg = new DisputeMessage();
        msg.setSenderType(SenderType.SYSTEM);
        msg.setSenderName("System");
        msg.setMessageType(MessageType.STATUS_UPDATE);
        msg.setMessage("Dispute closed. " + (reason != null ? reason : ""));
        dispute.addMessage(msg);
        
        Dispute saved = disputeRepository.save(dispute);
        log.info("Dispute {} closed", ticketNumber);
        
        return mapToResponse(saved, false);
    }
    
    /**
     * Get supplier dispute statistics
     */
    public Map<String, Object> getSupplierStats(Long supplierId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalDisputes", disputeRepository.countTotalDisputesForSupplier(supplierId));
        stats.put("openDisputes", disputeRepository.countOpenDisputesForSupplier(supplierId));
        stats.put("resolvedDisputes", disputeRepository.countResolvedDisputesForSupplier(supplierId));
        stats.put("escalatedDisputes", disputeRepository.countEscalatedDisputesForSupplier(supplierId));
        
        Double avgRating = disputeRepository.getAverageResolutionRatingForSupplier(supplierId);
        stats.put("averageRating", avgRating != null ? Math.round(avgRating * 10) / 10.0 : null);
        
        // Overdue disputes
        List<Dispute> overdue = disputeRepository.findOverdueDisputesForSupplier(supplierId, LocalDateTime.now());
        stats.put("overdueCount", overdue.size());
        
        return stats;
    }
    
    /**
     * Map entity to response DTO
     */
    private DisputeResponse mapToResponse(Dispute dispute, boolean includeInternal) {
        DisputeResponse response = new DisputeResponse();
        
        response.setId(dispute.getId());
        response.setTicketNumber(dispute.getTicketNumber());
        response.setOrderId(dispute.getOrderId());
        response.setOrderNumber(dispute.getOrderNumber());
        
        // Buyer info
        response.setBuyerId(dispute.getBuyerId());
        response.setBuyerName(dispute.getBuyerName());
        response.setBuyerEmail(dispute.getBuyerEmail());
        response.setBuyerPhone(dispute.getBuyerPhone());
        
        // Supplier info
        response.setSupplierId(dispute.getSupplierId());
        response.setSupplierName(dispute.getSupplierName());
        
        // Dispute details
        response.setDisputeType(dispute.getDisputeType().name());
        response.setDisputeTypeLabel(dispute.getDisputeType().getLabel());
        response.setStatus(dispute.getStatus().name());
        response.setStatusLabel(dispute.getStatus().getLabel());
        response.setPriority(dispute.getPriority().name());
        response.setPriorityLabel(dispute.getPriority().getLabel());
        response.setSubject(dispute.getSubject());
        response.setDescription(dispute.getDescription());
        
        // Affected items
        if (dispute.getAffectedItems() != null) {
            try {
                List<DisputeResponse.AffectedItemResponse> items = objectMapper.readValue(
                        dispute.getAffectedItems(),
                        new TypeReference<List<DisputeResponse.AffectedItemResponse>>() {});
                response.setAffectedItems(items);
            } catch (Exception e) {
                log.warn("Failed to parse affected items", e);
            }
        }
        
        // Evidence URLs
        if (dispute.getEvidenceUrls() != null) {
            try {
                List<String> urls = objectMapper.readValue(
                        dispute.getEvidenceUrls(),
                        new TypeReference<List<String>>() {});
                response.setEvidenceUrls(urls);
            } catch (Exception e) {
                log.warn("Failed to parse evidence URLs", e);
            }
        }
        
        // Refund details
        response.setRefundRequested(dispute.getRefundRequested());
        response.setRefundAmount(dispute.getRefundAmount());
        if (dispute.getRefundStatus() != null) {
            response.setRefundStatus(dispute.getRefundStatus().name());
            response.setRefundStatusLabel(dispute.getRefundStatus().getLabel());
        }
        response.setRefundProcessedAt(dispute.getRefundProcessedAt());
        
        // Resolution
        if (dispute.getResolutionType() != null) {
            response.setResolutionType(dispute.getResolutionType().name());
            response.setResolutionTypeLabel(dispute.getResolutionType().getLabel());
        }
        response.setResolutionNotes(dispute.getResolutionNotes());
        response.setResolvedBy(dispute.getResolvedBy());
        response.setResolvedByName(dispute.getResolvedByName());
        
        // Compliance
        response.setAcknowledgmentDeadline(dispute.getAcknowledgmentDeadline());
        response.setAcknowledgedAt(dispute.getAcknowledgedAt());
        response.setResolutionDeadline(dispute.getResolutionDeadline());
        response.setResolvedAt(dispute.getResolvedAt());
        response.setDaysToResolve(dispute.getDaysToResolve());
        response.setIsOverdueForAcknowledgment(dispute.isOverdueForAcknowledgment());
        response.setIsOverdueForResolution(dispute.isOverdueForResolution());
        
        // Escalation
        response.setEscalatedAt(dispute.getEscalatedAt());
        response.setEscalationLevel(dispute.getEscalationLevel());
        response.setEscalationReason(dispute.getEscalationReason());
        
        // Satisfaction
        response.setBuyerSatisfactionRating(dispute.getBuyerSatisfactionRating());
        response.setBuyerFeedback(dispute.getBuyerFeedback());
        
        // Timestamps
        response.setCreatedAt(dispute.getCreatedAt());
        response.setUpdatedAt(dispute.getUpdatedAt());
        response.setClosedAt(dispute.getClosedAt());
        
        // Messages (filter internal if buyer is viewing)
        List<DisputeResponse.DisputeMessageResponse> messages = dispute.getMessages().stream()
                .filter(m -> includeInternal || !Boolean.TRUE.equals(m.getIsInternal()))
                .map(this::mapMessageToResponse)
                .collect(Collectors.toList());
        response.setMessages(messages);
        response.setMessageCount(messages.size());
        
        long unread = dispute.getMessages().stream()
                .filter(m -> !Boolean.TRUE.equals(m.getIsRead()))
                .filter(m -> includeInternal || !Boolean.TRUE.equals(m.getIsInternal()))
                .count();
        response.setUnreadMessageCount((int) unread);
        
        return response;
    }
    
    private DisputeResponse.DisputeMessageResponse mapMessageToResponse(DisputeMessage msg) {
        DisputeResponse.DisputeMessageResponse response = new DisputeResponse.DisputeMessageResponse();
        response.setId(msg.getId());
        response.setSenderId(msg.getSenderId());
        response.setSenderName(msg.getSenderName());
        response.setSenderType(msg.getSenderType() != null ? msg.getSenderType().name() : null);
        response.setMessage(msg.getMessage());
        response.setMessageType(msg.getMessageType() != null ? msg.getMessageType().name() : null);
        response.setIsInternal(msg.getIsInternal());
        response.setIsRead(msg.getIsRead());
        response.setReadAt(msg.getReadAt());
        response.setCreatedAt(msg.getCreatedAt());
        
        // Parse attachments
        if (msg.getAttachments() != null) {
            try {
                List<String> attachments = objectMapper.readValue(
                        msg.getAttachments(),
                        new TypeReference<List<String>>() {});
                response.setAttachments(attachments);
            } catch (Exception e) {
                log.warn("Failed to parse attachments", e);
            }
        }
        
        return response;
    }
}
