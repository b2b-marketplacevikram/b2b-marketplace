package com.b2b.marketplace.admin.repository;

import com.b2b.marketplace.admin.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.userType = 'BUYER'")
    Long countBuyers();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.userType = 'SUPPLIER'")
    Long countSuppliers();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = false")
    Long countInactiveUsers();
    
    List<User> findByUserType(User.UserType userType);
    
    List<User> findByIsActive(Boolean isActive);
}
