package com.b2b.marketplace.search.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Entity
@Table(name = "bundle_items")
@Data
public class BundleItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "bundle_id")
    private Long bundleId;
    
    @Column(name = "product_id")
    private Long productId;
    
    private Integer quantity;
    
    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
}
