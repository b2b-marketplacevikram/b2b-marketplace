package com.b2b.marketplace.user.controller;

import com.b2b.marketplace.user.entity.Buyer;
import com.b2b.marketplace.user.repository.BuyerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/buyers")
@CrossOrigin(origins = "*")
public class BuyerController {

    @Autowired
    private BuyerRepository buyerRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<Buyer> getBuyerByUserId(@PathVariable Long userId) {
        // Find existing buyer or create new one
        Buyer buyer = buyerRepository.findByUserId(userId)
                .orElseGet(() -> {
                    // Create a new buyer record for this user (allows suppliers to also buy)
                    Buyer newBuyer = new Buyer();
                    newBuyer.setUserId(userId);
                    return buyerRepository.save(newBuyer);
                });
        return ResponseEntity.ok(buyer);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Buyer> getBuyerByEmail(@PathVariable String email) {
        return buyerRepository.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{userId}")
    public ResponseEntity<Buyer> updateBuyer(@PathVariable Long userId, @RequestBody Buyer buyerData) {
        // Find existing buyer by userId or create new one
        Buyer buyer = buyerRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Buyer newBuyer = new Buyer();
                    newBuyer.setUserId(userId);
                    return newBuyer;
                });
        
        // Update fields
        if (buyerData.getPhoneNumber() != null) {
            buyer.setPhoneNumber(buyerData.getPhoneNumber());
        }
        if (buyerData.getAddress() != null) {
            buyer.setAddress(buyerData.getAddress());
        }
        if (buyerData.getCity() != null) {
            buyer.setCity(buyerData.getCity());
        }
        if (buyerData.getState() != null) {
            buyer.setState(buyerData.getState());
        }
        if (buyerData.getCountry() != null) {
            buyer.setCountry(buyerData.getCountry());
        }
        if (buyerData.getPostalCode() != null) {
            buyer.setPostalCode(buyerData.getPostalCode());
        }
        if (buyerData.getCompanyName() != null) {
            buyer.setCompanyName(buyerData.getCompanyName());
        }
        if (buyerData.getTaxId() != null) {
            buyer.setTaxId(buyerData.getTaxId());
        }
        if (buyerData.getShippingAddress() != null) {
            buyer.setShippingAddress(buyerData.getShippingAddress());
        }
        if (buyerData.getBillingAddress() != null) {
            buyer.setBillingAddress(buyerData.getBillingAddress());
        }
        
        Buyer savedBuyer = buyerRepository.save(buyer);
        return ResponseEntity.ok(savedBuyer);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Buyer> getBuyerById(@PathVariable Long id) {
        return buyerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
