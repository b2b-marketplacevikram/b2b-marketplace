package com.b2b.marketplace.search.repository;

import com.b2b.marketplace.search.document.ProductDocument;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocument;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Repository for Solr product search operations.
 * Uses raw SolrJ client since Spring Data Solr is deprecated.
 */
@Repository
@RequiredArgsConstructor
@Slf4j
public class ProductSearchRepository {

    private final SolrClient solrClient;
    private static final String COLLECTION = "products";

    public List<ProductDocument> findByNameContaining(String name) {
        try {
            SolrQuery query = new SolrQuery("name:*" + name + "*");
            query.addFilterQuery("isActive:true");
            query.setRows(100);
            QueryResponse response = solrClient.query(COLLECTION, query);
            return mapResults(response);
        } catch (Exception e) {
            log.error("Error finding by name: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<ProductDocument> findByCategoryId(Long categoryId) {
        try {
            SolrQuery query = new SolrQuery("categoryId:" + categoryId);
            query.addFilterQuery("isActive:true");
            query.setRows(100);
            QueryResponse response = solrClient.query(COLLECTION, query);
            return mapResults(response);
        } catch (Exception e) {
            log.error("Error finding by category: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<ProductDocument> findBySupplierId(Long supplierId) {
        try {
            SolrQuery query = new SolrQuery("supplierId:" + supplierId);
            query.addFilterQuery("isActive:true");
            query.setRows(100);
            QueryResponse response = solrClient.query(COLLECTION, query);
            return mapResults(response);
        } catch (Exception e) {
            log.error("Error finding by supplier: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<ProductDocument> findByIsFeaturedTrue() {
        try {
            SolrQuery query = new SolrQuery("isFeatured:true");
            query.addFilterQuery("isActive:true");
            query.setRows(100);
            QueryResponse response = solrClient.query(COLLECTION, query);
            return mapResults(response);
        } catch (Exception e) {
            log.error("Error finding featured: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<ProductDocument> findByPriceBetween(Double minPrice, Double maxPrice) {
        try {
            SolrQuery query = new SolrQuery("price:[" + minPrice + " TO " + maxPrice + "]");
            query.addFilterQuery("isActive:true");
            query.setRows(100);
            QueryResponse response = solrClient.query(COLLECTION, query);
            return mapResults(response);
        } catch (Exception e) {
            log.error("Error finding by price range: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public Optional<ProductDocument> findById(String id) {
        try {
            SolrQuery query = new SolrQuery("id:" + id);
            query.setRows(1);
            QueryResponse response = solrClient.query(COLLECTION, query);
            List<ProductDocument> results = mapResults(response);
            return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
        } catch (Exception e) {
            log.error("Error finding by id: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public List<ProductDocument> findAll() {
        try {
            SolrQuery query = new SolrQuery("*:*");
            query.addFilterQuery("isActive:true");
            query.setRows(1000);
            QueryResponse response = solrClient.query(COLLECTION, query);
            return mapResults(response);
        } catch (Exception e) {
            log.error("Error finding all: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public long count() {
        try {
            SolrQuery query = new SolrQuery("*:*");
            query.setRows(0);
            QueryResponse response = solrClient.query(COLLECTION, query);
            return response.getResults().getNumFound();
        } catch (Exception e) {
            log.error("Error counting: {}", e.getMessage());
            return 0;
        }
    }

    private List<ProductDocument> mapResults(QueryResponse response) {
        return response.getResults().stream()
                .map(this::mapToDocument)
                .collect(Collectors.toList());
    }

    @SuppressWarnings("unchecked")
    private ProductDocument mapToDocument(SolrDocument doc) {
        ProductDocument pd = new ProductDocument();
        pd.setId((String) doc.getFieldValue("id"));
        pd.setProductId(getAsLong(doc, "productId"));
        pd.setName((String) doc.getFieldValue("name"));
        pd.setDescription((String) doc.getFieldValue("description"));
        pd.setSku((String) doc.getFieldValue("sku"));
        pd.setPrice(getAsBigDecimal(doc, "price"));
        pd.setMoq(getAsInteger(doc, "moq"));
        pd.setStockQuantity(getAsInteger(doc, "stockQuantity"));
        pd.setCategoryId(getAsLong(doc, "categoryId"));
        pd.setCategoryName((String) doc.getFieldValue("categoryName"));
        pd.setSupplierId(getAsLong(doc, "supplierId"));
        pd.setSupplierName((String) doc.getFieldValue("supplierName"));
        pd.setOrigin((String) doc.getFieldValue("origin"));
        pd.setRating(getAsDouble(doc, "rating"));
        pd.setReviewCount(getAsInteger(doc, "reviewCount"));
        pd.setTags((List<String>) doc.getFieldValue("tags"));
        pd.setIsFeatured(getAsBoolean(doc, "isFeatured"));
        pd.setIsActive(getAsBoolean(doc, "isActive"));
        return pd;
    }

    private Long getAsLong(SolrDocument doc, String field) {
        Object value = doc.getFieldValue(field);
        return value != null ? ((Number) value).longValue() : null;
    }

    private Integer getAsInteger(SolrDocument doc, String field) {
        Object value = doc.getFieldValue(field);
        return value != null ? ((Number) value).intValue() : null;
    }

    private Double getAsDouble(SolrDocument doc, String field) {
        Object value = doc.getFieldValue(field);
        return value != null ? ((Number) value).doubleValue() : null;
    }

    private BigDecimal getAsBigDecimal(SolrDocument doc, String field) {
        Object value = doc.getFieldValue(field);
        return value != null ? new BigDecimal(value.toString()) : null;
    }

    private Boolean getAsBoolean(SolrDocument doc, String field) {
        Object value = doc.getFieldValue(field);
        return value != null ? Boolean.valueOf(value.toString()) : null;
    }
}
