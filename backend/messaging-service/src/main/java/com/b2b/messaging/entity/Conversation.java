package com.b2b.messaging.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "conversations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long buyerId;

    @Column(nullable = false)
    private Long supplierId;

    private String lastMessage;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    private Long lastMessageId;

    @Column(nullable = false)
    private int unreadCountBuyer = 0;

    @Column(nullable = false)
    private int unreadCountSupplier = 0;

    // Soft delete timestamps - conversation hidden from user but kept in DB for 6 months
    @Column(name = "cleared_by_buyer")
    private LocalDateTime clearedByBuyer;

    @Column(name = "cleared_by_supplier")
    private LocalDateTime clearedBySupplier;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Check if conversation is cleared for a specific user
    public boolean isClearedForUser(Long userId) {
        if (userId.equals(buyerId) && clearedByBuyer != null) {
            return true;
        }
        if (userId.equals(supplierId) && clearedBySupplier != null) {
            return true;
        }
        return false;
    }
}
