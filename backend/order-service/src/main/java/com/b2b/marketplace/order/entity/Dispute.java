package com.b2b.marketplace.order.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Order Dispute Entity - Compliant with Indian E-Commerce Laws
 * 
 * Consumer Protection Act 2019 & E-Commerce Rules 2020 Requirements:
 * - 48 hours: Acknowledge grievance
 * - 30 days: Resolve the dispute
 * - Escalation mechanism for unresolved disputes
 * - Refund processing within specified timelines
 */
@Entity
@Table(name = "disputes")
@Data
public class Dispute {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "ticket_number", unique = true, nullable = false)
    private String ticketNumber;
    
    @Column(name = "order_id", nullable = false)
    private Long orderId;
    
    @Column(name = "order_number", nullable = false)
    private String orderNumber;
    
    @Column(name = "buyer_id", nullable = false)
    private Long buyerId;
    
    @Column(name = "buyer_name")
    private String buyerName;
    
    @Column(name = "buyer_email")
    private String buyerEmail;
    
    @Column(name = "buyer_phone")
    private String buyerPhone;
    
    @Column(name = "supplier_id", nullable = false)
    private Long supplierId;
    
    @Column(name = "supplier_name")
    private String supplierName;
    
    // Dispute Details
    @Enumerated(EnumType.STRING)
    @Column(name = "dispute_type", nullable = false)
    private DisputeType disputeType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DisputeStatus status = DisputeStatus.OPEN;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "priority")
    private DisputePriority priority = DisputePriority.MEDIUM;
    
    @Column(name = "subject", nullable = false)
    private String subject;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    // Affected Items (JSON array of product IDs/names)
    @Column(name = "affected_items", columnDefinition = "TEXT")
    private String affectedItems;
    
    // Evidence/Proof
    @Column(name = "evidence_urls", columnDefinition = "TEXT")
    private String evidenceUrls; // JSON array of image/document URLs
    
    // Refund Request
    @Column(name = "refund_requested")
    private Boolean refundRequested = false;
    
    @Column(name = "refund_amount", precision = 12, scale = 2)
    private BigDecimal refundAmount;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "refund_status")
    private RefundStatus refundStatus;
    
    @Column(name = "refund_processed_at")
    private LocalDateTime refundProcessedAt;
    
    // Resolution Details
    @Enumerated(EnumType.STRING)
    @Column(name = "resolution_type")
    private ResolutionType resolutionType;
    
    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;
    
    @Column(name = "resolved_by")
    private Long resolvedBy;
    
    @Column(name = "resolved_by_name")
    private String resolvedByName;
    
    // Compliance Tracking (Indian E-Commerce Rules)
    @Column(name = "acknowledgment_deadline")
    private LocalDateTime acknowledgmentDeadline; // 48 hours from creation
    
    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;
    
    @Column(name = "resolution_deadline")
    private LocalDateTime resolutionDeadline; // 30 days from creation
    
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
    
    @Column(name = "escalated_at")
    private LocalDateTime escalatedAt;
    
    @Column(name = "escalation_level")
    private Integer escalationLevel = 0; // 0=None, 1=Senior Support, 2=Management, 3=Legal/Nodal Officer
    
    @Column(name = "escalation_reason")
    private String escalationReason;
    
    // Satisfaction
    @Column(name = "buyer_satisfaction_rating")
    private Integer buyerSatisfactionRating; // 1-5 stars
    
    @Column(name = "buyer_feedback", columnDefinition = "TEXT")
    private String buyerFeedback;
    
    // Timestamps
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "closed_at")
    private LocalDateTime closedAt;
    
    // Messages/Communication Thread
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "dispute_id")
    @OrderBy("createdAt ASC")
    private List<DisputeMessage> messages = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        
        // Generate ticket number
        if (ticketNumber == null) {
            ticketNumber = "TKT" + System.currentTimeMillis();
        }
        
        // Set compliance deadlines as per Indian E-Commerce Rules
        acknowledgmentDeadline = createdAt.plusHours(48);
        resolutionDeadline = createdAt.plusDays(30);
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public void addMessage(DisputeMessage message) {
        messages.add(message);
        message.setCreatedAt(LocalDateTime.now());
    }
    
    public boolean isOverdueForAcknowledgment() {
        return acknowledgedAt == null && 
               LocalDateTime.now().isAfter(acknowledgmentDeadline);
    }
    
    public boolean isOverdueForResolution() {
        return resolvedAt == null && 
               LocalDateTime.now().isAfter(resolutionDeadline);
    }
    
    public long getDaysToResolve() {
        if (resolutionDeadline == null) return 0;
        long days = java.time.temporal.ChronoUnit.DAYS.between(LocalDateTime.now(), resolutionDeadline);
        return Math.max(0, days);
    }
    
    // Enums
    public enum DisputeType {
        PRODUCT_QUALITY("Product Quality Issue"),
        WRONG_PRODUCT("Wrong Product Delivered"),
        DAMAGED_PRODUCT("Damaged/Defective Product"),
        MISSING_ITEMS("Missing Items in Order"),
        DELIVERY_ISSUE("Delivery/Shipping Issue"),
        DELAYED_DELIVERY("Delayed Delivery"),
        NOT_AS_DESCRIBED("Product Not As Described"),
        PAYMENT_ISSUE("Payment/Billing Issue"),
        REFUND_REQUEST("Refund Request"),
        WARRANTY_CLAIM("Warranty Claim"),
        OTHER("Other Issue");
        
        private final String label;
        
        DisputeType(String label) {
            this.label = label;
        }
        
        public String getLabel() {
            return label;
        }
    }
    
    public enum DisputeStatus {
        OPEN("Open"),
        ACKNOWLEDGED("Acknowledged"),
        UNDER_REVIEW("Under Review"),
        SUPPLIER_RESPONDED("Supplier Responded"),
        AWAITING_BUYER("Awaiting Buyer Response"),
        ESCALATED("Escalated"),
        RESOLUTION_PROPOSED("Resolution Proposed"),
        RESOLVED("Resolved"),
        CLOSED("Closed"),
        REOPENED("Reopened");
        
        private final String label;
        
        DisputeStatus(String label) {
            this.label = label;
        }
        
        public String getLabel() {
            return label;
        }
    }
    
    public enum DisputePriority {
        LOW("Low"),
        MEDIUM("Medium"),
        HIGH("High"),
        URGENT("Urgent");
        
        private final String label;
        
        DisputePriority(String label) {
            this.label = label;
        }
        
        public String getLabel() {
            return label;
        }
    }
    
    public enum RefundStatus {
        NOT_REQUESTED("Not Requested"),
        REQUESTED("Refund Requested"),
        APPROVED("Refund Approved"),
        PROCESSING("Processing Refund"),
        COMPLETED("Refund Completed"),
        REJECTED("Refund Rejected"),
        PARTIAL("Partial Refund");
        
        private final String label;
        
        RefundStatus(String label) {
            this.label = label;
        }
        
        public String getLabel() {
            return label;
        }
    }
    
    public enum ResolutionType {
        FULL_REFUND("Full Refund"),
        PARTIAL_REFUND("Partial Refund"),
        REPLACEMENT("Product Replacement"),
        REPAIR("Product Repair/Fix"),
        CREDIT_NOTE("Store Credit/Coupon"),
        REDELIVERY("Re-delivery"),
        EXPLANATION("Explanation Provided"),
        NO_ACTION("No Action Required"),
        BUYER_WITHDREW("Buyer Withdrew Complaint");
        
        private final String label;
        
        ResolutionType(String label) {
            this.label = label;
        }
        
        public String getLabel() {
            return label;
        }
    }
}
