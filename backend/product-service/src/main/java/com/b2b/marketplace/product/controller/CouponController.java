package com.b2b.marketplace.product.controller;

import com.b2b.marketplace.product.dto.ApiResponse;
import com.b2b.marketplace.product.entity.Coupon;
import com.b2b.marketplace.product.entity.CouponUsage;
import com.b2b.marketplace.product.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {
    
    private final CouponService couponService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Coupon>>> getAllCoupons() {
        return ResponseEntity.ok(ApiResponse.success(couponService.getAllCoupons()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Coupon>>> getActiveCoupons() {
        return ResponseEntity.ok(ApiResponse.success(couponService.getActiveCoupons()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Coupon>> getCouponById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(couponService.getCouponById(id)));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<Coupon>> getCouponByCode(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success(couponService.getCouponByCode(code)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Coupon>> createCoupon(@RequestBody Coupon coupon) {
        return ResponseEntity.ok(ApiResponse.success(couponService.createCoupon(coupon)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Coupon>> updateCoupon(
            @PathVariable Long id,
            @RequestBody Coupon coupon) {
        return ResponseEntity.ok(ApiResponse.success(couponService.updateCoupon(id, coupon)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon deleted successfully", null));
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateCoupon(
            @RequestParam String code,
            @RequestParam Long userId,
            @RequestParam BigDecimal orderAmount,
            @RequestParam(required = false) List<Long> productIds) {
        Map<String, Object> result = couponService.validateCoupon(code, userId, orderAmount, productIds);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/{couponId}/apply")
    public ResponseEntity<ApiResponse<Void>> applyCoupon(
            @PathVariable Long couponId,
            @RequestParam Long userId,
            @RequestParam Long orderId,
            @RequestParam BigDecimal discountAmount) {
        couponService.applyCoupon(couponId, userId, orderId, discountAmount);
        return ResponseEntity.ok(ApiResponse.success("Coupon applied successfully", null));
    }

    @GetMapping("/{couponId}/usage")
    public ResponseEntity<ApiResponse<List<CouponUsage>>> getCouponUsageHistory(@PathVariable Long couponId) {
        return ResponseEntity.ok(ApiResponse.success(couponService.getCouponUsageHistory(couponId)));
    }

    @GetMapping("/user/{userId}/history")
    public ResponseEntity<ApiResponse<List<CouponUsage>>> getUserCouponHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(couponService.getUserCouponHistory(userId)));
    }
}
