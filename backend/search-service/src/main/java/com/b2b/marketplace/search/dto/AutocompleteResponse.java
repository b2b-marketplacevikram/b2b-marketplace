package com.b2b.marketplace.search.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AutocompleteResponse {
    private String query;
    private List<Suggestion> suggestions;
    private Long searchTime;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Suggestion {
        private String text;
        private Long productId;
        private String category;
        private Double score;
    }
}
