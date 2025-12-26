package com.b2b.marketplace.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private Long totalUsers;
    private Long totalBuyers;
    private Long totalSuppliers;
    private Long totalProducts;
    private Long totalOrders;
    private BigDecimal totalRevenue;
    private Long pendingOrders;
    private Long activeProducts;
    private Long inactiveUsers;
    private BigDecimal averageOrderValue;
}
