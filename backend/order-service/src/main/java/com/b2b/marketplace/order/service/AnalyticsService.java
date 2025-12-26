package com.b2b.marketplace.order.service;

import com.b2b.marketplace.order.dto.AnalyticsResponse;
import com.b2b.marketplace.order.entity.Order;
import com.b2b.marketplace.order.entity.OrderItem;
import com.b2b.marketplace.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String PRODUCT_SERVICE_URL = "http://localhost:8082/api/products";

    public AnalyticsResponse getSupplierAnalytics(Long userId, String period) {
        // Get supplier ID from user ID
        Long supplierId = getSupplierIdFromUserId(userId);
        if (supplierId == null) {
            return getEmptyAnalytics();
        }

        // Calculate date ranges based on period
        LocalDateTime currentEnd = LocalDateTime.now();
        LocalDateTime currentStart = getStartDate(currentEnd, period);
        LocalDateTime previousStart = getStartDate(currentStart, period);

        // Get orders for current and previous periods
        List<Order> currentOrders = orderRepository.findBySupplierIdAndCreatedAtBetween(
                supplierId, currentStart, currentEnd);
        List<Order> previousOrders = orderRepository.findBySupplierIdAndCreatedAtBetween(
                supplierId, previousStart, currentStart);

        // Calculate metrics
        AnalyticsResponse.MetricData revenue = calculateRevenue(currentOrders, previousOrders);
        AnalyticsResponse.MetricData orders = calculateOrders(currentOrders, previousOrders);
        AnalyticsResponse.MetricData avgOrderValue = calculateAvgOrderValue(currentOrders, previousOrders);
        AnalyticsResponse.MetricData conversion = calculateConversion(currentOrders.size(), previousOrders.size());

        // Get top products
        List<AnalyticsResponse.ProductStats> topProducts = getTopProducts(supplierId, currentStart, currentEnd);

        // Get top buyers
        List<AnalyticsResponse.BuyerStats> topBuyers = getTopBuyers(supplierId, currentStart, currentEnd);

        // Get revenue trend
        List<AnalyticsResponse.RevenueByMonth> revenueData = getRevenueByPeriod(supplierId, period);

        // Get category breakdown
        List<AnalyticsResponse.CategoryStats> categoryData = getCategoryBreakdown(supplierId, currentStart, currentEnd);

        AnalyticsResponse response = new AnalyticsResponse();
        response.setRevenue(revenue);
        response.setOrders(orders);
        response.setAvgOrderValue(avgOrderValue);
        response.setConversion(conversion);
        response.setTopProducts(topProducts);
        response.setTopBuyers(topBuyers);
        response.setRevenueData(revenueData);
        response.setCategoryData(categoryData);

        return response;
    }

    public List<AnalyticsResponse.RevenueByMonth> getRevenueTrend(Long userId, String period) {
        Long supplierId = getSupplierIdFromUserId(userId);
        if (supplierId == null) {
            return new ArrayList<>();
        }
        return getRevenueByPeriod(supplierId, period);
    }

    private Long getSupplierIdFromUserId(Long userId) {
        try {
            String url = "http://localhost:8081/api/suppliers/user/" + userId;
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && response.containsKey("id")) {
                Object idObj = response.get("id");
                return idObj instanceof Integer ? ((Integer) idObj).longValue() : (Long) idObj;
            }
        } catch (Exception e) {
            log.error("Error fetching supplier by user ID {}: {}", userId, e.getMessage());
        }
        return null;
    }

    private LocalDateTime getStartDate(LocalDateTime end, String period) {
        return switch (period.toLowerCase()) {
            case "week" -> end.minusWeeks(1);
            case "year" -> end.minusYears(1);
            default -> end.minusMonths(1);
        };
    }

    private AnalyticsResponse.MetricData calculateRevenue(List<Order> current, List<Order> previous) {
        BigDecimal currentRevenue = current.stream()
                .map(Order::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal previousRevenue = previous.stream()
                .map(Order::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Double growth = calculateGrowthPercentage(currentRevenue, previousRevenue);

        return new AnalyticsResponse.MetricData(currentRevenue, previousRevenue, growth);
    }

    private AnalyticsResponse.MetricData calculateOrders(List<Order> current, List<Order> previous) {
        BigDecimal currentCount = new BigDecimal(current.size());
        BigDecimal previousCount = new BigDecimal(previous.size());
        Double growth = calculateGrowthPercentage(currentCount, previousCount);

        return new AnalyticsResponse.MetricData(currentCount, previousCount, growth);
    }

    private AnalyticsResponse.MetricData calculateAvgOrderValue(List<Order> current, List<Order> previous) {
        BigDecimal currentAvg = current.isEmpty() ? BigDecimal.ZERO :
                current.stream()
                        .map(Order::getTotalAmount)
                        .filter(Objects::nonNull)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(new BigDecimal(current.size()), 2, RoundingMode.HALF_UP);

        BigDecimal previousAvg = previous.isEmpty() ? BigDecimal.ZERO :
                previous.stream()
                        .map(Order::getTotalAmount)
                        .filter(Objects::nonNull)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(new BigDecimal(previous.size()), 2, RoundingMode.HALF_UP);

        Double growth = calculateGrowthPercentage(currentAvg, previousAvg);

        return new AnalyticsResponse.MetricData(currentAvg, previousAvg, growth);
    }

    private AnalyticsResponse.MetricData calculateConversion(int currentOrders, int previousOrders) {
        // Simplified conversion rate calculation (would need actual visitor/click data)
        BigDecimal currentConversion = new BigDecimal(currentOrders > 0 ? 3.5 : 0);
        BigDecimal previousConversion = new BigDecimal(previousOrders > 0 ? 3.0 : 0);
        Double growth = calculateGrowthPercentage(currentConversion, previousConversion);

        return new AnalyticsResponse.MetricData(currentConversion, previousConversion, growth);
    }

    private Double calculateGrowthPercentage(BigDecimal current, BigDecimal previous) {
        if (previous.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal(100))
                .doubleValue();
    }

    private List<AnalyticsResponse.ProductStats> getTopProducts(Long supplierId, LocalDateTime start, LocalDateTime end) {
        List<Order> orders = orderRepository.findBySupplierIdAndCreatedAtBetween(supplierId, start, end);

        Map<Long, ProductSalesData> productSales = new HashMap<>();

        for (Order order : orders) {
            for (OrderItem item : order.getItems()) {
                Long productId = item.getProductId();
                ProductSalesData data = productSales.computeIfAbsent(productId, 
                        k -> new ProductSalesData(productId, item.getProductName()));
                data.addSale(item.getQuantity(), item.getTotalPrice());
            }
        }

        return productSales.values().stream()
                .sorted((a, b) -> b.revenue.compareTo(a.revenue))
                .limit(5)
                .map(data -> new AnalyticsResponse.ProductStats(
                        data.productId,
                        data.productName,
                        data.quantity,
                        data.revenue,
                        0.0 // Growth calculation would require historical data
                ))
                .collect(Collectors.toList());
    }

    private List<AnalyticsResponse.BuyerStats> getTopBuyers(Long supplierId, LocalDateTime start, LocalDateTime end) {
        List<Order> orders = orderRepository.findBySupplierIdAndCreatedAtBetween(supplierId, start, end);

        Map<Long, BuyerOrderData> buyerOrders = new HashMap<>();

        for (Order order : orders) {
            Long buyerId = order.getBuyerId();
            BuyerOrderData data = buyerOrders.computeIfAbsent(buyerId, BuyerOrderData::new);
            data.addOrder(order.getTotalAmount(), order.getCreatedAt());
        }

        return buyerOrders.values().stream()
                .sorted((a, b) -> b.revenue.compareTo(a.revenue))
                .limit(5)
                .map(data -> {
                    String companyName = getBuyerCompanyName(data.buyerId);
                    String lastOrderDate = data.lastOrderDate != null ? 
                            data.lastOrderDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) : "";
                    return new AnalyticsResponse.BuyerStats(
                            data.buyerId,
                            companyName,
                            data.orderCount,
                            data.revenue,
                            lastOrderDate
                    );
                })
                .collect(Collectors.toList());
    }

    private String getBuyerCompanyName(Long buyerId) {
        try {
            String url = "http://localhost:8081/api/buyers/" + buyerId;
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && response.containsKey("companyName")) {
                return (String) response.get("companyName");
            }
        } catch (Exception e) {
            log.error("Error fetching buyer company name for buyer {}: {}", buyerId, e.getMessage());
        }
        return "Unknown Buyer";
    }

    private List<AnalyticsResponse.RevenueByMonth> getRevenueByPeriod(Long supplierId, String period) {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = switch (period.toLowerCase()) {
            case "week" -> end.minusWeeks(6);
            case "year" -> end.minusYears(1);
            default -> end.minusMonths(6);
        };

        List<Order> orders = orderRepository.findBySupplierIdAndCreatedAtBetween(supplierId, start, end);

        Map<String, BigDecimal> revenueByPeriod = new TreeMap<>();

        for (Order order : orders) {
            String periodKey = getPeriodKey(order.getCreatedAt(), period);
            BigDecimal revenue = revenueByPeriod.getOrDefault(periodKey, BigDecimal.ZERO);
            revenueByPeriod.put(periodKey, revenue.add(order.getTotalAmount()));
        }

        return revenueByPeriod.entrySet().stream()
                .map(entry -> new AnalyticsResponse.RevenueByMonth(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
    }

    private String getPeriodKey(LocalDateTime date, String period) {
        return switch (period.toLowerCase()) {
            case "week" -> date.format(DateTimeFormatter.ofPattern("MMM dd"));
            case "year" -> date.format(DateTimeFormatter.ofPattern("MMM yyyy"));
            default -> date.format(DateTimeFormatter.ofPattern("MMM"));
        };
    }

    private List<AnalyticsResponse.CategoryStats> getCategoryBreakdown(Long supplierId, LocalDateTime start, LocalDateTime end) {
        List<Order> orders = orderRepository.findBySupplierIdAndCreatedAtBetween(supplierId, start, end);

        Map<String, BigDecimal> categoryRevenue = new HashMap<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;

        for (Order order : orders) {
            for (OrderItem item : order.getItems()) {
                String category = getProductCategory(item.getProductId());
                BigDecimal revenue = categoryRevenue.getOrDefault(category, BigDecimal.ZERO);
                categoryRevenue.put(category, revenue.add(item.getTotalPrice()));
                totalRevenue = totalRevenue.add(item.getTotalPrice());
            }
        }

        final BigDecimal finalTotal = totalRevenue.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.ONE : totalRevenue;

        return categoryRevenue.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .map(entry -> {
                    int percentage = entry.getValue()
                            .divide(finalTotal, 4, RoundingMode.HALF_UP)
                            .multiply(new BigDecimal(100))
                            .intValue();
                    return new AnalyticsResponse.CategoryStats(
                            entry.getKey(),
                            percentage,
                            entry.getValue()
                    );
                })
                .collect(Collectors.toList());
    }

    private String getProductCategory(Long productId) {
        try {
            String url = PRODUCT_SERVICE_URL + "/" + productId;
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && response.containsKey("data")) {
                Map<String, Object> productData = (Map<String, Object>) response.get("data");
                if (productData != null && productData.containsKey("categoryName")) {
                    return (String) productData.get("categoryName");
                }
            }
        } catch (Exception e) {
            log.error("Error fetching product category for product {}: {}", productId, e.getMessage());
        }
        return "Uncategorized";
    }

    private AnalyticsResponse getEmptyAnalytics() {
        AnalyticsResponse response = new AnalyticsResponse();
        response.setRevenue(new AnalyticsResponse.MetricData(BigDecimal.ZERO, BigDecimal.ZERO, 0.0));
        response.setOrders(new AnalyticsResponse.MetricData(BigDecimal.ZERO, BigDecimal.ZERO, 0.0));
        response.setAvgOrderValue(new AnalyticsResponse.MetricData(BigDecimal.ZERO, BigDecimal.ZERO, 0.0));
        response.setConversion(new AnalyticsResponse.MetricData(BigDecimal.ZERO, BigDecimal.ZERO, 0.0));
        response.setTopProducts(new ArrayList<>());
        response.setTopBuyers(new ArrayList<>());
        response.setRevenueData(new ArrayList<>());
        response.setCategoryData(new ArrayList<>());
        return response;
    }

    // Helper classes
    private static class ProductSalesData {
        Long productId;
        String productName;
        Integer quantity = 0;
        BigDecimal revenue = BigDecimal.ZERO;

        ProductSalesData(Long productId, String productName) {
            this.productId = productId;
            this.productName = productName != null ? productName : "Unknown Product";
        }

        void addSale(Integer qty, BigDecimal amount) {
            this.quantity += qty;
            this.revenue = this.revenue.add(amount);
        }
    }

    private static class BuyerOrderData {
        Long buyerId;
        Integer orderCount = 0;
        BigDecimal revenue = BigDecimal.ZERO;
        LocalDateTime lastOrderDate;

        BuyerOrderData(Long buyerId) {
            this.buyerId = buyerId;
        }

        void addOrder(BigDecimal amount, LocalDateTime orderDate) {
            this.orderCount++;
            this.revenue = this.revenue.add(amount);
            if (lastOrderDate == null || orderDate.isAfter(lastOrderDate)) {
                this.lastOrderDate = orderDate;
            }
        }
    }
}
