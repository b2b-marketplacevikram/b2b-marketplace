package com.b2b.marketplace.search.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FacetResult {
    private String field;
    private List<FacetValue> values;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FacetValue {
        private String value;
        private long count;
    }
}
