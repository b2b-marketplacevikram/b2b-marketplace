package com.b2b.marketplace.order.controller;

import com.b2b.marketplace.order.dto.AnalyticsResponse;
import com.b2b.marketplace.order.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    
    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/supplier/stats")
    public ResponseEntity<?> getSupplierStats(@RequestParam(defaultValue = "month") String period) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() 
                    || "anonymousUser".equals(authentication.getName())) {
                return ResponseEntity.status(401).body("User not authenticated. Please login.");
            }
            
            Long userId = Long.parseLong(authentication.getName());
            AnalyticsResponse analytics = analyticsService.getSupplierAnalytics(userId, period);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching analytics: " + e.getMessage());
        }
    }

    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenueTrend(@RequestParam(defaultValue = "month") String period) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() 
                    || "anonymousUser".equals(authentication.getName())) {
                return ResponseEntity.status(401).body("User not authenticated. Please login.");
            }
            
            Long userId = Long.parseLong(authentication.getName());
            var revenueData = analyticsService.getRevenueTrend(userId, period);
            return ResponseEntity.ok(revenueData);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching revenue trend: " + e.getMessage());
        }
    }
}
