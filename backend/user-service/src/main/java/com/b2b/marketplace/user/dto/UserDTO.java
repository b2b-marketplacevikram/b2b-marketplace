package com.b2b.marketplace.user.dto;

import com.b2b.marketplace.user.entity.User;
import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String userType;
    private Boolean isActive;
    private Boolean isVerified;
    private String companyName;  // Company name from buyer/supplier profile
    
    public static UserDTO fromEntity(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setUserType(user.getUserType().toString());
        dto.setIsActive(user.getIsActive());
        dto.setIsVerified(user.getIsVerified());
        return dto;
    }
}
