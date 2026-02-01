package com.b2b.marketplace.product.repository;

import com.b2b.marketplace.product.entity.ClassificationClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassificationClassRepository extends JpaRepository<ClassificationClass, Long> {
    List<ClassificationClass> findByIsActiveTrueOrderByDisplayOrderAsc();
    Optional<ClassificationClass> findByName(String name);
}
