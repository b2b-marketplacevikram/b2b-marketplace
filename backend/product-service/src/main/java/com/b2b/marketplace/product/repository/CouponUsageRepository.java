package com.b2b.marketplace.product.repository;

import com.b2b.marketplace.product.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {
    List<CouponUsage> findByCouponId(Long couponId);
    List<CouponUsage> findByUserId(Long userId);
    int countByCouponIdAndUserId(Long couponId, Long userId);
    int countByCouponId(Long couponId);
}
