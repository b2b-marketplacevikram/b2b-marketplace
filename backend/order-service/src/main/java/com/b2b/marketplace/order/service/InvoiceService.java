package com.b2b.marketplace.order.service;

import com.b2b.marketplace.order.dto.InvoiceDTO;
import com.b2b.marketplace.order.entity.Order;
import com.b2b.marketplace.order.entity.OrderItem;
import com.b2b.marketplace.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceService {
    
    private final OrderRepository orderRepository;
    
    // Simple invoice number counter (in production, use database sequence)
    private static final AtomicLong invoiceCounter = new AtomicLong(1000);
    
    // State codes for GST
    private static final Map<String, String> STATE_CODES = new HashMap<>();
    static {
        STATE_CODES.put("ANDHRA PRADESH", "37");
        STATE_CODES.put("ARUNACHAL PRADESH", "12");
        STATE_CODES.put("ASSAM", "18");
        STATE_CODES.put("BIHAR", "10");
        STATE_CODES.put("CHHATTISGARH", "22");
        STATE_CODES.put("GOA", "30");
        STATE_CODES.put("GUJARAT", "24");
        STATE_CODES.put("HARYANA", "06");
        STATE_CODES.put("HIMACHAL PRADESH", "02");
        STATE_CODES.put("JHARKHAND", "20");
        STATE_CODES.put("KARNATAKA", "29");
        STATE_CODES.put("KERALA", "32");
        STATE_CODES.put("MADHYA PRADESH", "23");
        STATE_CODES.put("MAHARASHTRA", "27");
        STATE_CODES.put("MANIPUR", "14");
        STATE_CODES.put("MEGHALAYA", "17");
        STATE_CODES.put("MIZORAM", "15");
        STATE_CODES.put("NAGALAND", "13");
        STATE_CODES.put("ODISHA", "21");
        STATE_CODES.put("PUNJAB", "03");
        STATE_CODES.put("RAJASTHAN", "08");
        STATE_CODES.put("SIKKIM", "11");
        STATE_CODES.put("TAMIL NADU", "33");
        STATE_CODES.put("TELANGANA", "36");
        STATE_CODES.put("TRIPURA", "16");
        STATE_CODES.put("UTTAR PRADESH", "09");
        STATE_CODES.put("UTTARAKHAND", "05");
        STATE_CODES.put("WEST BENGAL", "19");
        STATE_CODES.put("DELHI", "07");
    }
    
    public InvoiceDTO generateInvoice(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));
        
        // Generate invoice number if not exists
        if (order.getInvoiceNumber() == null) {
            order.setInvoiceNumber(generateInvoiceNumber());
            order.setInvoiceDate(LocalDateTime.now());
            orderRepository.save(order);
        }
        
        InvoiceDTO invoice = new InvoiceDTO();
        
        // Invoice Header
        invoice.setInvoiceNumber(order.getInvoiceNumber());
        invoice.setInvoiceDate(order.getInvoiceDate());
        invoice.setOrderNumber(order.getOrderNumber());
        invoice.setOrderDate(order.getCreatedAt());
        
        // Seller Details (would come from supplier service in production)
        invoice.setSellerName("B2B MarketPlace Supplier");
        invoice.setSellerAddress("123 Business Park, Bangalore, Karnataka 560001");
        invoice.setSellerGstin(order.getSupplierGstin() != null ? order.getSupplierGstin() : "29AABCT1234A1ZV");
        invoice.setSellerPan("AABCT1234A");
        invoice.setSellerPhone("+91-80-1234-5678");
        invoice.setSellerEmail("supplier@b2bmarketplace.com");
        invoice.setSellerStateCode("29");
        
        // Buyer Details
        invoice.setBuyerName("Buyer Company");
        invoice.setBuyerAddress(order.getBillingAddress() != null ? order.getBillingAddress() : order.getShippingAddress());
        invoice.setBuyerGstin(order.getBuyerGstin());
        invoice.setBuyerPhone("+91-9876543210");
        invoice.setBuyerEmail("buyer@example.com");
        invoice.setBuyerStateCode(getStateCodeFromAddress(order.getShippingAddress()));
        
        // Shipping
        invoice.setShippingAddress(order.getShippingAddress());
        invoice.setPlaceOfSupply(order.getPlaceOfSupply() != null ? order.getPlaceOfSupply() : "Karnataka");
        invoice.setPlaceOfSupplyCode(getStateCodeFromAddress(order.getShippingAddress()));
        
        // Determine if same state (for CGST+SGST vs IGST)
        boolean isSameState = order.getIsSameState() != null ? order.getIsSameState() : 
                invoice.getSellerStateCode().equals(invoice.getBuyerStateCode());
        invoice.setSameState(isSameState);
        
        // Process Items
        List<InvoiceDTO.InvoiceItemDTO> invoiceItems = new ArrayList<>();
        BigDecimal totalCgst = BigDecimal.ZERO;
        BigDecimal totalSgst = BigDecimal.ZERO;
        BigDecimal totalIgst = BigDecimal.ZERO;
        BigDecimal subtotal = BigDecimal.ZERO;
        
        Map<String, InvoiceDTO.TaxSummaryDTO> taxSummaryMap = new HashMap<>();
        
        int serialNo = 1;
        for (OrderItem item : order.getItems()) {
            InvoiceDTO.InvoiceItemDTO invoiceItem = new InvoiceDTO.InvoiceItemDTO();
            invoiceItem.setSerialNo(serialNo++);
            invoiceItem.setProductName(item.getProductName());
            invoiceItem.setDescription(item.getProductName());
            invoiceItem.setHsnCode(item.getHsnCode() != null ? item.getHsnCode() : "84713010"); // Default HSN
            invoiceItem.setQuantity(BigDecimal.valueOf(item.getQuantity()));
            invoiceItem.setUnit("PCS");
            invoiceItem.setUnitPrice(item.getUnitPrice());
            invoiceItem.setDiscount(BigDecimal.ZERO);
            
            BigDecimal taxableValue = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            invoiceItem.setTaxableValue(taxableValue);
            subtotal = subtotal.add(taxableValue);
            
            // Calculate GST (assuming 18% default, can be item-specific)
            BigDecimal gstRate = item.getGstRate() != null ? item.getGstRate() : new BigDecimal("18");
            BigDecimal taxAmount = taxableValue.multiply(gstRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            
            if (isSameState) {
                // Intra-state: CGST + SGST (equal split)
                BigDecimal halfRate = gstRate.divide(new BigDecimal("2"), 2, RoundingMode.HALF_UP);
                BigDecimal halfTax = taxAmount.divide(new BigDecimal("2"), 2, RoundingMode.HALF_UP);
                
                invoiceItem.setCgstRate(halfRate);
                invoiceItem.setCgstAmount(halfTax);
                invoiceItem.setSgstRate(halfRate);
                invoiceItem.setSgstAmount(halfTax);
                invoiceItem.setIgstRate(BigDecimal.ZERO);
                invoiceItem.setIgstAmount(BigDecimal.ZERO);
                
                totalCgst = totalCgst.add(halfTax);
                totalSgst = totalSgst.add(halfTax);
                
                // Tax summary
                updateTaxSummary(taxSummaryMap, "CGST", halfRate, taxableValue, halfTax);
                updateTaxSummary(taxSummaryMap, "SGST", halfRate, taxableValue, halfTax);
            } else {
                // Inter-state: IGST only
                invoiceItem.setCgstRate(BigDecimal.ZERO);
                invoiceItem.setCgstAmount(BigDecimal.ZERO);
                invoiceItem.setSgstRate(BigDecimal.ZERO);
                invoiceItem.setSgstAmount(BigDecimal.ZERO);
                invoiceItem.setIgstRate(gstRate);
                invoiceItem.setIgstAmount(taxAmount);
                
                totalIgst = totalIgst.add(taxAmount);
                
                updateTaxSummary(taxSummaryMap, "IGST", gstRate, taxableValue, taxAmount);
            }
            
            invoiceItem.setTotalAmount(taxableValue.add(taxAmount));
            invoiceItems.add(invoiceItem);
        }
        
        invoice.setItems(invoiceItems);
        
        // Totals
        invoice.setSubtotal(subtotal);
        invoice.setCgstAmount(totalCgst);
        invoice.setSgstAmount(totalSgst);
        invoice.setIgstAmount(totalIgst);
        invoice.setCessAmount(BigDecimal.ZERO);
        invoice.setTotalTax(totalCgst.add(totalSgst).add(totalIgst));
        invoice.setShippingCost(order.getShippingCost() != null ? order.getShippingCost() : BigDecimal.ZERO);
        invoice.setTotalAmount(order.getTotalAmount());
        invoice.setTotalAmountInWords(convertToWords(order.getTotalAmount()));
        
        // Tax Summary
        invoice.setTaxSummary(new ArrayList<>(taxSummaryMap.values()));
        
        // Payment
        invoice.setPaymentMethod(order.getPaymentMethod());
        invoice.setPaymentStatus(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : "PENDING");
        invoice.setBankDetails("Bank: State Bank of India\nA/C: 1234567890\nIFSC: SBIN0001234\nBranch: MG Road, Bangalore");
        
        // Terms
        invoice.setTermsAndConditions(
            "1. Goods once sold will not be taken back.\n" +
            "2. Interest @18% p.a. will be charged on delayed payments.\n" +
            "3. Subject to Bangalore jurisdiction.\n" +
            "4. E. & O.E."
        );
        
        // Update order with tax breakdown
        order.setCgstAmount(totalCgst);
        order.setSgstAmount(totalSgst);
        order.setIgstAmount(totalIgst);
        order.setIsSameState(isSameState);
        orderRepository.save(order);
        
        return invoice;
    }
    
    private void updateTaxSummary(Map<String, InvoiceDTO.TaxSummaryDTO> map, String taxType, 
            BigDecimal rate, BigDecimal taxableAmount, BigDecimal taxAmount) {
        String key = taxType + "_" + rate.stripTrailingZeros().toPlainString();
        InvoiceDTO.TaxSummaryDTO summary = map.getOrDefault(key, new InvoiceDTO.TaxSummaryDTO());
        summary.setTaxType(taxType);
        summary.setRate(rate);
        summary.setTaxableAmount(summary.getTaxableAmount() != null ? 
                summary.getTaxableAmount().add(taxableAmount) : taxableAmount);
        summary.setTaxAmount(summary.getTaxAmount() != null ? 
                summary.getTaxAmount().add(taxAmount) : taxAmount);
        map.put(key, summary);
    }
    
    private String generateInvoiceNumber() {
        String prefix = "INV";
        String year = String.valueOf(LocalDateTime.now().getYear());
        String month = String.format("%02d", LocalDateTime.now().getMonthValue());
        long number = invoiceCounter.incrementAndGet();
        return prefix + "/" + year + "-" + month + "/" + String.format("%06d", number);
    }
    
    private String getStateCodeFromAddress(String address) {
        if (address == null) return "29"; // Default Karnataka
        String upperAddress = address.toUpperCase();
        for (Map.Entry<String, String> entry : STATE_CODES.entrySet()) {
            if (upperAddress.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return "29"; // Default
    }
    
    private String convertToWords(BigDecimal amount) {
        if (amount == null) return "Zero Rupees";
        
        String[] ones = {"", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
                "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"};
        String[] tens = {"", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"};
        
        long rupees = amount.longValue();
        int paise = amount.remainder(BigDecimal.ONE).multiply(new BigDecimal("100")).intValue();
        
        if (rupees == 0) {
            return "Zero Rupees" + (paise > 0 ? " and " + paise + " Paise" : " Only");
        }
        
        StringBuilder result = new StringBuilder();
        
        // Crores
        if (rupees >= 10000000) {
            long crores = rupees / 10000000;
            result.append(convertLessThanHundred(crores, ones, tens)).append(" Crore ");
            rupees %= 10000000;
        }
        
        // Lakhs
        if (rupees >= 100000) {
            long lakhs = rupees / 100000;
            result.append(convertLessThanHundred(lakhs, ones, tens)).append(" Lakh ");
            rupees %= 100000;
        }
        
        // Thousands
        if (rupees >= 1000) {
            long thousands = rupees / 1000;
            result.append(convertLessThanHundred(thousands, ones, tens)).append(" Thousand ");
            rupees %= 1000;
        }
        
        // Hundreds
        if (rupees >= 100) {
            long hundreds = rupees / 100;
            result.append(ones[(int) hundreds]).append(" Hundred ");
            rupees %= 100;
        }
        
        // Tens and Ones
        if (rupees > 0) {
            result.append(convertLessThanHundred(rupees, ones, tens));
        }
        
        result.append(" Rupees");
        if (paise > 0) {
            result.append(" and ").append(convertLessThanHundred(paise, ones, tens)).append(" Paise");
        }
        result.append(" Only");
        
        return result.toString().replaceAll("\\s+", " ").trim();
    }
    
    private String convertLessThanHundred(long num, String[] ones, String[] tens) {
        if (num < 20) {
            return ones[(int) num];
        }
        return tens[(int) (num / 10)] + (num % 10 != 0 ? " " + ones[(int) (num % 10)] : "");
    }
}
