package com.b2b.marketplace.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    
    private MetricData revenue;
    private MetricData orders;
    private MetricData avgOrderValue;
    private MetricData conversion;
    private List<ProductStats> topProducts;
    private List<BuyerStats> topBuyers;
    private List<RevenueByMonth> revenueData;
    private List<CategoryStats> categoryData;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MetricData {
        private BigDecimal current;
        private BigDecimal previous;
        private Double growth;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductStats {
        private Long productId;
        private String name;
        private Integer sales;
        private BigDecimal revenue;
        private Double growth;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BuyerStats {
        private Long buyerId;
        private String company;
        private Integer orders;
        private BigDecimal revenue;
        private String lastOrder;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueByMonth {
        private String month;
        private BigDecimal revenue;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryStats {
        private String category;
        private Integer percentage;
        private BigDecimal revenue;
    }
}
