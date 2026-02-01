package com.b2b.marketplace.product.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "classification_attributes")
@Data
public class ClassificationAttribute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "class_id", nullable = false)
    private Long classId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", insertable = false, updatable = false)
    private ClassificationClass classificationClass;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "display_name", nullable = false, length = 200)
    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(name = "data_type", length = 20)
    private DataType dataType = DataType.TEXT;

    @Column(length = 50)
    private String unit;

    @Column(name = "allowed_values", columnDefinition = "TEXT")
    private String allowedValues; // JSON array

    @Column(name = "is_required")
    private Boolean isRequired = false;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Column(name = "help_text", length = 500)
    private String helpText;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
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

    public enum DataType {
        TEXT, NUMBER, DROPDOWN, MULTISELECT
    }
}
