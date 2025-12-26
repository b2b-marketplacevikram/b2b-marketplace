package com.b2b.marketplace.admin.controller;

import com.b2b.marketplace.admin.dto.DashboardStatsDTO;
import com.b2b.marketplace.admin.dto.UserAdminDTO;
import com.b2b.marketplace.admin.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserAdminDTO>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/users/type/{type}")
    public ResponseEntity<List<UserAdminDTO>> getUsersByType(@PathVariable String type) {
        return ResponseEntity.ok(adminService.getUsersByType(type));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserAdminDTO> updateUserStatus(
            @PathVariable Long id,
            @RequestParam Boolean isActive) {
        return ResponseEntity.ok(adminService.updateUserStatus(id, isActive));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/orders/recent")
    public ResponseEntity<List<Map<String, Object>>> getRecentOrders(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(adminService.getRecentOrders(limit));
    }

    @GetMapping("/products/top")
    public ResponseEntity<List<Map<String, Object>>> getTopProducts(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(adminService.getTopProducts(limit));
    }

    @GetMapping("/suppliers/top")
    public ResponseEntity<List<Map<String, Object>>> getTopSuppliers(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(adminService.getTopSuppliers(limit));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "admin-service"));
    }
}
