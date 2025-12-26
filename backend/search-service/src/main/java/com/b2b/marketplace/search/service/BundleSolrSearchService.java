package com.b2b.marketplace.search.service;

import com.b2b.marketplace.search.document.BundleDocument;
import com.b2b.marketplace.search.dto.BundleSearchRequest;
import com.b2b.marketplace.search.dto.BundleSearchResponse;
import com.b2b.marketplace.search.dto.BundleSearchResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrInputDocument;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "spring.data.solr.enabled", havingValue = "true", matchIfMissing = true)
public class BundleSolrSearchService {

    private final SolrClient solrClient;
    private static final String COLLECTION = "products"; // Using same collection with docType filter

    /**
     * Search for bundles in Solr
     */
    public BundleSearchResponse search(BundleSearchRequest searchRequest) {
        long startTime = System.currentTimeMillis();

        try {
            SolrQuery query = buildSolrQuery(searchRequest);
            query.setStart(searchRequest.getPage() * searchRequest.getSize());
            query.setRows(searchRequest.getSize());

            QueryResponse response = solrClient.query(COLLECTION, query);
            List<BundleDocument> docs = response.getResults().stream()
                    .map(this::mapToBundleDocument)
                    .collect(Collectors.toList());

            long searchTime = System.currentTimeMillis() - startTime;
            long totalHits = response.getResults().getNumFound();
            int totalPages = (int) Math.ceil((double) totalHits / searchRequest.getSize());

            BundleSearchResponse result = new BundleSearchResponse();
            result.setResults(docs.stream().map(this::mapToSearchResult).collect(Collectors.toList()));
            result.setTotalResults(totalHits);
            result.setPage(searchRequest.getPage());
            result.setSize(searchRequest.getSize());
            result.setTotalPages(totalPages);
            result.setSearchTime(searchTime);

            return result;

        } catch (Exception e) {
            log.error("Error searching bundles: {}", e.getMessage(), e);
            return createEmptyResponse(searchRequest);
        }
    }

    private SolrQuery buildSolrQuery(BundleSearchRequest searchRequest) {
        StringBuilder sb = new StringBuilder();
        
        if (searchRequest.getQuery() != null && !searchRequest.getQuery().isEmpty()) {
            String q = searchRequest.getQuery();
            sb.append("name:(").append(q).append(")");
            sb.append(" OR description:(").append(q).append(")");
            sb.append(" OR productNames:(").append(q).append(")");
            sb.append(" OR supplierName:(").append(q).append(")");
        } else {
            sb.append("*:*");
        }

        List<String> filters = new ArrayList<>();
        // Filter to only get bundles
        filters.add("docType:bundle");
        filters.add("isActive:true");

        if (searchRequest.getSupplierId() != null) {
            filters.add("supplierId:" + searchRequest.getSupplierId());
        }
        if (searchRequest.getMinPrice() != null) {
            filters.add("bundlePrice:[" + searchRequest.getMinPrice() + " TO *]");
        }
        if (searchRequest.getMaxPrice() != null) {
            filters.add("bundlePrice:[* TO " + searchRequest.getMaxPrice() + "]");
        }
        if (searchRequest.getMinDiscount() != null) {
            filters.add("discountPercentage:[" + searchRequest.getMinDiscount() + " TO *]");
        }
        if (searchRequest.getIsFeatured() != null && searchRequest.getIsFeatured()) {
            filters.add("isFeatured:true");
        }
        if (searchRequest.getProductIds() != null && !searchRequest.getProductIds().isEmpty()) {
            String productFilter = searchRequest.getProductIds().stream()
                    .map(id -> "productIds:" + id)
                    .collect(Collectors.joining(" OR "));
            filters.add("(" + productFilter + ")");
        }

        SolrQuery query = new SolrQuery();
        query.setQuery(sb.toString());
        for (String f : filters) {
            query.addFilterQuery(f);
        }
        
        query.setFields("id,bundleId,name,description,supplierId,supplierName,discountPercentage," +
                "originalPrice,bundlePrice,totalItems,minOrderQuantity,isFeatured,isActive," +
                "imageUrl,productIds,productNames,createdAt,updatedAt,docType");

        // Sorting
        if ("price".equals(searchRequest.getSortBy())) {
            query.setSort("bundlePrice", 
                "asc".equals(searchRequest.getSortDirection()) ? SolrQuery.ORDER.asc : SolrQuery.ORDER.desc);
        } else if ("discount".equals(searchRequest.getSortBy())) {
            query.setSort("discountPercentage", 
                "asc".equals(searchRequest.getSortDirection()) ? SolrQuery.ORDER.asc : SolrQuery.ORDER.desc);
        } else if ("newest".equals(searchRequest.getSortBy())) {
            query.setSort("createdAt", SolrQuery.ORDER.desc);
        }

        return query;
    }

    private BundleDocument mapToBundleDocument(SolrDocument doc) {
        BundleDocument bundle = new BundleDocument();
        bundle.setId((String) doc.getFieldValue("id"));
        bundle.setBundleId(getNumericValue(doc, "bundleId", Long.class));
        bundle.setDocType("bundle");
        bundle.setName((String) doc.getFieldValue("name"));
        bundle.setDescription((String) doc.getFieldValue("description"));
        bundle.setSupplierId(getNumericValue(doc, "supplierId", Long.class));
        bundle.setSupplierName((String) doc.getFieldValue("supplierName"));
        bundle.setDiscountPercentage(getBigDecimalValue(doc, "discountPercentage"));
        bundle.setOriginalPrice(getBigDecimalValue(doc, "originalPrice"));
        bundle.setBundlePrice(getBigDecimalValue(doc, "bundlePrice"));
        bundle.setTotalItems(getNumericValue(doc, "totalItems", Integer.class));
        bundle.setMinOrderQuantity(getNumericValue(doc, "minOrderQuantity", Integer.class));
        bundle.setIsFeatured(getBooleanValue(doc, "isFeatured"));
        bundle.setIsActive(getBooleanValue(doc, "isActive"));
        bundle.setImageUrl((String) doc.getFieldValue("imageUrl"));
        
        // Handle multi-valued fields
        Collection<?> productIdsCol = doc.getFieldValues("productIds");
        if (productIdsCol != null) {
            bundle.setProductIds(productIdsCol.stream()
                    .map(v -> ((Number) v).longValue())
                    .collect(Collectors.toList()));
        }
        
        Collection<?> productNamesCol = doc.getFieldValues("productNames");
        if (productNamesCol != null) {
            bundle.setProductNames(productNamesCol.stream()
                    .map(Object::toString)
                    .collect(Collectors.toList()));
        }
        
        return bundle;
    }

    private <T extends Number> T getNumericValue(SolrDocument doc, String field, Class<T> type) {
        Object value = doc.getFieldValue(field);
        if (value == null) return null;
        if (type == Long.class) {
            return type.cast(((Number) value).longValue());
        } else if (type == Integer.class) {
            return type.cast(((Number) value).intValue());
        }
        return null;
    }

    private BigDecimal getBigDecimalValue(SolrDocument doc, String field) {
        Object value = doc.getFieldValue(field);
        if (value == null) return null;
        return new BigDecimal(value.toString());
    }

    private Boolean getBooleanValue(SolrDocument doc, String field) {
        Object value = doc.getFieldValue(field);
        if (value == null) return null;
        return Boolean.valueOf(value.toString());
    }

    private BundleSearchResult mapToSearchResult(BundleDocument doc) {
        BundleSearchResult result = new BundleSearchResult();
        result.setId(doc.getBundleId());
        result.setName(doc.getName());
        result.setDescription(doc.getDescription());
        result.setSupplierId(doc.getSupplierId());
        result.setSupplierName(doc.getSupplierName());
        result.setDiscountPercentage(doc.getDiscountPercentage());
        result.setOriginalPrice(doc.getOriginalPrice());
        result.setBundlePrice(doc.getBundlePrice());
        result.setTotalItems(doc.getTotalItems());
        result.setMinOrderQuantity(doc.getMinOrderQuantity());
        result.setIsFeatured(doc.getIsFeatured());
        result.setImageUrl(doc.getImageUrl());
        result.setProductIds(doc.getProductIds());
        result.setProductNames(doc.getProductNames());
        return result;
    }

    private BundleSearchResponse createEmptyResponse(BundleSearchRequest request) {
        BundleSearchResponse response = new BundleSearchResponse();
        response.setResults(new ArrayList<>());
        response.setTotalResults(0L);
        response.setPage(request.getPage());
        response.setSize(request.getSize());
        response.setTotalPages(0);
        response.setSearchTime(0L);
        return response;
    }

    /**
     * Index a bundle in Solr
     */
    public void indexBundle(BundleDocument bundle) {
        try {
            SolrInputDocument doc = new SolrInputDocument();
            doc.addField("id", "bundle_" + bundle.getBundleId()); // Prefix to avoid ID collision with products
            doc.addField("bundleId", bundle.getBundleId());
            doc.addField("docType", "bundle");
            doc.addField("name", bundle.getName());
            doc.addField("description", bundle.getDescription());
            doc.addField("supplierId", bundle.getSupplierId());
            doc.addField("supplierName", bundle.getSupplierName());
            doc.addField("discountPercentage", bundle.getDiscountPercentage() != null ? 
                    bundle.getDiscountPercentage().doubleValue() : null);
            doc.addField("originalPrice", bundle.getOriginalPrice() != null ? 
                    bundle.getOriginalPrice().doubleValue() : null);
            doc.addField("bundlePrice", bundle.getBundlePrice() != null ? 
                    bundle.getBundlePrice().doubleValue() : null);
            doc.addField("totalItems", bundle.getTotalItems());
            doc.addField("minOrderQuantity", bundle.getMinOrderQuantity());
            doc.addField("isFeatured", bundle.getIsFeatured());
            doc.addField("isActive", bundle.getIsActive());
            doc.addField("imageUrl", bundle.getImageUrl());
            doc.addField("productIds", bundle.getProductIds());
            doc.addField("productNames", bundle.getProductNames());
            doc.addField("createdAt", bundle.getCreatedAt());
            doc.addField("updatedAt", bundle.getUpdatedAt());

            solrClient.add(COLLECTION, doc);
            solrClient.commit(COLLECTION);
            log.info("Indexed bundle: {}", bundle.getBundleId());
        } catch (Exception e) {
            log.error("Error indexing bundle {}: {}", bundle.getBundleId(), e.getMessage());
        }
    }

    /**
     * Delete a bundle from Solr
     */
    public void deleteBundle(Long bundleId) {
        try {
            solrClient.deleteById(COLLECTION, "bundle_" + bundleId);
            solrClient.commit(COLLECTION);
            log.info("Deleted bundle from index: {}", bundleId);
        } catch (Exception e) {
            log.error("Error deleting bundle {}: {}", bundleId, e.getMessage());
        }
    }
}
