package com.b2b.marketplace.email.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailResponse {
    
    private boolean success;
    
    private String message;
    
    private Long emailLogId;
    
    private String status;
    
    public static EmailResponse success(Long emailLogId) {
        return new EmailResponse(true, "Email sent successfully", emailLogId, "SENT");
    }
    
    public static EmailResponse failed(String message) {
        return new EmailResponse(false, message, null, "FAILED");
    }
    
    public static EmailResponse pending(Long emailLogId) {
        return new EmailResponse(true, "Email queued for sending", emailLogId, "PENDING");
    }
}
