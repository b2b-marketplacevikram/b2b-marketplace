package com.b2b.marketplace.search.controller;

import com.b2b.marketplace.search.util.SolrHealthChecker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for Solr administration and diagnostics
 */
@RestController
@RequestMapping("/api/search/admin")
@Slf4j
@CrossOrigin(origins = "*")
public class SolrAdminController {

    private final SolrHealthChecker solrHealthChecker;

    public SolrAdminController(@Autowired(required = false) SolrHealthChecker solrHealthChecker) {
        this.solrHealthChecker = solrHealthChecker;
    }

    /**
     * Detailed health check for Solr
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        if (solrHealthChecker == null) {
            return ResponseEntity.status(503).body(Map.of(
                    "status", "DOWN",
                    "error", "Solr is not configured"
            ));
        }

        Map<String, Object> health = solrHealthChecker.checkHealth();
        int status = "UP".equals(health.get("status")) ? 200 : 503;
        return ResponseEntity.status(status).body(health);
    }

    /**
     * Get index statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        if (solrHealthChecker == null) {
            return ResponseEntity.status(503).body(Map.of(
                    "status", "error",
                    "error", "Solr is not configured"
            ));
        }

        Map<String, Object> stats = solrHealthChecker.getIndexStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Check if a product is indexed
     */
    @GetMapping("/product/{productId}/exists")
    public ResponseEntity<Map<String, Object>> checkProductExists(@PathVariable Long productId) {
        if (solrHealthChecker == null) {
            return ResponseEntity.status(503).body(Map.of(
                    "status", "error",
                    "error", "Solr is not configured"
            ));
        }

        boolean exists = solrHealthChecker.productExists(productId);
        return ResponseEntity.ok(Map.of(
                "productId", productId,
                "indexed", exists
        ));
    }
}
