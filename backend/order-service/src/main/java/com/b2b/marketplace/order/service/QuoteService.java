package com.b2b.marketplace.order.service;

import com.b2b.marketplace.order.dto.*;
import com.b2b.marketplace.order.entity.*;
import com.b2b.marketplace.order.entity.Quote.QuoteStatus;
import com.b2b.marketplace.order.entity.QuoteMessage.MessageType;
import com.b2b.marketplace.order.entity.QuoteMessage.SenderType;
import com.b2b.marketplace.order.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuoteService {

    @Autowired
    private QuoteRepository quoteRepository;

    @Autowired
    private QuoteItemRepository quoteItemRepository;

    @Autowired
    private QuoteMessageRepository quoteMessageRepository;

    @Autowired
    private OrderService orderService;

    /**
     * Create a new quote request (buyer action)
     */
    @Transactional
    public QuoteResponse createQuote(CreateQuoteRequest request) {
        Quote quote = new Quote();
        quote.setQuoteNumber("QT" + System.currentTimeMillis());
        quote.setBuyerId(request.getBuyerId());
        quote.setBuyerName(request.getBuyerName());
        quote.setBuyerEmail(request.getBuyerEmail());
        quote.setBuyerPhone(request.getBuyerPhone());
        quote.setBuyerCompany(request.getBuyerCompany());
        quote.setSupplierId(request.getSupplierId());
        quote.setSupplierName(request.getSupplierName());
        quote.setShippingAddress(request.getShippingAddress());
        quote.setBuyerRequirements(request.getBuyerRequirements());
        quote.setIsFromCart(request.getIsFromCart() != null && request.getIsFromCart());
        quote.setStatus(QuoteStatus.PENDING);
        quote.setValidityDays(15);
        quote.setValidUntil(LocalDate.now().plusDays(15));

        // Add items
        for (CreateQuoteRequest.QuoteItemRequest itemReq : request.getItems()) {
            QuoteItem item = new QuoteItem();
            item.setProductId(itemReq.getProductId());
            item.setProductName(itemReq.getProductName());
            item.setProductImage(itemReq.getProductImage());
            item.setQuantity(itemReq.getQuantity());
            item.setRequestedQuantity(itemReq.getQuantity());
            item.setOriginalPrice(itemReq.getOriginalPrice());
            item.setUnit(itemReq.getUnit() != null ? itemReq.getUnit() : "piece");
            item.setSpecifications(itemReq.getSpecifications());
            quote.addItem(item);
        }

        // Calculate totals
        quote.calculateTotals();

        // Add system message
        QuoteMessage systemMsg = new QuoteMessage();
        systemMsg.setSenderId(0L);
        systemMsg.setSenderName("System");
        systemMsg.setSenderType(SenderType.SYSTEM);
        systemMsg.setMessage("Quote request created. Waiting for supplier response.");
        systemMsg.setMessageType(MessageType.SYSTEM);
        quote.addMessage(systemMsg);

        Quote savedQuote = quoteRepository.save(quote);
        return mapToResponse(savedQuote);
    }

    /**
     * Get quote by quote number
     */
    public QuoteResponse getQuoteByNumber(String quoteNumber) {
        Quote quote = quoteRepository.findByQuoteNumber(quoteNumber)
                .orElseThrow(() -> new RuntimeException("Quote not found: " + quoteNumber));
        return mapToResponse(quote);
    }

    /**
     * Get quote by ID
     */
    public QuoteResponse getQuoteById(Long quoteId) {
        Quote quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new RuntimeException("Quote not found: " + quoteId));
        return mapToResponse(quote);
    }

    /**
     * Get all quotes for a buyer
     */
    public List<QuoteResponse> getBuyerQuotes(Long buyerId, String status) {
        List<Quote> quotes;
        if (status != null && !status.isEmpty() && !status.equals("ALL")) {
            quotes = quoteRepository.findByBuyerIdAndStatusOrderByCreatedAtDesc(
                    buyerId, QuoteStatus.valueOf(status));
        } else {
            quotes = quoteRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId);
        }
        return quotes.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /**
     * Get all quotes for a supplier
     */
    public List<QuoteResponse> getSupplierQuotes(Long supplierId, String status) {
        List<Quote> quotes;
        if (status != null && !status.isEmpty() && !status.equals("ALL")) {
            quotes = quoteRepository.findBySupplierIdAndStatusOrderByCreatedAtDesc(
                    supplierId, QuoteStatus.valueOf(status));
        } else {
            quotes = quoteRepository.findBySupplierIdOrderByCreatedAtDesc(supplierId);
        }
        return quotes.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /**
     * Supplier responds to quote with pricing
     */
    @Transactional
    public QuoteResponse respondToQuote(String quoteNumber, SupplierQuoteResponse response, Long supplierId) {
        Quote quote = quoteRepository.findByQuoteNumber(quoteNumber)
                .orElseThrow(() -> new RuntimeException("Quote not found: " + quoteNumber));

        if (!quote.getSupplierId().equals(supplierId)) {
            throw new RuntimeException("Not authorized to respond to this quote");
        }

        if (quote.getStatus() != QuoteStatus.PENDING && quote.getStatus() != QuoteStatus.NEGOTIATING) {
            throw new RuntimeException("Cannot respond to quote in status: " + quote.getStatus());
        }

        // Update item pricing
        if (response.getItemPricing() != null) {
            for (SupplierQuoteResponse.QuoteItemPricing pricing : response.getItemPricing()) {
                quote.getItems().stream()
                        .filter(item -> item.getId().equals(pricing.getItemId()))
                        .findFirst()
                        .ifPresent(item -> {
                            item.setQuotedPrice(pricing.getQuotedPrice());
                            if (pricing.getQuantity() != null) {
                                item.setQuantity(pricing.getQuantity());
                            }
                            if (pricing.getLeadTimeDays() != null) {
                                item.setLeadTimeDays(pricing.getLeadTimeDays());
                            }
                            if (pricing.getSupplierNotes() != null) {
                                item.setSupplierNotes(pricing.getSupplierNotes());
                            }
                        });
            }
        }

        // Update quote details
        if (response.getSupplierNotes() != null) {
            quote.setSupplierNotes(response.getSupplierNotes());
        }
        if (response.getDiscountPercentage() != null) {
            quote.setDiscountPercentage(response.getDiscountPercentage());
        }
        if (response.getValidityDays() != null && response.getValidityDays() > quote.getValidityDays()) {
            quote.setValidityDays(response.getValidityDays());
            quote.setValidUntil(quote.getCreatedAt().toLocalDate().plusDays(response.getValidityDays()));
        }

        quote.calculateTotals();
        quote.setStatus(QuoteStatus.SUPPLIER_RESPONDED);
        quote.setRespondedAt(LocalDateTime.now());
        quote.setNegotiationCount(quote.getNegotiationCount() + 1);

        // Add message
        QuoteMessage msg = new QuoteMessage();
        msg.setSenderId(supplierId);
        msg.setSenderName(quote.getSupplierName());
        msg.setSenderType(SenderType.SUPPLIER);
        msg.setMessage("Supplier has provided pricing. Please review the quote.");
        msg.setMessageType(MessageType.PRICE_UPDATE);
        quote.addMessage(msg);

        Quote savedQuote = quoteRepository.save(quote);
        return mapToResponse(savedQuote);
    }

    /**
     * Buyer sends counter-offer
     */
    @Transactional
    public QuoteResponse counterOffer(String quoteNumber, String message, Long buyerId) {
        Quote quote = quoteRepository.findByQuoteNumber(quoteNumber)
                .orElseThrow(() -> new RuntimeException("Quote not found: " + quoteNumber));

        if (!quote.getBuyerId().equals(buyerId)) {
            throw new RuntimeException("Not authorized to counter-offer on this quote");
        }

        quote.setStatus(QuoteStatus.NEGOTIATING);
        quote.setNegotiationCount(quote.getNegotiationCount() + 1);

        // Add message
        QuoteMessage msg = new QuoteMessage();
        msg.setSenderId(buyerId);
        msg.setSenderName(quote.getBuyerName());
        msg.setSenderType(SenderType.BUYER);
        msg.setMessage(message);
        msg.setMessageType(MessageType.COUNTER_OFFER);
        quote.addMessage(msg);

        Quote savedQuote = quoteRepository.save(quote);
        return mapToResponse(savedQuote);
    }

    /**
     * Supplier approves quote with final pricing (ready to convert to order)
     */
    @Transactional
    public QuoteResponse approveQuote(String quoteNumber, ApproveQuoteRequest request, Long supplierId) {
        Quote quote = quoteRepository.findByQuoteNumber(quoteNumber)
                .orElseThrow(() -> new RuntimeException("Quote not found: " + quoteNumber));

        if (!quote.getSupplierId().equals(supplierId)) {
            throw new RuntimeException("Not authorized to approve this quote");
        }

        // Set final pricing
        if (request.getFinalPricing() != null) {
            for (ApproveQuoteRequest.FinalItemPricing pricing : request.getFinalPricing()) {
                quote.getItems().stream()
                        .filter(item -> item.getId().equals(pricing.getItemId()))
                        .findFirst()
                        .ifPresent(item -> {
                            item.setFinalPrice(pricing.getFinalPrice());
                            if (pricing.getQuantity() != null) {
                                item.setQuantity(pricing.getQuantity());
                            }
                            if (pricing.getLeadTimeDays() != null) {
                                item.setLeadTimeDays(pricing.getLeadTimeDays());
                            }
                        });
            }
        }

        // Update discount
        if (request.getDiscountPercentage() != null) {
            quote.setDiscountPercentage(request.getDiscountPercentage());
        }

        // Extend validity if requested
        if (request.getAdditionalValidityDays() != null && request.getAdditionalValidityDays() > 0) {
            quote.extendValidity(request.getAdditionalValidityDays());
        }

        if (request.getSupplierNotes() != null) {
            quote.setSupplierNotes(request.getSupplierNotes());
        }

        quote.calculateTotals();
        quote.setStatus(QuoteStatus.APPROVED);
        quote.setApprovedAt(LocalDateTime.now());

        // Add approval message
        QuoteMessage msg = new QuoteMessage();
        msg.setSenderId(supplierId);
        msg.setSenderName(quote.getSupplierName());
        msg.setSenderType(SenderType.SUPPLIER);
        msg.setMessage("Quote approved with final pricing. Ready to convert to order.");
        msg.setMessageType(MessageType.APPROVAL);
        quote.addMessage(msg);

        Quote savedQuote = quoteRepository.save(quote);
        return mapToResponse(savedQuote);
    }

    /**
     * Supplier rejects quote
     */
    @Transactional
    public QuoteResponse rejectQuote(String quoteNumber, String reason, Long supplierId) {
        Quote quote = quoteRepository.findByQuoteNumber(quoteNumber)
                .orElseThrow(() -> new RuntimeException("Quote not found: " + quoteNumber));

        if (!quote.getSupplierId().equals(supplierId)) {
            throw new RuntimeException("Not authorized to reject this quote");
        }

        quote.setStatus(QuoteStatus.REJECTED);
        quote.setRejectionReason(reason);

        // Add rejection message
        QuoteMessage msg = new QuoteMessage();
        msg.setSenderId(supplierId);
        msg.setSenderName(quote.getSupplierName());
        msg.setSenderType(SenderType.SUPPLIER);
        msg.setMessage("Quote rejected. Reason: " + reason);
        msg.setMessageType(MessageType.REJECTION);
        quote.addMessage(msg);

        Quote savedQuote = quoteRepository.save(quote);
        return mapToResponse(savedQuote);
    }

    /**
     * Buyer cancels quote
     */
    @Transactional
    public QuoteResponse cancelQuote(String quoteNumber, Long buyerId) {
        Quote quote = quoteRepository.findByQuoteNumber(quoteNumber)
                .orElseThrow(() -> new RuntimeException("Quote not found: " + quoteNumber));

        if (!quote.getBuyerId().equals(buyerId)) {
            throw new RuntimeException("Not authorized to cancel this quote");
        }

        if (quote.getStatus() == QuoteStatus.CONVERTED) {
            throw new RuntimeException("Cannot cancel a converted quote");
        }

        quote.setStatus(QuoteStatus.CANCELLED);

        Quote savedQuote = quoteRepository.save(quote);
        return mapToResponse(savedQuote);
    }

    /**
     * Convert approved quote to order (buyer action)
     */
    @Transactional
    public QuoteResponse convertToOrder(String quoteNumber, Long buyerId, String paymentType, String shippingAddress, String notes) {
        Quote quote = quoteRepository.findByQuoteNumber(quoteNumber)
                .orElseThrow(() -> new RuntimeException("Quote not found: " + quoteNumber));

        if (!quote.getBuyerId().equals(buyerId)) {
            throw new RuntimeException("Not authorized to convert this quote");
        }

        if (quote.getStatus() != QuoteStatus.APPROVED) {
            throw new RuntimeException("Only approved quotes can be converted to orders");
        }

        if (quote.isExpired()) {
            throw new RuntimeException("Quote has expired. Please request a new quote.");
        }

        // Use provided shipping address or fall back to quote's address
        String finalShippingAddress = (shippingAddress != null && !shippingAddress.isEmpty()) 
            ? shippingAddress : quote.getShippingAddress();

        // Create order from quote
        CreateOrderRequest orderRequest = new CreateOrderRequest();
        orderRequest.setBuyerId(quote.getBuyerId());
        orderRequest.setSupplierId(quote.getSupplierId());
        orderRequest.setShippingAddress(finalShippingAddress);
        orderRequest.setBillingAddress(finalShippingAddress);
        orderRequest.setPaymentType(paymentType != null ? paymentType : "BANK_TRANSFER");
        
        // Combine quote reference with any additional notes
        String orderNotes = "Created from Quote: " + quote.getQuoteNumber();
        if (notes != null && !notes.isEmpty()) {
            orderNotes += " | Notes: " + notes;
        }
        orderRequest.setNotes(orderNotes);

        List<CreateOrderRequest.OrderItemRequest> orderItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        
        for (QuoteItem quoteItem : quote.getItems()) {
            CreateOrderRequest.OrderItemRequest orderItem = new CreateOrderRequest.OrderItemRequest();
            orderItem.setProductId(quoteItem.getProductId());
            orderItem.setProductName(quoteItem.getProductName());
            orderItem.setQuantity(quoteItem.getQuantity());
            // Use final price, fallback to quoted price, then original
            BigDecimal price = quoteItem.getFinalPrice() != null ? quoteItem.getFinalPrice() :
                    (quoteItem.getQuotedPrice() != null ? quoteItem.getQuotedPrice() : quoteItem.getOriginalPrice());
            orderItem.setUnitPrice(price);
            BigDecimal lineTotal = price.multiply(BigDecimal.valueOf(quoteItem.getQuantity()));
            orderItem.setTotalPrice(lineTotal);
            subtotal = subtotal.add(lineTotal);
            orderItems.add(orderItem);
        }
        orderRequest.setItems(orderItems);
        
        // Set order totals from quote
        orderRequest.setSubtotal(subtotal);
        orderRequest.setTaxAmount(BigDecimal.ZERO);
        orderRequest.setShippingCost(BigDecimal.ZERO);
        // Use quote's final total if available, otherwise calculated subtotal
        BigDecimal finalTotal = quote.getFinalTotal() != null ? quote.getFinalTotal() : 
                (quote.getQuotedTotal() != null ? quote.getQuotedTotal() : subtotal);
        orderRequest.setTotalAmount(finalTotal);

        // Create the order
        OrderResponse order = orderService.createOrder(orderRequest);

        // Update quote with order reference
        quote.setStatus(QuoteStatus.CONVERTED);
        quote.setOrderId(order.getId());
        quote.setOrderNumber(order.getOrderNumber());
        quote.setConvertedToOrderAt(LocalDateTime.now());

        // Add conversion message
        QuoteMessage msg = new QuoteMessage();
        msg.setSenderId(buyerId);
        msg.setSenderName(quote.getBuyerName());
        msg.setSenderType(SenderType.BUYER);
        msg.setMessage("Quote converted to order: " + order.getOrderNumber());
        msg.setMessageType(MessageType.SYSTEM);
        quote.addMessage(msg);

        Quote savedQuote = quoteRepository.save(quote);
        return mapToResponse(savedQuote);
    }

    /**
     * Extend quote validity (supplier action)
     */
    @Transactional
    public QuoteResponse extendValidity(String quoteNumber, int additionalDays, Long supplierId) {
        Quote quote = quoteRepository.findByQuoteNumber(quoteNumber)
                .orElseThrow(() -> new RuntimeException("Quote not found: " + quoteNumber));

        if (!quote.getSupplierId().equals(supplierId)) {
            throw new RuntimeException("Not authorized to extend this quote");
        }

        quote.extendValidity(additionalDays);

        // Add extension message
        QuoteMessage msg = new QuoteMessage();
        msg.setSenderId(supplierId);
        msg.setSenderName(quote.getSupplierName());
        msg.setSenderType(SenderType.SUPPLIER);
        msg.setMessage("Quote validity extended by " + additionalDays + " days. New expiry: " + quote.getValidUntil());
        msg.setMessageType(MessageType.EXTENSION);
        quote.addMessage(msg);

        Quote savedQuote = quoteRepository.save(quote);
        return mapToResponse(savedQuote);
    }

    /**
     * Add message to quote thread
     */
    @Transactional
    public QuoteResponse addMessage(String quoteNumber, QuoteMessageRequest request) {
        Quote quote = quoteRepository.findByQuoteNumber(quoteNumber)
                .orElseThrow(() -> new RuntimeException("Quote not found: " + quoteNumber));

        QuoteMessage msg = new QuoteMessage();
        msg.setSenderId(request.getSenderId());
        msg.setSenderName(request.getSenderName());
        msg.setSenderType(SenderType.valueOf(request.getSenderType()));
        msg.setMessage(request.getMessage());
        msg.setMessageType(request.getMessageType() != null ? 
                MessageType.valueOf(request.getMessageType()) : MessageType.TEXT);
        if (request.getAttachmentUrl() != null) {
            msg.setAttachmentUrl(request.getAttachmentUrl());
        }
        quote.addMessage(msg);

        Quote savedQuote = quoteRepository.save(quote);
        return mapToResponse(savedQuote);
    }

    /**
     * Get quote statistics for supplier dashboard
     */
    public Map<String, Object> getSupplierQuoteStats(Long supplierId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("pendingCount", quoteRepository.countBySupplierIdAndStatus(supplierId, QuoteStatus.PENDING));
        stats.put("respondedCount", quoteRepository.countBySupplierIdAndStatus(supplierId, QuoteStatus.SUPPLIER_RESPONDED));
        stats.put("negotiatingCount", quoteRepository.countBySupplierIdAndStatus(supplierId, QuoteStatus.NEGOTIATING));
        stats.put("approvedCount", quoteRepository.countBySupplierIdAndStatus(supplierId, QuoteStatus.APPROVED));
        stats.put("convertedCount", quoteRepository.countConvertedQuotes(supplierId));
        stats.put("convertedValue", quoteRepository.sumConvertedQuoteValue(supplierId));
        stats.put("expiringSoon", quoteRepository.findExpiringSoon(supplierId, LocalDate.now().plusDays(3)).size());
        return stats;
    }

    /**
     * Map Quote entity to response DTO
     */
    private QuoteResponse mapToResponse(Quote quote) {
        QuoteResponse response = new QuoteResponse();
        response.setId(quote.getId());
        response.setQuoteNumber(quote.getQuoteNumber());
        response.setBuyerId(quote.getBuyerId());
        response.setBuyerName(quote.getBuyerName());
        response.setBuyerEmail(quote.getBuyerEmail());
        response.setBuyerPhone(quote.getBuyerPhone());
        response.setBuyerCompany(quote.getBuyerCompany());
        response.setSupplierId(quote.getSupplierId());
        response.setSupplierName(quote.getSupplierName());
        response.setStatus(quote.getStatus().name());
        response.setStatusLabel(QuoteResponse.getStatusLabel(quote.getStatus().name()));
        response.setOriginalTotal(quote.getOriginalTotal());
        response.setQuotedTotal(quote.getQuotedTotal());
        response.setFinalTotal(quote.getFinalTotal());
        response.setDiscountPercentage(quote.getDiscountPercentage());
        response.setDiscountAmount(quote.getDiscountAmount());
        response.setCurrency(quote.getCurrency());
        response.setShippingAddress(quote.getShippingAddress());
        response.setBuyerRequirements(quote.getBuyerRequirements());
        response.setSupplierNotes(quote.getSupplierNotes());
        response.setRejectionReason(quote.getRejectionReason());
        response.setValidityDays(quote.getValidityDays());
        response.setValidUntil(quote.getValidUntil());
        response.setIsExpired(quote.isExpired());
        response.setDaysRemaining(quote.getValidUntil() != null ? 
                (int) ChronoUnit.DAYS.between(LocalDate.now(), quote.getValidUntil()) : 0);
        response.setCreatedAt(quote.getCreatedAt());
        response.setUpdatedAt(quote.getUpdatedAt());
        response.setRespondedAt(quote.getRespondedAt());
        response.setApprovedAt(quote.getApprovedAt());
        response.setConvertedToOrderAt(quote.getConvertedToOrderAt());
        response.setOrderId(quote.getOrderId());
        response.setOrderNumber(quote.getOrderNumber());
        response.setIsFromCart(quote.getIsFromCart());
        response.setNegotiationCount(quote.getNegotiationCount());

        // Map items
        List<QuoteResponse.QuoteItemResponse> itemResponses = quote.getItems().stream()
                .map(item -> {
                    QuoteResponse.QuoteItemResponse itemRes = new QuoteResponse.QuoteItemResponse();
                    itemRes.setId(item.getId());
                    itemRes.setProductId(item.getProductId());
                    itemRes.setProductName(item.getProductName());
                    itemRes.setProductImage(item.getProductImage());
                    itemRes.setQuantity(item.getQuantity());
                    itemRes.setRequestedQuantity(item.getRequestedQuantity());
                    itemRes.setOriginalPrice(item.getOriginalPrice());
                    itemRes.setQuotedPrice(item.getQuotedPrice());
                    itemRes.setFinalPrice(item.getFinalPrice());
                    itemRes.setUnit(item.getUnit());
                    itemRes.setSpecifications(item.getSpecifications());
                    itemRes.setSupplierNotes(item.getSupplierNotes());
                    itemRes.setLeadTimeDays(item.getLeadTimeDays());
                    itemRes.setLineTotal(item.getLineTotal());
                    return itemRes;
                })
                .collect(Collectors.toList());
        response.setItems(itemResponses);

        // Map messages
        List<QuoteResponse.QuoteMessageResponse> messageResponses = quote.getMessages().stream()
                .map(msg -> {
                    QuoteResponse.QuoteMessageResponse msgRes = new QuoteResponse.QuoteMessageResponse();
                    msgRes.setId(msg.getId());
                    msgRes.setSenderId(msg.getSenderId());
                    msgRes.setSenderName(msg.getSenderName());
                    msgRes.setSenderType(msg.getSenderType().name());
                    msgRes.setMessage(msg.getMessage());
                    msgRes.setMessageType(msg.getMessageType().name());
                    msgRes.setAttachmentUrl(msg.getAttachmentUrl());
                    msgRes.setIsRead(msg.getIsRead());
                    msgRes.setCreatedAt(msg.getCreatedAt());
                    return msgRes;
                })
                .collect(Collectors.toList());
        response.setMessages(messageResponses);

        return response;
    }
}
