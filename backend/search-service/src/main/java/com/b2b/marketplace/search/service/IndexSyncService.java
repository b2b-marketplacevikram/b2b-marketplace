package com.b2b.marketplace.search.service;

import com.b2b.marketplace.search.document.ProductDocument;
import com.b2b.marketplace.search.document.BundleDocument;
import com.b2b.marketplace.search.entity.Product;
import com.b2b.marketplace.search.entity.Bundle;
import com.b2b.marketplace.search.entity.BundleItem;
import com.b2b.marketplace.search.repository.ProductRepository;
import com.b2b.marketplace.search.repository.BundleRepository;
import com.b2b.marketplace.search.repository.BundleItemRepository;
import com.b2b.marketplace.search.service.SolrSearchService;
import com.b2b.marketplace.search.service.BundleSolrSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "spring.data.solr.enabled", havingValue = "true", matchIfMissing = true)
public class IndexSyncService {
    
    private final ProductRepository productRepository;
    private final BundleRepository bundleRepository;
    private final BundleItemRepository bundleItemRepository;
    private final SolrSearchService solrSearchService;
    private final BundleSolrSearchService bundleSolrSearchService;
    
    // Sync on application startup (wait a bit for Solr to be ready)
    @EventListener(ApplicationReadyEvent.class)
    public void syncOnStartup() {
        log.info("Application started, initiating index sync...");
        try {
            // Wait a bit for Solr to be ready
            Thread.sleep(5000);
            syncAllProducts();
            syncAllBundles();
        } catch (Exception e) {
            log.error("Error syncing on startup: {}", e.getMessage());
        }
    }
    
    // Sync every hour
    @Scheduled(fixedRate = 3600000)
    public void scheduledSync() {
        log.info("Starting scheduled index sync...");
        syncAllProducts();
        syncAllBundles();
    }
    
    public void syncAllProducts() {
        try {
            log.info("Fetching all products from database...");
            List<Product> products = productRepository.findAllActive();
            log.info("Found {} active products to index", products.size());
            
            int indexed = 0;
            for (Product product : products) {
                try {
                                ProductDocument doc = convertToDocument(product);
                    solrSearchService.indexProduct(doc);
                    indexed++;
                    
                    if (indexed % 100 == 0) {
                        log.info("Indexed {} products...", indexed);
                    }
                } catch (Exception e) {
                    log.error("Error indexing product {}: {}", product.getId(), e.getMessage());
                }
            }
            
            log.info("Index sync completed. Indexed {} products", indexed);
        } catch (Exception e) {
            log.error("Error during index sync: {}", e.getMessage(), e);
        }
    }
    
    private ProductDocument convertToDocument(Product product) {
        ProductDocument doc = new ProductDocument();
        doc.setId(String.valueOf(product.getId()));
        doc.setProductId(product.getId());
        doc.setName(product.getName());
        doc.setDescription(product.getDescription());
        doc.setSku(product.getSku());
        doc.setPrice(product.getUnitPrice());
        doc.setMoq(product.getMoq());
        doc.setStockQuantity(product.getStockQuantity());
        doc.setCategoryId(product.getCategoryId());
        doc.setSupplierId(product.getSupplierId());
        doc.setOrigin(product.getOrigin());
        doc.setRating(product.getAverageRating());
        doc.setReviewCount(product.getReviewCount());
        doc.setIsFeatured(product.getIsFeatured());
        doc.setIsActive(product.getIsActive());
        doc.setCreatedAt(product.getCreatedAt());
        doc.setUpdatedAt(product.getUpdatedAt());
        
        // Set category and supplier names (you could fetch from related tables)
        doc.setCategoryName(getCategoryName(product.getCategoryId()));
        doc.setSupplierName(getSupplierName(product.getSupplierId()));
        
        return doc;
    }
    
    private String getCategoryName(Long categoryId) {
        if (categoryId == null) return "Unknown";
        // Map category IDs to names (you could query the database instead)
        switch (categoryId.intValue()) {
            case 1: return "Electronics";
            case 2: return "Machinery";
            case 3: return "Textiles";
            case 4: return "Construction";
            case 5: return "Chemicals";
            case 6: return "Packaging";
            case 7: return "Automotive";
            case 8: return "Food & Beverage";
            default: return "Other";
        }
    }
    
    private String getSupplierName(Long supplierId) {
        if (supplierId == null) return "Unknown Supplier";
        // Default supplier name, could be fetched from database
        return "Supplier " + supplierId;
    }
    
    // ============== Bundle Sync ==============
    
    public void syncAllBundles() {
        try {
            log.info("Fetching all bundles from database...");
            List<Bundle> bundles = bundleRepository.findAllActive();
            log.info("Found {} active bundles to index", bundles.size());
            
            int indexed = 0;
            for (Bundle bundle : bundles) {
                try {
                    BundleDocument doc = convertBundleToDocument(bundle);
                    bundleSolrSearchService.indexBundle(doc);
                    indexed++;
                    
                    if (indexed % 50 == 0) {
                        log.info("Indexed {} bundles...", indexed);
                    }
                } catch (Exception e) {
                    log.error("Error indexing bundle {}: {}", bundle.getId(), e.getMessage());
                }
            }
            
            log.info("Bundle index sync completed. Indexed {} bundles", indexed);
        } catch (Exception e) {
            log.error("Error during bundle index sync: {}", e.getMessage(), e);
        }
    }
    
    private BundleDocument convertBundleToDocument(Bundle bundle) {
        BundleDocument doc = new BundleDocument();
        doc.setId("bundle_" + bundle.getId());
        doc.setBundleId(bundle.getId());
        doc.setDocType("bundle");
        doc.setName(bundle.getName());
        doc.setDescription(bundle.getDescription());
        doc.setSupplierId(bundle.getSupplierId());
        doc.setSupplierName(getSupplierName(bundle.getSupplierId()));
        doc.setDiscountPercentage(bundle.getDiscountPercentage());
        doc.setOriginalPrice(bundle.getOriginalPrice());
        doc.setBundlePrice(bundle.getBundlePrice());
        doc.setMinOrderQuantity(bundle.getMinOrderQuantity());
        doc.setIsFeatured(bundle.getIsFeatured());
        doc.setIsActive(bundle.getIsActive());
        doc.setImageUrl(bundle.getImageUrl());
        doc.setCreatedAt(bundle.getCreatedAt());
        doc.setUpdatedAt(bundle.getUpdatedAt());
        
        // Get bundle items and product info
        List<BundleItem> items = bundleItemRepository.findByBundleId(bundle.getId());
        doc.setTotalItems(items.size());
        
        List<Long> productIds = items.stream()
                .map(BundleItem::getProductId)
                .collect(Collectors.toList());
        doc.setProductIds(productIds);
        
        // Get product names
        List<String> productNames = productIds.stream()
                .map(this::getProductName)
                .collect(Collectors.toList());
        doc.setProductNames(productNames);
        
        return doc;
    }
    
    private String getProductName(Long productId) {
        if (productId == null) return "Unknown Product";
        try {
            return productRepository.findById(productId)
                    .map(Product::getName)
                    .orElse("Product " + productId);
        } catch (Exception e) {
            return "Product " + productId;
        }
    }
}
