package com.b2b.marketplace.order.controller;

import com.b2b.marketplace.order.dto.InvoiceDTO;
import com.b2b.marketplace.order.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    /**
     * Generate GST Invoice for an order
     * GET /api/orders/{orderNumber}/invoice
     */
    @GetMapping("/{orderNumber}/invoice")
    public ResponseEntity<InvoiceDTO> getInvoice(@PathVariable String orderNumber) {
        InvoiceDTO invoice = invoiceService.generateInvoice(orderNumber);
        return ResponseEntity.ok(invoice);
    }
}
