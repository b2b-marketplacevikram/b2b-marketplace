package com.b2b.marketplace.email.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailRequest {
    
    @NotBlank(message = "Recipient email is required")
    @Email(message = "Invalid email format")
    private String to;
    
    @NotBlank(message = "Subject is required")
    private String subject;
    
    @NotBlank(message = "Email type is required")
    private String emailType; // REGISTRATION, ORDER_CONFIRMATION, ORDER_STATUS, PASSWORD_RESET, etc.
    
    private Map<String, Object> templateData;
    
    private Long orderId;
    
    private Long userId;
    
    private String recipientName;
}
