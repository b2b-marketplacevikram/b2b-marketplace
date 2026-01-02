package com.b2b.marketplace.product.service;

import com.b2b.marketplace.product.dto.*;
import com.b2b.marketplace.product.entity.Category;
import com.b2b.marketplace.product.entity.Product;
import com.b2b.marketplace.product.entity.ProductImage;
import com.b2b.marketplace.product.entity.Supplier;
import com.b2b.marketplace.product.repository.CategoryRepository;
import com.b2b.marketplace.product.repository.ProductImageRepository;
import com.b2b.marketplace.product.repository.ProductRepository;
import com.b2b.marketplace.product.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return mapToResponse(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsBySupplier(Long supplierId) {
        return productRepository.findBySupplierId(supplierId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> searchProducts(String keyword) {
        return productRepository.searchByKeyword(keyword).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> searchProductsByCategoryAndKeyword(Long categoryId, String keyword) {
        return productRepository.searchByCategoryAndKeyword(categoryId, keyword).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return productRepository.findByPriceRange(minPrice, maxPrice).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getTopRatedProducts() {
        return productRepository.findTopRatedProducts().stream()
                .limit(10)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getProductsBySupplierUserId(Long userId) {
        Long supplierId = getSupplierIdFromUserId(userId);
        return getProductsBySupplier(supplierId);
    }

    private Long getSupplierIdFromUserId(Long userId) {
        log.info("Converting user ID {} to supplier ID", userId);
        
        Optional<Supplier> supplierOpt = supplierRepository.findByUserId(userId);
        if (supplierOpt.isPresent()) {
            Long supplierId = supplierOpt.get().getId();
            log.info("Found supplier ID {} for user ID {}", supplierId, userId);
            return supplierId;
        }
        
        log.warn("No supplier found for user ID {}, creating new supplier record", userId);
        Supplier newSupplier = new Supplier();
        newSupplier.setUserId(userId);
        newSupplier.setCompanyName("Supplier " + userId); // Default company name
        newSupplier = supplierRepository.save(newSupplier);
        log.info("Created new supplier ID {} for user ID {}", newSupplier.getId(), userId);
        return newSupplier.getId();
    }

    private String generateSlug(String name) {
        if (name == null) return "";
        return name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")  // Remove special chars
                .replaceAll("\\s+", "-")          // Replace spaces with hyphens
                .replaceAll("-+", "-")            // Remove duplicate hyphens
                .trim();
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Product product = new Product();
        Long supplierId = getSupplierIdFromUserId(request.getSupplierId());
        product.setSupplierId(supplierId);
        product.setCategoryId(request.getCategoryId());
        product.setName(request.getName());
        product.setSlug(generateSlug(request.getName()));
        product.setDescription(request.getDescription());
        product.setUnitPrice(request.getUnitPrice());
        product.setUnit(request.getUnit());
        product.setMoq(request.getMoq());
        product.setStockQuantity(request.getStockQuantity());
        product.setLeadTimeDays(request.getLeadTimeDays());
        product.setOrigin(request.getOrigin());
        product.setBrand(request.getBrand());
        product.setModel(request.getModel());
        
        // Handle specifications - ensure valid JSON or null
        String specs = request.getSpecifications();
        if (specs != null && !specs.trim().isEmpty()) {
            // If not already JSON, set to null
            if (!specs.trim().startsWith("{") && !specs.trim().startsWith("[")) {
                product.setSpecifications(null);
            } else {
                product.setSpecifications(specs);
            }
        } else {
            product.setSpecifications(null);
        }
        
        product.setIsActive(request.getIsActive());
        product.setIsFeatured(request.getIsFeatured());

        Product savedProduct = productRepository.save(product);

        // Save product images
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                ProductImage image = new ProductImage();
                image.setProductId(savedProduct.getId());
                image.setImageUrl(request.getImageUrls().get(i));
                image.setIsPrimary(i == 0); // First image is primary
                image.setSortOrder(i);
                productImageRepository.save(image);
            }
        }

        return mapToResponse(savedProduct);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        product.setCategoryId(request.getCategoryId());
        product.setName(request.getName());
        product.setSlug(generateSlug(request.getName()));
        product.setDescription(request.getDescription());
        product.setUnitPrice(request.getUnitPrice());
        product.setUnit(request.getUnit());
        product.setMoq(request.getMoq());
        product.setStockQuantity(request.getStockQuantity());
        product.setLeadTimeDays(request.getLeadTimeDays());
        product.setOrigin(request.getOrigin());
        product.setBrand(request.getBrand());
        product.setModel(request.getModel());
        
        // Handle specifications - ensure valid JSON or null
        String specs = request.getSpecifications();
        if (specs != null && !specs.trim().isEmpty()) {
            // If not already JSON, set to null
            if (!specs.trim().startsWith("{") && !specs.trim().startsWith("[")) {
                product.setSpecifications(null);
            } else {
                product.setSpecifications(specs);
            }
        } else {
            product.setSpecifications(null);
        }
        
        product.setIsActive(request.getIsActive());
        product.setIsFeatured(request.getIsFeatured());

        Product updatedProduct = productRepository.save(product);

        // Update images if provided
        if (request.getImageUrls() != null) {
            productImageRepository.deleteByProductId(id);
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                ProductImage image = new ProductImage();
                image.setProductId(id);
                image.setImageUrl(request.getImageUrls().get(i));
                image.setIsPrimary(i == 0);
                image.setSortOrder(i);
                productImageRepository.save(image);
            }
        }

        return mapToResponse(updatedProduct);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        product.setIsActive(false);
        productRepository.save(product);
    }

    private ProductResponse mapToResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setSupplierId(product.getSupplierId());
        response.setCategoryId(product.getCategoryId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setUnitPrice(product.getUnitPrice());
        response.setUnit(product.getUnit());
        response.setMoq(product.getMoq());
        response.setStockQuantity(product.getStockQuantity());
        response.setLeadTimeDays(product.getLeadTimeDays());
        response.setOrigin(product.getOrigin());
        response.setBrand(product.getBrand());
        response.setModel(product.getModel());
        response.setSpecifications(product.getSpecifications());
        response.setIsActive(product.getIsActive());
        response.setIsFeatured(product.getIsFeatured());
        response.setAverageRating(product.getAverageRating() != null ? BigDecimal.valueOf(product.getAverageRating()) : null);
        response.setReviewCount(product.getReviewCount());
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());

        // Get category name
        if (product.getCategoryId() != null) {
            categoryRepository.findById(product.getCategoryId())
                    .ifPresent(category -> response.setCategoryName(category.getName()));
        }

        // Get supplier details (company name, type and user ID for messaging)
        if (product.getSupplierId() != null) {
            supplierRepository.findById(product.getSupplierId())
                    .ifPresent(supplier -> {
                        response.setSupplierUserId(supplier.getUserId());
                        response.setSupplierName(supplier.getCompanyName());
                        response.setSupplierType(supplier.getBusinessType());
                    });
        }

        // Get images
        List<ProductImage> images = productImageRepository.findByProductId(product.getId());
        List<ProductImageResponse> imageResponses = images.stream()
                .map(this::mapToImageResponse)
                .collect(Collectors.toList());
        response.setImages(imageResponses);

        return response;
    }

    private ProductImageResponse mapToImageResponse(ProductImage image) {
        ProductImageResponse response = new ProductImageResponse();
        response.setId(image.getId());
        response.setImageUrl(image.getImageUrl());
        response.setIsPrimary(image.getIsPrimary());
        response.setSortOrder(image.getSortOrder());
        return response;
    }

    /**
     * Reduce stock quantity for a product after order is placed
     * @param productId The product ID
     * @param quantity The quantity to reduce
     * @return Updated product response
     */
    @Transactional
    public ProductResponse reduceStock(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        
        int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        
        if (currentStock < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + currentStock + ", Requested: " + quantity);
        }
        
        product.setStockQuantity(currentStock - quantity);
        product = productRepository.save(product);
        
        log.info("Stock reduced for product {}: {} -> {} (reduced by {})", 
                productId, currentStock, product.getStockQuantity(), quantity);
        
        return mapToResponse(product);
    }

    /**
     * Restore stock quantity for a product (e.g., when order is cancelled)
     * @param productId The product ID
     * @param quantity The quantity to restore
     * @return Updated product response
     */
    @Transactional
    public ProductResponse restoreStock(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        
        int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        product.setStockQuantity(currentStock + quantity);
        product = productRepository.save(product);
        
        log.info("Stock restored for product {}: {} -> {} (restored by {})", 
                productId, currentStock, product.getStockQuantity(), quantity);
        
        return mapToResponse(product);
    }
}
