package com.b2b.notification.service;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service to fetch supplier information from User Service
 * Caches phone numbers to reduce API calls
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SupplierInfoService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${user.service.url:http://localhost:8081/api}")
    private String userServiceUrl;

    // Cache for supplier phone numbers (expires after 1 hour)
    private final Map<Long, CachedSupplierInfo> supplierCache = new ConcurrentHashMap<>();
    private static final long CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

    /**
     * Get supplier phone number for WhatsApp notifications
     */
    public String getSupplierPhone(Long supplierId) {
        CachedSupplierInfo cached = supplierCache.get(supplierId);
        
        // Check cache
        if (cached != null && !cached.isExpired()) {
            return cached.getWhatsappNumber();
        }

        // Fetch from user service
        try {
            String url = String.format("%s/suppliers/%d", userServiceUrl, supplierId);
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> supplier = response.getBody();
                
                String whatsappNumber = (String) supplier.get("whatsappNumber");
                Boolean notificationsEnabled = (Boolean) supplier.getOrDefault("whatsappNotificationsEnabled", true);
                Boolean notifyOnSearch = (Boolean) supplier.getOrDefault("notifyOnSearch", true);
                
                // If no WhatsApp number, try regular phone
                if (whatsappNumber == null || whatsappNumber.isEmpty()) {
                    // Try to get from nested user object or phone field
                    Object phone = supplier.get("phone");
                    if (phone != null) {
                        whatsappNumber = phone.toString();
                    }
                }

                // Cache the result
                CachedSupplierInfo info = new CachedSupplierInfo();
                info.setSupplierId(supplierId);
                info.setWhatsappNumber(whatsappNumber);
                info.setNotificationsEnabled(notificationsEnabled != null && notificationsEnabled);
                info.setNotifyOnSearch(notifyOnSearch != null && notifyOnSearch);
                info.setCachedAt(System.currentTimeMillis());
                
                supplierCache.put(supplierId, info);
                
                log.debug("Cached supplier {} info: phone={}, notifyOnSearch={}", 
                         supplierId, whatsappNumber != null, notifyOnSearch);
                
                return whatsappNumber;
            }
        } catch (Exception e) {
            log.warn("Failed to fetch supplier {} info: {}", supplierId, e.getMessage());
        }

        return null;
    }

    /**
     * Get full supplier notification settings
     */
    public SupplierNotificationSettings getSupplierSettings(Long supplierId) {
        CachedSupplierInfo cached = supplierCache.get(supplierId);
        
        if (cached != null && !cached.isExpired()) {
            SupplierNotificationSettings settings = new SupplierNotificationSettings();
            settings.setSupplierId(supplierId);
            settings.setWhatsappNumber(cached.getWhatsappNumber());
            settings.setNotificationsEnabled(cached.isNotificationsEnabled());
            settings.setNotifyOnSearch(cached.isNotifyOnSearch());
            return settings;
        }

        // Fetch fresh data
        getSupplierPhone(supplierId);
        cached = supplierCache.get(supplierId);
        
        if (cached != null) {
            SupplierNotificationSettings settings = new SupplierNotificationSettings();
            settings.setSupplierId(supplierId);
            settings.setWhatsappNumber(cached.getWhatsappNumber());
            settings.setNotificationsEnabled(cached.isNotificationsEnabled());
            settings.setNotifyOnSearch(cached.isNotifyOnSearch());
            return settings;
        }

        return null;
    }

    /**
     * Check if supplier has WhatsApp notifications enabled for search
     */
    public boolean shouldNotifyOnSearch(Long supplierId) {
        SupplierNotificationSettings settings = getSupplierSettings(supplierId);
        if (settings == null) return false;
        
        return settings.isNotificationsEnabled() 
            && settings.isNotifyOnSearch() 
            && settings.getWhatsappNumber() != null 
            && !settings.getWhatsappNumber().isEmpty();
    }

    /**
     * Clear cache for a specific supplier
     */
    public void clearCache(Long supplierId) {
        supplierCache.remove(supplierId);
    }

    /**
     * Clear all cache
     */
    public void clearAllCache() {
        supplierCache.clear();
    }

    @Data
    private static class CachedSupplierInfo {
        private Long supplierId;
        private String whatsappNumber;
        private boolean notificationsEnabled;
        private boolean notifyOnSearch;
        private long cachedAt;

        public boolean isExpired() {
            return System.currentTimeMillis() - cachedAt > CACHE_EXPIRY_MS;
        }
    }

    @Data
    public static class SupplierNotificationSettings {
        private Long supplierId;
        private String whatsappNumber;
        private boolean notificationsEnabled;
        private boolean notifyOnSearch;
    }
}
