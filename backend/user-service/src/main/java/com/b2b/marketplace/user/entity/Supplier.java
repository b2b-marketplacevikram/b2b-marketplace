package com.b2b.marketplace.user.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "suppliers")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true, nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    @JsonIgnore
    private User user;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "business_type")
    private String businessType;

    private String country;
    private String city;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "business_license")
    private String businessLicense;

    @Column(name = "tax_id")
    private String taxId;

    private String website;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "banner_url")
    private String bannerUrl;

    @Column(columnDefinition = "DECIMAL(3,2)")
    private Double rating = 0.0;

    @Column(name = "total_orders")
    private Integer totalOrders = 0;

    @Column(name = "total_customers")
    private Integer totalCustomers = 0;

    @Column(name = "response_rate", columnDefinition = "DECIMAL(5,2)")
    private Double responseRate = 0.0;

    @Column(name = "on_time_delivery_rate", columnDefinition = "DECIMAL(5,2)")
    private Double onTimeDeliveryRate = 0.0;

    @Column(name = "years_in_business")
    private Integer yearsInBusiness = 0;

    private Boolean verified = false;

    // WhatsApp Notification Settings
    @Column(name = "whatsapp_number")
    private String whatsappNumber;

    @Column(name = "whatsapp_notifications_enabled")
    private Boolean whatsappNotificationsEnabled = true;

    @Column(name = "notify_on_search")
    private Boolean notifyOnSearch = true;

    @Column(name = "notify_on_new_order")
    private Boolean notifyOnNewOrder = true;

    @Column(name = "notify_on_payment")
    private Boolean notifyOnPayment = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
