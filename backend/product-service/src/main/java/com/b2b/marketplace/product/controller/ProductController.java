package com.b2b.marketplace.product.controller;

import com.b2b.marketplace.product.dto.ApiResponse;
import com.b2b.marketplace.product.dto.ProductRequest;
import com.b2b.marketplace.product.dto.ProductResponse;
import com.b2b.marketplace.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAllProducts() {
        List<ProductResponse> products = productService.getAllProducts();
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        try {
            ProductResponse product = productService.getProductById(id);
            return ResponseEntity.ok(ApiResponse.success(product));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getProductsBySupplier(
            @PathVariable Long supplierId) {
        List<ProductResponse> products = productService.getProductsBySupplier(supplierId);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/supplier/user/{userId}")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getProductsBySupplierUserId(
            @PathVariable Long userId) {
        List<ProductResponse> products = productService.getProductsBySupplierUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getProductsByCategory(
            @PathVariable Long categoryId) {
        List<ProductResponse> products = productService.getProductsByCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getFeaturedProducts() {
        List<ProductResponse> products = productService.getFeaturedProducts();
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/top-rated")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getTopRatedProducts() {
        List<ProductResponse> products = productService.getTopRatedProducts();
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> searchProducts(
            @RequestParam String keyword,
            @RequestParam(required = false) Long categoryId) {
        List<ProductResponse> products;
        if (categoryId != null) {
            products = productService.searchProductsByCategoryAndKeyword(categoryId, keyword);
        } else {
            products = productService.searchProducts(keyword);
        }
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/price-range")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getProductsByPriceRange(
            @RequestParam BigDecimal minPrice,
            @RequestParam BigDecimal maxPrice) {
        List<ProductResponse> products = productService.getProductsByPriceRange(minPrice, maxPrice);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @RequestBody ProductRequest request) {
        try {
            // Extract user ID from JWT token
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            // Check if user is authenticated (not anonymousUser)
            if (authentication == null || !authentication.isAuthenticated() 
                    || "anonymousUser".equals(authentication.getName())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not authenticated. Please login."));
            }
            
            Long userId;
            try {
                userId = Long.parseLong(authentication.getName());
            } catch (NumberFormatException e) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Invalid authentication token."));
            }
            
            // Override the supplierId from request with authenticated user's ID
            request.setSupplierId(userId);
            
            ProductResponse product = productService.createProduct(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Product created successfully", product));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductRequest request) {
        try {
            ProductResponse product = productService.updateProduct(id, request);
            return ResponseEntity.ok(ApiResponse.success("Product updated successfully", product));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Reduce stock for a product (called by Order Service after order is placed)
     */
    @PostMapping("/{id}/reduce-stock")
    public ResponseEntity<ApiResponse<ProductResponse>> reduceStock(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        try {
            ProductResponse product = productService.reduceStock(id, quantity);
            return ResponseEntity.ok(ApiResponse.success("Stock reduced successfully", product));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Restore stock for a product (called when order is cancelled)
     */
    @PostMapping("/{id}/restore-stock")
    public ResponseEntity<ApiResponse<ProductResponse>> restoreStock(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        try {
            ProductResponse product = productService.restoreStock(id, quantity);
            return ResponseEntity.ok(ApiResponse.success("Stock restored successfully", product));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
