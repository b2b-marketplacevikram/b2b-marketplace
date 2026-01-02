package com.b2b.marketplace.order.dto;

import java.math.BigDecimal;
import java.util.List;

public class AnalyticsResponse {
    
    private MetricData revenue;
    private MetricData orders;
    private MetricData avgOrderValue;
    private MetricData conversion;
    private List<ProductStats> topProducts;
    private List<BuyerStats> topBuyers;
    private List<RevenueByMonth> revenueData;
    private List<CategoryStats> categoryData;

    // Constructors
    public AnalyticsResponse() {
    }

    public AnalyticsResponse(MetricData revenue, MetricData orders, MetricData avgOrderValue, 
                             MetricData conversion, List<ProductStats> topProducts, 
                             List<BuyerStats> topBuyers, List<RevenueByMonth> revenueData, 
                             List<CategoryStats> categoryData) {
        this.revenue = revenue;
        this.orders = orders;
        this.avgOrderValue = avgOrderValue;
        this.conversion = conversion;
        this.topProducts = topProducts;
        this.topBuyers = topBuyers;
        this.revenueData = revenueData;
        this.categoryData = categoryData;
    }

    // Getters and Setters
    public MetricData getRevenue() {
        return revenue;
    }

    public void setRevenue(MetricData revenue) {
        this.revenue = revenue;
    }

    public MetricData getOrders() {
        return orders;
    }

    public void setOrders(MetricData orders) {
        this.orders = orders;
    }

    public MetricData getAvgOrderValue() {
        return avgOrderValue;
    }

    public void setAvgOrderValue(MetricData avgOrderValue) {
        this.avgOrderValue = avgOrderValue;
    }

    public MetricData getConversion() {
        return conversion;
    }

    public void setConversion(MetricData conversion) {
        this.conversion = conversion;
    }

    public List<ProductStats> getTopProducts() {
        return topProducts;
    }

    public void setTopProducts(List<ProductStats> topProducts) {
        this.topProducts = topProducts;
    }

    public List<BuyerStats> getTopBuyers() {
        return topBuyers;
    }

    public void setTopBuyers(List<BuyerStats> topBuyers) {
        this.topBuyers = topBuyers;
    }

    public List<RevenueByMonth> getRevenueData() {
        return revenueData;
    }

    public void setRevenueData(List<RevenueByMonth> revenueData) {
        this.revenueData = revenueData;
    }

    public List<CategoryStats> getCategoryData() {
        return categoryData;
    }

    public void setCategoryData(List<CategoryStats> categoryData) {
        this.categoryData = categoryData;
    }
    
    public static class MetricData {
        private BigDecimal current;
        private BigDecimal previous;
        private Double growth;

        public MetricData() {
        }

        public MetricData(BigDecimal current, BigDecimal previous, Double growth) {
            this.current = current;
            this.previous = previous;
            this.growth = growth;
        }

        public BigDecimal getCurrent() {
            return current;
        }

        public void setCurrent(BigDecimal current) {
            this.current = current;
        }

        public BigDecimal getPrevious() {
            return previous;
        }

        public void setPrevious(BigDecimal previous) {
            this.previous = previous;
        }

        public Double getGrowth() {
            return growth;
        }

        public void setGrowth(Double growth) {
            this.growth = growth;
        }
    }
    
    public static class ProductStats {
        private Long productId;
        private String name;
        private Integer sales;
        private BigDecimal revenue;
        private Double growth;

        public ProductStats() {
        }

        public ProductStats(Long productId, String name, Integer sales, BigDecimal revenue, Double growth) {
            this.productId = productId;
            this.name = name;
            this.sales = sales;
            this.revenue = revenue;
            this.growth = growth;
        }

        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Integer getSales() {
            return sales;
        }

        public void setSales(Integer sales) {
            this.sales = sales;
        }

        public BigDecimal getRevenue() {
            return revenue;
        }

        public void setRevenue(BigDecimal revenue) {
            this.revenue = revenue;
        }

        public Double getGrowth() {
            return growth;
        }

        public void setGrowth(Double growth) {
            this.growth = growth;
        }
    }
    
    public static class BuyerStats {
        private Long buyerId;
        private String company;
        private Integer orders;
        private BigDecimal revenue;
        private String lastOrder;

        public BuyerStats() {
        }

        public BuyerStats(Long buyerId, String company, Integer orders, BigDecimal revenue, String lastOrder) {
            this.buyerId = buyerId;
            this.company = company;
            this.orders = orders;
            this.revenue = revenue;
            this.lastOrder = lastOrder;
        }

        public Long getBuyerId() {
            return buyerId;
        }

        public void setBuyerId(Long buyerId) {
            this.buyerId = buyerId;
        }

        public String getCompany() {
            return company;
        }

        public void setCompany(String company) {
            this.company = company;
        }

        public Integer getOrders() {
            return orders;
        }

        public void setOrders(Integer orders) {
            this.orders = orders;
        }

        public BigDecimal getRevenue() {
            return revenue;
        }

        public void setRevenue(BigDecimal revenue) {
            this.revenue = revenue;
        }

        public String getLastOrder() {
            return lastOrder;
        }

        public void setLastOrder(String lastOrder) {
            this.lastOrder = lastOrder;
        }
    }
    
    public static class RevenueByMonth {
        private String month;
        private BigDecimal revenue;

        public RevenueByMonth() {
        }

        public RevenueByMonth(String month, BigDecimal revenue) {
            this.month = month;
            this.revenue = revenue;
        }

        public String getMonth() {
            return month;
        }

        public void setMonth(String month) {
            this.month = month;
        }

        public BigDecimal getRevenue() {
            return revenue;
        }

        public void setRevenue(BigDecimal revenue) {
            this.revenue = revenue;
        }
    }
    
    public static class CategoryStats {
        private String category;
        private Integer percentage;
        private BigDecimal revenue;

        public CategoryStats() {
        }

        public CategoryStats(String category, Integer percentage, BigDecimal revenue) {
            this.category = category;
            this.percentage = percentage;
            this.revenue = revenue;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public Integer getPercentage() {
            return percentage;
        }

        public void setPercentage(Integer percentage) {
            this.percentage = percentage;
        }

        public BigDecimal getRevenue() {
            return revenue;
        }

        public void setRevenue(BigDecimal revenue) {
            this.revenue = revenue;
        }
    }
}
