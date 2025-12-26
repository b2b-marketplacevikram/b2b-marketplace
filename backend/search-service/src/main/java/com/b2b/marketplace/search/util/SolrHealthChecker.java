package com.b2b.marketplace.search.util;

import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

/**
 * Utility class for Solr health checks and diagnostics
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SolrHealthChecker {

    private final SolrClient solrClient;
    private static final String COLLECTION = "products";

    /**
     * Check if Solr is available and the products collection exists
     */
    public Map<String, Object> checkHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("timestamp", System.currentTimeMillis());

        try {
            // Ping Solr
            long startTime = System.currentTimeMillis();
            SolrQuery query = new SolrQuery("*:*");
            query.setRows(0);
            QueryResponse response = solrClient.query(COLLECTION, query);
            long responseTime = System.currentTimeMillis() - startTime;

            health.put("status", "UP");
            health.put("solrAvailable", true);
            health.put("responseTimeMs", responseTime);
            health.put("numDocs", response.getResults().getNumFound());
            health.put("collection", COLLECTION);

            log.debug("Solr health check passed. {} docs in index, {}ms response time",
                    response.getResults().getNumFound(), responseTime);

        } catch (Exception e) {
            health.put("status", "DOWN");
            health.put("solrAvailable", false);
            health.put("error", e.getMessage());
            log.error("Solr health check failed: {}", e.getMessage());
        }

        return health;
    }

    /**
     * Get index statistics
     */
    public Map<String, Object> getIndexStats() {
        Map<String, Object> stats = new HashMap<>();

        try {
            // Get total document count
            SolrQuery countQuery = new SolrQuery("*:*");
            countQuery.setRows(0);
            QueryResponse response = solrClient.query(COLLECTION, countQuery);
            stats.put("totalDocuments", response.getResults().getNumFound());

            // Get active products count
            countQuery.addFilterQuery("isActive:true");
            response = solrClient.query(COLLECTION, countQuery);
            stats.put("activeProducts", response.getResults().getNumFound());

            // Get featured products count
            countQuery = new SolrQuery("*:*");
            countQuery.setRows(0);
            countQuery.addFilterQuery("isFeatured:true");
            countQuery.addFilterQuery("isActive:true");
            response = solrClient.query(COLLECTION, countQuery);
            stats.put("featuredProducts", response.getResults().getNumFound());

            // Get category count using faceting
            SolrQuery facetQuery = new SolrQuery("*:*");
            facetQuery.setRows(0);
            facetQuery.setFacet(true);
            facetQuery.addFacetField("categoryName");
            facetQuery.setFacetMinCount(1);
            response = solrClient.query(COLLECTION, facetQuery);
            if (response.getFacetField("categoryName") != null) {
                stats.put("categoryCount", response.getFacetField("categoryName").getValueCount());
            }

            // Get supplier count
            facetQuery = new SolrQuery("*:*");
            facetQuery.setRows(0);
            facetQuery.setFacet(true);
            facetQuery.addFacetField("supplierName");
            facetQuery.setFacetMinCount(1);
            response = solrClient.query(COLLECTION, facetQuery);
            if (response.getFacetField("supplierName") != null) {
                stats.put("supplierCount", response.getFacetField("supplierName").getValueCount());
            }

            stats.put("status", "success");

        } catch (Exception e) {
            stats.put("status", "error");
            stats.put("error", e.getMessage());
            log.error("Error getting index stats: {}", e.getMessage());
        }

        return stats;
    }

    /**
     * Check if a product exists in the index
     */
    public boolean productExists(Long productId) {
        try {
            SolrQuery query = new SolrQuery("productId:" + productId);
            query.setRows(0);
            QueryResponse response = solrClient.query(COLLECTION, query);
            return response.getResults().getNumFound() > 0;
        } catch (Exception e) {
            log.error("Error checking product existence: {}", e.getMessage());
            return false;
        }
    }
}
