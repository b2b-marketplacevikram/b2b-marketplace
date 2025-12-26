package com.b2b.marketplace.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String fullName;
    private String userType;

    public LoginResponse(String token, Long id, String email, String fullName, String userType) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.userType = userType;
    }
}
