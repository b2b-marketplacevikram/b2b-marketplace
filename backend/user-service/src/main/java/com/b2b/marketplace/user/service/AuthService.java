package com.b2b.marketplace.user.service;

import com.b2b.marketplace.user.dto.LoginRequest;
import com.b2b.marketplace.user.dto.LoginResponse;
import com.b2b.marketplace.user.dto.RegisterRequest;
import com.b2b.marketplace.user.entity.Buyer;
import com.b2b.marketplace.user.entity.Supplier;
import com.b2b.marketplace.user.entity.User;
import com.b2b.marketplace.user.repository.BuyerRepository;
import com.b2b.marketplace.user.repository.SupplierRepository;
import com.b2b.marketplace.user.repository.UserRepository;
import com.b2b.marketplace.user.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BuyerRepository buyerRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Create user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setUserType(User.UserType.valueOf(request.getUserType().toUpperCase()));
        user = userRepository.save(user);

        // Create buyer or supplier profile (not needed for admin)
        if (user.getUserType() == User.UserType.BUYER) {
            Buyer buyer = new Buyer();
            buyer.setUserId(user.getId());
            // Use companyName if provided, otherwise fallback to fullName
            buyer.setCompanyName(request.getCompanyName() != null ? request.getCompanyName() : request.getFullName());
            buyer.setCountry(request.getCountry());
            buyer.setCity(request.getCity());
            buyerRepository.save(buyer);
        } else if (user.getUserType() == User.UserType.SUPPLIER) {
            Supplier supplier = new Supplier();
            supplier.setUserId(user.getId());
            // Use companyName if provided, otherwise fallback to fullName
            supplier.setCompanyName(request.getCompanyName() != null ? request.getCompanyName() : request.getFullName());
            supplier.setBusinessType(request.getBusinessType());
            supplier.setCountry(request.getCountry());
            supplier.setCity(request.getCity());
            supplier.setAddress(request.getAddress());
            supplier.setWebsite(request.getWebsite());
            supplier.setDescription(request.getDescription());
            supplierRepository.save(supplier);
        }
        // ADMIN users don't need buyer/supplier profile

        // Generate token
        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getUserType().name());

        return new LoginResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.getUserType().name());
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!user.getIsActive()) {
            throw new RuntimeException("Account is deactivated");
        }

        // Generate token
        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getUserType().name());

        return new LoginResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.getUserType().name());
    }
}
