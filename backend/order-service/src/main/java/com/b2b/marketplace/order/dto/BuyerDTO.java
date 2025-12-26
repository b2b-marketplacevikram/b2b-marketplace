package com.b2b.marketplace.order.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BuyerDTO {
    private Long id;
    private Long userId;
    private String companyName;
    private String country;
    private String city;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
