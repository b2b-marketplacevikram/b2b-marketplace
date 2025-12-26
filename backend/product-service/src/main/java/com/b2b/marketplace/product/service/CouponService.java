package com.b2b.marketplace.product.service;

import com.b2b.marketplace.product.entity.Coupon;
import com.b2b.marketplace.product.entity.CouponUsage;
import com.b2b.marketplace.product.repository.CouponRepository;
import com.b2b.marketplace.product.repository.CouponUsageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class CouponService {
    
    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    public List<Coupon> getActiveCoupons() {
        return couponRepository.findActiveCoupons(LocalDateTime.now());
    }

    public Coupon getCouponById(Long id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found with id: " + id));
    }

    public Coupon getCouponByCode(String code) {
        return couponRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Coupon not found with code: " + code));
    }

    @Transactional
    public Coupon createCoupon(Coupon coupon) {
        if (couponRepository.findByCode(coupon.getCode()).isPresent()) {
            throw new RuntimeException("Coupon code already exists: " + coupon.getCode());
        }
        return couponRepository.save(coupon);
    }

    @Transactional
    public Coupon updateCoupon(Long id, Coupon couponData) {
        Coupon coupon = getCouponById(id);
        
        if (!coupon.getCode().equals(couponData.getCode()) && 
            couponRepository.findByCode(couponData.getCode()).isPresent()) {
            throw new RuntimeException("Coupon code already exists: " + couponData.getCode());
        }
        
        coupon.setCode(couponData.getCode());
        coupon.setName(couponData.getName());
        coupon.setDescription(couponData.getDescription());
        coupon.setDiscountType(couponData.getDiscountType());
        coupon.setDiscountValue(couponData.getDiscountValue());
        coupon.setMinOrderAmount(couponData.getMinOrderAmount());
        coupon.setMaxDiscountAmount(couponData.getMaxDiscountAmount());
        coupon.setUsageLimit(couponData.getUsageLimit());
        coupon.setPerUserLimit(couponData.getPerUserLimit());
        coupon.setValidFrom(couponData.getValidFrom());
        coupon.setValidUntil(couponData.getValidUntil());
        coupon.setIsActive(couponData.getIsActive());
        coupon.setApplicableTo(couponData.getApplicableTo());
        coupon.setProductIds(couponData.getProductIds());
        coupon.setCategoryIds(couponData.getCategoryIds());
        
        return couponRepository.save(coupon);
    }

    @Transactional
    public void deleteCoupon(Long id) {
        couponRepository.deleteById(id);
    }

    public Map<String, Object> validateCoupon(String code, Long userId, BigDecimal orderAmount, List<Long> productIds) {
        try {
            Coupon coupon = getCouponByCode(code);
            
            if (!coupon.isValid()) {
                return Map.of("valid", false, "message", "Coupon is not valid or has expired");
            }
            
            // Check minimum order amount
            if (coupon.getMinOrderAmount() != null && 
                orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
                return Map.of("valid", false, "message", 
                    String.format("Minimum order amount of $%.2f required", coupon.getMinOrderAmount()));
            }
            
            // Check per user limit
            if (coupon.getPerUserLimit() != null && userId != null) {
                int userUsageCount = couponUsageRepository.countByCouponIdAndUserId(coupon.getId(), userId);
                if (userUsageCount >= coupon.getPerUserLimit()) {
                    return Map.of("valid", false, "message", "You have reached the usage limit for this coupon");
                }
            }
            
            // Calculate discount
            BigDecimal discount = calculateDiscount(coupon, orderAmount);
            
            return Map.of(
                "valid", true,
                "coupon", coupon,
                "discount", discount,
                "message", "Coupon applied successfully"
            );
        } catch (Exception e) {
            return Map.of("valid", false, "message", e.getMessage());
        }
    }

    public BigDecimal calculateDiscount(Coupon coupon, BigDecimal orderAmount) {
        BigDecimal discount = BigDecimal.ZERO;
        
        switch (coupon.getDiscountType()) {
            case PERCENTAGE:
                discount = orderAmount.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100));
                if (coupon.getMaxDiscountAmount() != null && 
                    discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                    discount = coupon.getMaxDiscountAmount();
                }
                break;
            case FIXED_AMOUNT:
                discount = coupon.getDiscountValue();
                if (discount.compareTo(orderAmount) > 0) {
                    discount = orderAmount;
                }
                break;
            case FREE_SHIPPING:
                // Free shipping doesn't reduce order amount, just shipping cost
                discount = BigDecimal.ZERO;
                break;
        }
        
        return discount;
    }

    @Transactional
    public CouponUsage applyCoupon(Long couponId, Long userId, Long orderId, BigDecimal discountAmount) {
        Coupon coupon = getCouponById(couponId);
        
        coupon.setUsageCount(coupon.getUsageCount() + 1);
        couponRepository.save(coupon);
        
        CouponUsage usage = new CouponUsage();
        usage.setCouponId(couponId);
        usage.setUserId(userId);
        usage.setOrderId(orderId);
        usage.setDiscountAmount(discountAmount);
        
        return couponUsageRepository.save(usage);
    }

    public List<CouponUsage> getCouponUsageHistory(Long couponId) {
        return couponUsageRepository.findByCouponId(couponId);
    }

    public List<CouponUsage> getUserCouponHistory(Long userId) {
        return couponUsageRepository.findByUserId(userId);
    }
}
