package com.b2b.marketplace.user.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class RegisterRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotNull(message = "User type is required")
    private String userType; // BUYER or SUPPLIER

    private String phone;

    // Buyer specific fields
    private String companyName;
    private String country;
    private String city;

    // Supplier specific fields
    private String businessType;
    private String address;
    private String website;
    private String description;
}
