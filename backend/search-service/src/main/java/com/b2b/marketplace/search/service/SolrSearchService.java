package com.b2b.marketplace.search.service;

import com.b2b.marketplace.search.document.ProductDocument;
import com.b2b.marketplace.search.dto.ProductSearchResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrInputDocument;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "spring.data.solr.enabled", havingValue = "true", matchIfMissing = true)
public class SolrSearchService {

    private final SolrClient solrClient;
    
    @org.springframework.beans.factory.annotation.Value("${spring.data.solr.collection:b2b_products}")
    private String collectionName;

    public com.b2b.marketplace.search.dto.SearchResponse search(
            com.b2b.marketplace.search.dto.SearchRequest searchRequest) {

        long startTime = System.currentTimeMillis();

        try {
            SolrQuery query = buildSolrQuery(searchRequest);
            query.setStart(searchRequest.getPage() * searchRequest.getSize());
            query.setRows(searchRequest.getSize());

            QueryResponse resp = solrClient.query(collectionName, query);
            List<ProductDocument> docs = resp.getResults().stream()
                    .map(d -> {
                        ProductDocument pd = new ProductDocument();
                        pd.setId(getStringValue(d, "id"));
                        pd.setProductId(getLongValue(d, "productId"));
                        pd.setName(getStringValue(d, "name"));
                        pd.setDescription(getStringValue(d, "description"));
                        pd.setSku(getStringValue(d, "sku"));
                        Object priceVal = getFieldValue(d, "price");
                        pd.setPrice(priceVal == null ? null : new java.math.BigDecimal(priceVal.toString()));
                        pd.setMoq(getIntValue(d, "moq"));
                        pd.setStockQuantity(getIntValue(d, "stockQuantity"));
                        pd.setCategoryId(getLongValue(d, "categoryId"));
                        pd.setCategoryName(getStringValue(d, "categoryName"));
                        pd.setSupplierId(getLongValue(d, "supplierId"));
                        pd.setSupplierName(getStringValue(d, "supplierName"));
                        pd.setOrigin(getStringValue(d, "origin"));
                        pd.setRating(getDoubleValue(d, "rating"));
                        pd.setReviewCount(getIntValue(d, "reviewCount"));
                        java.util.Collection<?> tagsCol = d.getFieldValues("tags");
                        pd.setTags(tagsCol != null ? tagsCol.stream().map(Object::toString).collect(Collectors.toList()) : null);
                        pd.setIsFeatured(getBooleanValue(d, "isFeatured"));
                        return pd;
                    })
                    .collect(Collectors.toList());

            long searchTime = System.currentTimeMillis() - startTime;
            long totalHits = resp.getResults().getNumFound();
            int totalPages = (int) Math.ceil((double) totalHits / searchRequest.getSize());

            com.b2b.marketplace.search.dto.SearchResponse response = new com.b2b.marketplace.search.dto.SearchResponse();
            response.setResults(docs.stream().map(this::mapToSearchResult).collect(Collectors.toList()));
            response.setTotalResults(totalHits);
            response.setPage(searchRequest.getPage());
            response.setSize(searchRequest.getSize());
            response.setTotalPages(totalPages);
            response.setSearchTime(searchTime);

            return response;

        } catch (Exception e) {
            log.error("Error performing search: {}", e.getMessage(), e);
            return createEmptyResponse(searchRequest);
        }
    }

    private SolrQuery buildSolrQuery(com.b2b.marketplace.search.dto.SearchRequest searchRequest) {
        StringBuilder sb = new StringBuilder();
        if (searchRequest.getQuery() != null && !searchRequest.getQuery().isEmpty()) {
            String q = searchRequest.getQuery();
            sb.append("name:(").append(q).append(")");
            sb.append(" OR description:(").append(q).append(")");
            sb.append(" OR tags:(").append(q).append(")");
            sb.append(" OR categoryName:(").append(q).append(")");
            sb.append(" OR supplierName:(").append(q).append(")");
        } else {
            sb.append("*:*");
        }

        List<String> filters = new ArrayList<>();
        filters.add("isActive:true");

        if (searchRequest.getCategoryId() != null) filters.add("categoryId:" + searchRequest.getCategoryId());
        if (searchRequest.getSupplierId() != null) filters.add("supplierId:" + searchRequest.getSupplierId());
        if (searchRequest.getMinPrice() != null) filters.add("price:[" + searchRequest.getMinPrice() + " TO *]");
        if (searchRequest.getMaxPrice() != null) filters.add("price:[* TO " + searchRequest.getMaxPrice() + "]");
        if (searchRequest.getMinMoq() != null) filters.add("moq:[" + searchRequest.getMinMoq() + " TO *]");
        if (searchRequest.getMaxMoq() != null) filters.add("moq:[* TO " + searchRequest.getMaxMoq() + "]");
        if (searchRequest.getOrigin() != null) filters.add("origin:" + searchRequest.getOrigin());
        if (searchRequest.getIsFeatured() != null && searchRequest.getIsFeatured()) filters.add("isFeatured:true");
        if (searchRequest.getTags() != null && !searchRequest.getTags().isEmpty()) {
            String tagsQ = String.join(" OR ", searchRequest.getTags().stream().map(t -> "tags:" + t).collect(Collectors.toList()));
            filters.add("(" + tagsQ + ")");
        }

        SolrQuery query = new SolrQuery();
        query.setQuery(sb.toString());
        for (String f : filters) query.addFilterQuery(f);
        query.setFields("id,productId,name,description,sku,price,moq,stockQuantity,categoryId,categoryName,supplierId,supplierName,origin,rating,reviewCount,tags,isFeatured");
        return query;
    }

    private ProductSearchResult mapToSearchResult(ProductDocument doc) {
        ProductSearchResult result = new ProductSearchResult();
        result.setId(doc.getProductId());
        result.setName(doc.getName());
        result.setDescription(doc.getDescription());
        result.setSku(doc.getSku());
        result.setPrice(doc.getPrice());
        result.setMoq(doc.getMoq());
        result.setStockQuantity(doc.getStockQuantity());
        result.setCategoryId(doc.getCategoryId());
        result.setCategoryName(doc.getCategoryName());
        result.setSupplierId(doc.getSupplierId());
        result.setSupplierName(doc.getSupplierName());
        result.setOrigin(doc.getOrigin());
        result.setRating(doc.getRating());
        result.setReviewCount(doc.getReviewCount());
        result.setTags(doc.getTags());
        result.setIsFeatured(doc.getIsFeatured());
        return result;
    }

    private com.b2b.marketplace.search.dto.SearchResponse createEmptyResponse(
            com.b2b.marketplace.search.dto.SearchRequest searchRequest) {
        com.b2b.marketplace.search.dto.SearchResponse response = new com.b2b.marketplace.search.dto.SearchResponse();
        response.setResults(new ArrayList<>());
        response.setTotalResults(0L);
        response.setPage(searchRequest.getPage());
        response.setSize(searchRequest.getSize());
        response.setTotalPages(0);
        response.setSearchTime(0L);
        return response;
    }

    public void indexProduct(ProductDocument product) {
        try {
            SolrInputDocument doc = new SolrInputDocument();
            doc.addField("id", product.getId());
            doc.addField("productId", product.getProductId());
            doc.addField("name", product.getName());
            doc.addField("description", product.getDescription());
            doc.addField("sku", product.getSku());
            // Convert BigDecimal to double for Solr
            doc.addField("price", product.getPrice() != null ? product.getPrice().doubleValue() : null);
            doc.addField("moq", product.getMoq());
            doc.addField("stockQuantity", product.getStockQuantity());
            doc.addField("categoryId", product.getCategoryId());
            doc.addField("categoryName", product.getCategoryName());
            doc.addField("supplierId", product.getSupplierId());
            doc.addField("supplierName", product.getSupplierName());
            doc.addField("origin", product.getOrigin());
            doc.addField("rating", product.getRating());
            doc.addField("reviewCount", product.getReviewCount());
            doc.addField("tags", product.getTags());
            doc.addField("isFeatured", product.getIsFeatured());
            doc.addField("isActive", product.getIsActive());
            doc.addField("imageUrl", product.getImageUrl());

            solrClient.add(collectionName, doc);
            solrClient.commit(collectionName);
            log.info("Indexed product: {}", product.getProductId());
        } catch (Exception e) {
            log.error("Error indexing product {}: {}", product.getProductId(), e.getMessage());
        }
    }

    public void deleteProduct(String id) {
        try {
            solrClient.deleteById(collectionName, id);
            solrClient.commit(collectionName);
            log.info("Deleted product from index: {}", id);
        } catch (Exception e) {
            log.error("Error deleting product {}: {}", id, e.getMessage());
        }
    }

    // Helper methods to safely extract values from Solr documents
    private Object getFieldValue(org.apache.solr.common.SolrDocument doc, String field) {
        Object value = doc.getFieldValue(field);
        if (value instanceof java.util.List) {
            java.util.List<?> list = (java.util.List<?>) value;
            return list.isEmpty() ? null : list.get(0);
        }
        return value;
    }

    private String getStringValue(org.apache.solr.common.SolrDocument doc, String field) {
        Object value = getFieldValue(doc, field);
        return value != null ? value.toString() : null;
    }

    private Long getLongValue(org.apache.solr.common.SolrDocument doc, String field) {
        Object value = getFieldValue(doc, field);
        if (value == null) return null;
        if (value instanceof Number) return ((Number) value).longValue();
        return Long.parseLong(value.toString());
    }

    private Integer getIntValue(org.apache.solr.common.SolrDocument doc, String field) {
        Object value = getFieldValue(doc, field);
        if (value == null) return null;
        if (value instanceof Number) return ((Number) value).intValue();
        return Integer.parseInt(value.toString());
    }

    private Double getDoubleValue(org.apache.solr.common.SolrDocument doc, String field) {
        Object value = getFieldValue(doc, field);
        if (value == null) return null;
        if (value instanceof Number) return ((Number) value).doubleValue();
        return Double.parseDouble(value.toString());
    }

    private Boolean getBooleanValue(org.apache.solr.common.SolrDocument doc, String field) {
        Object value = getFieldValue(doc, field);
        if (value == null) return null;
        if (value instanceof Boolean) return (Boolean) value;
        return Boolean.parseBoolean(value.toString());
    }
}
