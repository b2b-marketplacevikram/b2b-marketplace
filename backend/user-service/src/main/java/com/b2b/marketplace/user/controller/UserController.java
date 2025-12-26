package com.b2b.marketplace.user.controller;

import com.b2b.marketplace.user.dto.UserDTO;
import com.b2b.marketplace.user.entity.User;
import com.b2b.marketplace.user.entity.Buyer;
import com.b2b.marketplace.user.entity.Supplier;
import com.b2b.marketplace.user.repository.UserRepository;
import com.b2b.marketplace.user.repository.BuyerRepository;
import com.b2b.marketplace.user.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:8083"})
public class UserController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BuyerRepository buyerRepository;
    
    @Autowired
    private SupplierRepository supplierRepository;

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
