package com.b2b.marketplace.product.repository;

import com.b2b.marketplace.product.entity.BundleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface BundleItemRepository extends JpaRepository<BundleItem, Long> {
    
    List<BundleItem> findByBundleId(Long bundleId);
    
    @Modifying
    @Transactional
    void deleteByBundleId(Long bundleId);
}
