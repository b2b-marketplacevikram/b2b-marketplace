package com.b2b.marketplace.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAdminDTO {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String userType;
    private Boolean isActive;
    private Boolean isVerified;
    private String createdAt;
    private String lastLogin;
}
