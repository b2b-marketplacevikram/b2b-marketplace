package com.b2b.marketplace.order.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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

    // Getters and Setters
    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public LocalDateTime getInvoiceDate() {
        return invoiceDate;
    }

    public void setInvoiceDate(LocalDateTime invoiceDate) {
        this.invoiceDate = invoiceDate;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public String getSellerName() {
        return sellerName;
    }

    public void setSellerName(String sellerName) {
        this.sellerName = sellerName;
    }

    public String getSellerAddress() {
        return sellerAddress;
    }

    public void setSellerAddress(String sellerAddress) {
        this.sellerAddress = sellerAddress;
    }

    public String getSellerGstin() {
        return sellerGstin;
    }

    public void setSellerGstin(String sellerGstin) {
        this.sellerGstin = sellerGstin;
    }

    public String getSellerPan() {
        return sellerPan;
    }

    public void setSellerPan(String sellerPan) {
        this.sellerPan = sellerPan;
    }

    public String getSellerPhone() {
        return sellerPhone;
    }

    public void setSellerPhone(String sellerPhone) {
        this.sellerPhone = sellerPhone;
    }

    public String getSellerEmail() {
        return sellerEmail;
    }

    public void setSellerEmail(String sellerEmail) {
        this.sellerEmail = sellerEmail;
    }

    public String getSellerStateCode() {
        return sellerStateCode;
    }

    public void setSellerStateCode(String sellerStateCode) {
        this.sellerStateCode = sellerStateCode;
    }

    public String getBuyerName() {
        return buyerName;
    }

    public void setBuyerName(String buyerName) {
        this.buyerName = buyerName;
    }

    public String getBuyerAddress() {
        return buyerAddress;
    }

    public void setBuyerAddress(String buyerAddress) {
        this.buyerAddress = buyerAddress;
    }

    public String getBuyerGstin() {
        return buyerGstin;
    }

    public void setBuyerGstin(String buyerGstin) {
        this.buyerGstin = buyerGstin;
    }

    public String getBuyerPhone() {
        return buyerPhone;
    }

    public void setBuyerPhone(String buyerPhone) {
        this.buyerPhone = buyerPhone;
    }

    public String getBuyerEmail() {
        return buyerEmail;
    }

    public void setBuyerEmail(String buyerEmail) {
        this.buyerEmail = buyerEmail;
    }

    public String getBuyerStateCode() {
        return buyerStateCode;
    }

    public void setBuyerStateCode(String buyerStateCode) {
        this.buyerStateCode = buyerStateCode;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getPlaceOfSupply() {
        return placeOfSupply;
    }

    public void setPlaceOfSupply(String placeOfSupply) {
        this.placeOfSupply = placeOfSupply;
    }

    public String getPlaceOfSupplyCode() {
        return placeOfSupplyCode;
    }

    public void setPlaceOfSupplyCode(String placeOfSupplyCode) {
        this.placeOfSupplyCode = placeOfSupplyCode;
    }

    public List<InvoiceItemDTO> getItems() {
        return items;
    }

    public void setItems(List<InvoiceItemDTO> items) {
        this.items = items;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getCgstAmount() {
        return cgstAmount;
    }

    public void setCgstAmount(BigDecimal cgstAmount) {
        this.cgstAmount = cgstAmount;
    }

    public BigDecimal getSgstAmount() {
        return sgstAmount;
    }

    public void setSgstAmount(BigDecimal sgstAmount) {
        this.sgstAmount = sgstAmount;
    }

    public BigDecimal getIgstAmount() {
        return igstAmount;
    }

    public void setIgstAmount(BigDecimal igstAmount) {
        this.igstAmount = igstAmount;
    }

    public BigDecimal getCessAmount() {
        return cessAmount;
    }

    public void setCessAmount(BigDecimal cessAmount) {
        this.cessAmount = cessAmount;
    }

    public BigDecimal getTotalTax() {
        return totalTax;
    }

    public void setTotalTax(BigDecimal totalTax) {
        this.totalTax = totalTax;
    }

    public BigDecimal getShippingCost() {
        return shippingCost;
    }

    public void setShippingCost(BigDecimal shippingCost) {
        this.shippingCost = shippingCost;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getTotalAmountInWords() {
        return totalAmountInWords;
    }

    public void setTotalAmountInWords(String totalAmountInWords) {
        this.totalAmountInWords = totalAmountInWords;
    }

    public List<TaxSummaryDTO> getTaxSummary() {
        return taxSummary;
    }

    public void setTaxSummary(List<TaxSummaryDTO> taxSummary) {
        this.taxSummary = taxSummary;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getBankDetails() {
        return bankDetails;
    }

    public void setBankDetails(String bankDetails) {
        this.bankDetails = bankDetails;
    }

    public String getTermsAndConditions() {
        return termsAndConditions;
    }

    public void setTermsAndConditions(String termsAndConditions) {
        this.termsAndConditions = termsAndConditions;
    }

    public boolean isSameState() {
        return isSameState;
    }

    public void setSameState(boolean sameState) {
        isSameState = sameState;
    }

    public boolean isReverseCharge() {
        return isReverseCharge;
    }

    public void setReverseCharge(boolean reverseCharge) {
        isReverseCharge = reverseCharge;
    }
    
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

        // Getters and Setters
        public int getSerialNo() {
            return serialNo;
        }

        public void setSerialNo(int serialNo) {
            this.serialNo = serialNo;
        }

        public String getProductName() {
            return productName;
        }

        public void setProductName(String productName) {
            this.productName = productName;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getHsnCode() {
            return hsnCode;
        }

        public void setHsnCode(String hsnCode) {
            this.hsnCode = hsnCode;
        }

        public BigDecimal getQuantity() {
            return quantity;
        }

        public void setQuantity(BigDecimal quantity) {
            this.quantity = quantity;
        }

        public String getUnit() {
            return unit;
        }

        public void setUnit(String unit) {
            this.unit = unit;
        }

        public BigDecimal getUnitPrice() {
            return unitPrice;
        }

        public void setUnitPrice(BigDecimal unitPrice) {
            this.unitPrice = unitPrice;
        }

        public BigDecimal getDiscount() {
            return discount;
        }

        public void setDiscount(BigDecimal discount) {
            this.discount = discount;
        }

        public BigDecimal getTaxableValue() {
            return taxableValue;
        }

        public void setTaxableValue(BigDecimal taxableValue) {
            this.taxableValue = taxableValue;
        }

        public BigDecimal getCgstRate() {
            return cgstRate;
        }

        public void setCgstRate(BigDecimal cgstRate) {
            this.cgstRate = cgstRate;
        }

        public BigDecimal getCgstAmount() {
            return cgstAmount;
        }

        public void setCgstAmount(BigDecimal cgstAmount) {
            this.cgstAmount = cgstAmount;
        }

        public BigDecimal getSgstRate() {
            return sgstRate;
        }

        public void setSgstRate(BigDecimal sgstRate) {
            this.sgstRate = sgstRate;
        }

        public BigDecimal getSgstAmount() {
            return sgstAmount;
        }

        public void setSgstAmount(BigDecimal sgstAmount) {
            this.sgstAmount = sgstAmount;
        }

        public BigDecimal getIgstRate() {
            return igstRate;
        }

        public void setIgstRate(BigDecimal igstRate) {
            this.igstRate = igstRate;
        }

        public BigDecimal getIgstAmount() {
            return igstAmount;
        }

        public void setIgstAmount(BigDecimal igstAmount) {
            this.igstAmount = igstAmount;
        }

        public BigDecimal getTotalAmount() {
            return totalAmount;
        }

        public void setTotalAmount(BigDecimal totalAmount) {
            this.totalAmount = totalAmount;
        }
    }
    
    public static class TaxSummaryDTO {
        private String taxType;
        private BigDecimal rate;
        private BigDecimal taxableAmount;
        private BigDecimal taxAmount;

        // Getters and Setters
        public String getTaxType() {
            return taxType;
        }

        public void setTaxType(String taxType) {
            this.taxType = taxType;
        }

        public BigDecimal getRate() {
            return rate;
        }

        public void setRate(BigDecimal rate) {
            this.rate = rate;
        }

        public BigDecimal getTaxableAmount() {
            return taxableAmount;
        }

        public void setTaxableAmount(BigDecimal taxableAmount) {
            this.taxableAmount = taxableAmount;
        }

        public BigDecimal getTaxAmount() {
            return taxAmount;
        }

        public void setTaxAmount(BigDecimal taxAmount) {
            this.taxAmount = taxAmount;
        }
    }
}
