package com.b2b.marketplace.order.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class InvoiceDTO {
    // Invoice Header
    private String invoiceNumber;
    private LocalDateTime invoiceDate;
    private String orderNumber;
    private LocalDateTime orderDate;
    
    // Seller Details
    private String sellerName;
    private String sellerAddress;
    private String sellerGstin;
    private String sellerPan;
    private String sellerPhone;
    private String sellerEmail;
    private String sellerStateCode;
    
    // Buyer Details
    private String buyerName;
    private String buyerAddress;
    private String buyerGstin;
    private String buyerPhone;
    private String buyerEmail;
    private String buyerStateCode;
    
    // Shipping Details
    private String shippingAddress;
    private String placeOfSupply;
    private String placeOfSupplyCode;
    
    // Items
    private List<InvoiceItemDTO> items;
    
    // Totals
    private BigDecimal subtotal;
    private BigDecimal cgstAmount;
    private BigDecimal sgstAmount;
    private BigDecimal igstAmount;
    private BigDecimal cessAmount;
    private BigDecimal totalTax;
    private BigDecimal shippingCost;
    private BigDecimal totalAmount;
    private String totalAmountInWords;
    
    // Tax Summary
    private List<TaxSummaryDTO> taxSummary;
    
    // Payment Details
    private String paymentMethod;
    private String paymentStatus;
    private String bankDetails;
    
    // Additional Info
    private String termsAndConditions;
    private boolean isSameState;
    private boolean isReverseCharge = false;
    
    @Data
    public static class InvoiceItemDTO {
        private int serialNo;
        private String productName;
        private String description;
        private String hsnCode;
        private BigDecimal quantity;
        private String unit;
        private BigDecimal unitPrice;
        private BigDecimal discount;
        private BigDecimal taxableValue;
        private BigDecimal cgstRate;
        private BigDecimal cgstAmount;
        private BigDecimal sgstRate;
        private BigDecimal sgstAmount;
        private BigDecimal igstRate;
        private BigDecimal igstAmount;
        private BigDecimal totalAmount;
    }
    
    @Data
    public static class TaxSummaryDTO {
        private String taxType;
        private BigDecimal rate;
        private BigDecimal taxableAmount;
        private BigDecimal taxAmount;
    }
}
