package com.b2b.marketplace.product.controller;

import com.b2b.marketplace.product.dto.ApiResponse;
import com.b2b.marketplace.product.dto.BundleRequest;
import com.b2b.marketplace.product.dto.BundleResponse;
import com.b2b.marketplace.product.service.BundleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bundles")
@RequiredArgsConstructor
@Slf4j
public class BundleController {

    private final BundleService bundleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BundleResponse>>> getAllBundles() {
        List<BundleResponse> bundles = bundleService.getAllBundles();
        return ResponseEntity.ok(ApiResponse.success(bundles));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<BundleResponse>>> getFeaturedBundles() {
        List<BundleResponse> bundles = bundleService.getFeaturedBundles();
        return ResponseEntity.ok(ApiResponse.success(bundles));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<BundleResponse>>> getActiveBundles() {
        List<BundleResponse> bundles = bundleService.getActiveBundles();
        return ResponseEntity.ok(ApiResponse.success(bundles));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BundleResponse>> getBundleById(@PathVariable Long id) {
        try {
            BundleResponse bundle = bundleService.getBundleById(id);
            return ResponseEntity.ok(ApiResponse.success(bundle));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<ApiResponse<List<BundleResponse>>> getBundlesBySupplier(
            @PathVariable Long supplierId) {
        List<BundleResponse> bundles = bundleService.getBundlesBySupplier(supplierId);
        return ResponseEntity.ok(ApiResponse.success(bundles));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<BundleResponse>>> searchBundles(
            @RequestParam String keyword) {
        List<BundleResponse> bundles = bundleService.searchBundles(keyword);
        return ResponseEntity.ok(ApiResponse.success(bundles));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<BundleResponse>>> getBundlesContainingProduct(
            @PathVariable Long productId) {
        List<BundleResponse> bundles = bundleService.getBundlesContainingProduct(productId);
        return ResponseEntity.ok(ApiResponse.success(bundles));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BundleResponse>> createBundle(
            @RequestBody BundleRequest request) {
        try {
            // Get authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() 
                    || "anonymousUser".equals(authentication.getName())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not authenticated"));
            }

            BundleResponse bundle = bundleService.createBundle(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Bundle created successfully", bundle));
        } catch (RuntimeException e) {
            log.error("Error creating bundle: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BundleResponse>> updateBundle(
            @PathVariable Long id,
            @RequestBody BundleRequest request) {
        try {
            BundleResponse bundle = bundleService.updateBundle(id, request);
            return ResponseEntity.ok(ApiResponse.success("Bundle updated successfully", bundle));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBundle(@PathVariable Long id) {
        try {
            bundleService.deleteBundle(id);
            return ResponseEntity.ok(ApiResponse.success("Bundle deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateBundle(@PathVariable Long id) {
        try {
            bundleService.deactivateBundle(id);
            return ResponseEntity.ok(ApiResponse.success("Bundle deactivated successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
