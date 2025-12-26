package com.b2b.marketplace.order.dto;

import lombok.Data;

@Data
public class UpdateOrderStatusRequest {
    private String status;
    private String trackingNumber;
}
