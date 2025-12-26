package com.b2b.marketplace.admin.service;

import com.b2b.marketplace.admin.dto.DashboardStatsDTO;
import com.b2b.marketplace.admin.dto.UserAdminDTO;
import com.b2b.marketplace.admin.entity.User;
import com.b2b.marketplace.admin.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;

    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        
        // User statistics
        stats.setTotalUsers(userRepository.count());
        stats.setTotalBuyers(userRepository.countBuyers());
        stats.setTotalSuppliers(userRepository.countSuppliers());
        stats.setInactiveUsers(userRepository.countInactiveUsers());
        
        // Product statistics
        try {
            Long totalProducts = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM products", Long.class);
            stats.setTotalProducts(totalProducts);
            
            Long activeProducts = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM products WHERE is_active = true", Long.class);
            stats.setActiveProducts(activeProducts);
        } catch (Exception e) {
            log.error("Error fetching product stats", e);
            stats.setTotalProducts(0L);
            stats.setActiveProducts(0L);
        }
        
        // Order statistics
        try {
            Long totalOrders = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM orders", Long.class);
            stats.setTotalOrders(totalOrders);
            
            Long pendingOrders = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM orders WHERE status = 'PENDING'", Long.class);
            stats.setPendingOrders(pendingOrders);
            
            BigDecimal totalRevenue = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status != 'CANCELLED'", 
                BigDecimal.class);
            stats.setTotalRevenue(totalRevenue);
            
            BigDecimal avgOrderValue = jdbcTemplate.queryForObject(
                "SELECT COALESCE(AVG(total_amount), 0) FROM orders WHERE status != 'CANCELLED'", 
                BigDecimal.class);
            stats.setAverageOrderValue(avgOrderValue);
        } catch (Exception e) {
            log.error("Error fetching order stats", e);
            stats.setTotalOrders(0L);
            stats.setPendingOrders(0L);
            stats.setTotalRevenue(BigDecimal.ZERO);
            stats.setAverageOrderValue(BigDecimal.ZERO);
        }
        
        return stats;
    }

    public List<UserAdminDTO> getAllUsers() {
        return userRepository.findAll().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public List<UserAdminDTO> getUsersByType(String type) {
        User.UserType userType = User.UserType.valueOf(type.toUpperCase());
        return userRepository.findByUserType(userType).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public UserAdminDTO updateUserStatus(Long userId, Boolean isActive) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(isActive);
        user = userRepository.save(user);
        return mapToDTO(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    public List<Map<String, Object>> getRecentOrders(int limit) {
        String sql = "SELECT o.id, o.order_number, o.buyer_id, o.supplier_id, " +
                    "o.total_amount, o.status, o.created_at, " +
                    "u.full_name as buyer_name " +
                    "FROM orders o " +
                    "LEFT JOIN users u ON o.buyer_id = u.id " +
                    "ORDER BY o.created_at DESC LIMIT ?";
        return jdbcTemplate.queryForList(sql, limit);
    }

    public List<Map<String, Object>> getTopProducts(int limit) {
        String sql = "SELECT p.id, p.name, p.supplier_id, p.unit_price, " +
                    "COUNT(oi.id) as order_count, " +
                    "SUM(oi.quantity) as total_quantity " +
                    "FROM products p " +
                    "LEFT JOIN order_items oi ON p.id = oi.product_id " +
                    "GROUP BY p.id, p.name, p.supplier_id, p.unit_price " +
                    "ORDER BY order_count DESC LIMIT ?";
        return jdbcTemplate.queryForList(sql, limit);
    }

    public List<Map<String, Object>> getTopSuppliers(int limit) {
        String sql = "SELECT u.id, u.full_name, u.email, " +
                    "COUNT(DISTINCT o.id) as order_count, " +
                    "SUM(o.total_amount) as total_revenue " +
                    "FROM users u " +
                    "LEFT JOIN orders o ON u.id = o.supplier_id " +
                    "WHERE u.user_type = 'SUPPLIER' " +
                    "GROUP BY u.id, u.full_name, u.email " +
                    "ORDER BY total_revenue DESC LIMIT ?";
        return jdbcTemplate.queryForList(sql, limit);
    }

    private UserAdminDTO mapToDTO(User user) {
        UserAdminDTO dto = new UserAdminDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setUserType(user.getUserType().toString());
        dto.setIsActive(user.getIsActive());
        dto.setIsVerified(user.getIsVerified());
        dto.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        dto.setLastLogin(user.getLastLogin() != null ? user.getLastLogin().toString() : null);
        return dto;
    }
}
