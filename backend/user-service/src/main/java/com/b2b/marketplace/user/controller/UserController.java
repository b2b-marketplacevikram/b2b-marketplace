package com.b2b.marketplace.user.controller;

import com.b2b.marketplace.user.dto.UserDTO;
import com.b2b.marketplace.user.entity.User;
import com.b2b.marketplace.user.entity.Buyer;
import com.b2b.marketplace.user.entity.Supplier;
import com.b2b.marketplace.user.repository.UserRepository;
import com.b2b.marketplace.user.repository.BuyerRepository;
import com.b2b.marketplace.user.repository.SupplierRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:8083"})
public class UserController {

    private static final String SECRET_KEY = "YourVeryLongSecretKeyForJWTTokenGenerationAndValidation2024B2BMarketplace";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BuyerRepository buyerRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    /**
     * Get current authenticated user from JWT token
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "No valid token provided"));
            }

            String token = authHeader.substring(7);
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(SECRET_KEY.getBytes())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            Long userId = Long.parseLong(claims.getSubject());

            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

            UserDTO userDTO = UserDTO.fromEntity(user);

            // Fetch company name based on user type
            if (user.getUserType() == User.UserType.SUPPLIER) {
                Optional<Supplier> supplierOpt = supplierRepository.findByUserId(user.getId());
                if (supplierOpt.isPresent()) {
                    userDTO.setCompanyName(supplierOpt.get().getCompanyName());
                }
            } else if (user.getUserType() == User.UserType.BUYER) {
                Optional<Buyer> buyerOpt = buyerRepository.findByUserId(user.getId());
                if (buyerOpt.isPresent() && buyerOpt.get().getCompanyName() != null) {
                    userDTO.setCompanyName(buyerOpt.get().getCompanyName());
                }
            }

            if (userDTO.getCompanyName() == null || userDTO.getCompanyName().isEmpty()) {
                userDTO.setCompanyName(user.getFullName());
            }

            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired token"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

            UserDTO userDTO = UserDTO.fromEntity(user);

            // Fetch company name based on user type
            if (user.getUserType() == User.UserType.SUPPLIER) {
                Optional<Supplier> supplierOpt = supplierRepository.findByUserId(user.getId());
                if (supplierOpt.isPresent()) {
                    userDTO.setCompanyName(supplierOpt.get().getCompanyName());
                }
            } else if (user.getUserType() == User.UserType.BUYER) {
                Optional<Buyer> buyerOpt = buyerRepository.findByUserId(user.getId());
                if (buyerOpt.isPresent() && buyerOpt.get().getCompanyName() != null) {
                    userDTO.setCompanyName(buyerOpt.get().getCompanyName());
                }
            }

            // If no company name, fall back to full name
            if (userDTO.getCompanyName() == null || userDTO.getCompanyName().isEmpty()) {
                userDTO.setCompanyName(user.getFullName());
            }

            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}