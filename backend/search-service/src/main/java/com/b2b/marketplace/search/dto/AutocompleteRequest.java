package com.b2b.marketplace.search.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AutocompleteRequest {
    private String query;
    private Integer limit = 10;
    private String field = "name"; // name, categoryName, supplierName, tags
}
