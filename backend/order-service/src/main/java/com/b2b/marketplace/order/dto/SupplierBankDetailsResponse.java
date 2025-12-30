package com.b2b.marketplace.order.dto;

import lombok.Data;

@Data
public class SupplierBankDetailsResponse {
    private Long id;
    private String bankName;
    private String accountHolderName;
    private String accountNumber;
    private String ifscCode;
    private String swiftCode;
    private String upiId;
    private String branchName;
    private Boolean isPrimary;
    private Boolean isVerified;
}
