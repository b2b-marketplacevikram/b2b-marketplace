package com.b2b.marketplace.cart.dto;

import lombok.Data;

@Data
public class BuyerDTO {
    private Long id;
    private Long userId;
    private String companyName;
    private String country;
    private String city;
}
