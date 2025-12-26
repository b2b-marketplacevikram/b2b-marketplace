package com.b2b.marketplace.product.service;

import com.b2b.marketplace.product.dto.*;
import com.b2b.marketplace.product.entity.Bundle;
import com.b2b.marketplace.product.entity.BundleItem;
import com.b2b.marketplace.product.entity.Product;
import com.b2b.marketplace.product.entity.ProductImage;
import com.b2b.marketplace.product.entity.Supplier;
import com.b2b.marketplace.product.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BundleService {

    private final BundleRepository bundleRepository;
    private final BundleItemRepository bundleItemRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final SupplierRepository supplierRepository;

    public List<BundleResponse> getAllBundles() {
        return bundleRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BundleResponse> getFeaturedBundles() {
        return bundleRepository.findByIsFeaturedTrueAndIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BundleResponse> getActiveBundles() {
        return bundleRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BundleResponse getBundleById(Long id) {
        Bundle bundle = bundleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bundle not found with id: " + id));
        return mapToResponse(bundle);
    }

    public List<BundleResponse> getBundlesBySupplier(Long supplierId) {
        return bundleRepository.findBySupplierId(supplierId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BundleResponse> searchBundles(String keyword) {
        return bundleRepository.searchByKeyword(keyword).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BundleResponse> getBundlesContainingProduct(Long productId) {
        return bundleRepository.findByProductId(productId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BundleResponse createBundle(BundleRequest request) {
        log.info("Creating bundle: {}", request.getName());

        // Validate supplier exists
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        Bundle bundle = new Bundle();
        bundle.setSupplierId(request.getSupplierId());
        bundle.setName(request.getName());
        bundle.setDescription(request.getDescription());
        bundle.setDiscountPercentage(request.getDiscountPercentage() != null ? 
                request.getDiscountPercentage() : BigDecimal.ZERO);
        bundle.setMinOrderQuantity(request.getMinOrderQuantity() != null ? 
                request.getMinOrderQuantity() : 1);
        bundle.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        bundle.setIsFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false);
        bundle.setImageUrl(request.getImageUrl());

        // Calculate prices based on items
        BigDecimal originalPrice = BigDecimal.ZERO;
        List<BundleItem> bundleItems = new ArrayList<>();

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (BundleItemRequest itemRequest : request.getItems()) {
                Product product = productRepository.findById(itemRequest.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found: " + itemRequest.getProductId()));

                // Verify product belongs to same supplier
                if (!product.getSupplierId().equals(request.getSupplierId())) {
                    throw new RuntimeException("Product " + itemRequest.getProductId() + 
                            " does not belong to this supplier");
                }

                BundleItem item = new BundleItem();
                item.setBundle(bundle);
                item.setProductId(itemRequest.getProductId());
                item.setQuantity(itemRequest.getQuantity() != null ? itemRequest.getQuantity() : 1);
                bundleItems.add(item);

                // Calculate original price
                BigDecimal itemTotal = product.getUnitPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity()));
                originalPrice = originalPrice.add(itemTotal);
            }
        }

        bundle.setOriginalPrice(originalPrice);
        
        // Calculate bundle price with discount
        BigDecimal discountMultiplier = BigDecimal.ONE.subtract(
                bundle.getDiscountPercentage().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
        bundle.setBundlePrice(originalPrice.multiply(discountMultiplier).setScale(2, RoundingMode.HALF_UP));

        bundle.setItems(bundleItems);
        Bundle savedBundle = bundleRepository.save(bundle);

        log.info("Bundle created successfully with id: {}", savedBundle.getId());
        return mapToResponse(savedBundle);
    }

    @Transactional
    public BundleResponse updateBundle(Long id, BundleRequest request) {
        Bundle bundle = bundleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bundle not found with id: " + id));

        // Clear existing items first if new items provided
        if (request.getItems() != null) {
            bundle.getItems().clear();
            bundleRepository.saveAndFlush(bundle);
        }

        // Now update fields
        bundle.setName(request.getName());
        bundle.setDescription(request.getDescription());
        bundle.setDiscountPercentage(request.getDiscountPercentage() != null ? 
                request.getDiscountPercentage() : bundle.getDiscountPercentage());
        bundle.setMinOrderQuantity(request.getMinOrderQuantity() != null ?
                request.getMinOrderQuantity() : bundle.getMinOrderQuantity());
        bundle.setIsActive(request.getIsActive() != null ? 
                request.getIsActive() : bundle.getIsActive());
        bundle.setIsFeatured(request.getIsFeatured() != null ?
                request.getIsFeatured() : bundle.getIsFeatured());
        bundle.setImageUrl(request.getImageUrl());

        BigDecimal originalPrice = bundle.getOriginalPrice() != null ? 
                bundle.getOriginalPrice() : BigDecimal.ZERO;

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            originalPrice = BigDecimal.ZERO;
            for (BundleItemRequest itemRequest : request.getItems()) {
                Product product = productRepository.findById(itemRequest.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found: " + itemRequest.getProductId()));

                BundleItem item = new BundleItem();
                item.setBundle(bundle);
                item.setProductId(itemRequest.getProductId());
                item.setQuantity(itemRequest.getQuantity() != null ? itemRequest.getQuantity() : 1);
                bundle.getItems().add(item);

                BigDecimal itemTotal = product.getUnitPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity()));
                originalPrice = originalPrice.add(itemTotal);
            }
            bundle.setOriginalPrice(originalPrice);
        }

        BigDecimal discount = bundle.getDiscountPercentage() != null ? 
                bundle.getDiscountPercentage() : BigDecimal.ZERO;
        BigDecimal discountMultiplier = BigDecimal.ONE.subtract(
                discount.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
        bundle.setBundlePrice(originalPrice.multiply(discountMultiplier).setScale(2, RoundingMode.HALF_UP));

        Bundle savedBundle = bundleRepository.save(bundle);
        return mapToResponse(savedBundle);
    }

    @Transactional
    public void deleteBundle(Long id) {
        Bundle bundle = bundleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bundle not found with id: " + id));
        bundleRepository.delete(bundle);
    }

    @Transactional
    public void deactivateBundle(Long id) {
        Bundle bundle = bundleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bundle not found with id: " + id));
        bundle.setIsActive(false);
        bundleRepository.save(bundle);
    }

    private BundleResponse mapToResponse(Bundle bundle) {
        BundleResponse response = new BundleResponse();
        response.setId(bundle.getId());
        response.setSupplierId(bundle.getSupplierId());
        response.setName(bundle.getName());
        response.setDescription(bundle.getDescription());
        response.setDiscountPercentage(bundle.getDiscountPercentage());
        response.setOriginalPrice(bundle.getOriginalPrice());
        response.setBundlePrice(bundle.getBundlePrice());
        response.setMinOrderQuantity(bundle.getMinOrderQuantity());
        response.setIsActive(bundle.getIsActive());
        response.setIsFeatured(bundle.getIsFeatured());
        response.setImageUrl(bundle.getImageUrl());
        response.setCreatedAt(bundle.getCreatedAt());
        response.setUpdatedAt(bundle.getUpdatedAt());

        // Calculate savings
        if (bundle.getOriginalPrice() != null && bundle.getBundlePrice() != null) {
            response.setSavings(bundle.getOriginalPrice().subtract(bundle.getBundlePrice()));
        }

        // Get supplier details
        supplierRepository.findById(bundle.getSupplierId()).ifPresent(supplier -> {
            response.setSupplierUserId(supplier.getUserId());
            response.setSupplierName(supplier.getCompanyName());
        });

        // Map items
        List<BundleItemResponse> itemResponses = new ArrayList<>();
        if (bundle.getItems() != null) {
            for (BundleItem item : bundle.getItems()) {
                BundleItemResponse itemResponse = mapToItemResponse(item);
                itemResponses.add(itemResponse);
            }
        }
        response.setItems(itemResponses);
        response.setTotalItems(itemResponses.size());

        return response;
    }

    private BundleItemResponse mapToItemResponse(BundleItem item) {
        BundleItemResponse response = new BundleItemResponse();
        response.setId(item.getId());
        response.setProductId(item.getProductId());
        response.setQuantity(item.getQuantity());

        // Get product details
        productRepository.findById(item.getProductId()).ifPresent(product -> {
            response.setProductName(product.getName());
            response.setUnitPrice(product.getUnitPrice());
            response.setSubtotal(product.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));

            // Get product image
            List<ProductImage> images = productImageRepository.findByProductId(product.getId());
            if (!images.isEmpty()) {
                response.setProductImage(images.get(0).getImageUrl());
            }
        });

        return response;
    }
}
