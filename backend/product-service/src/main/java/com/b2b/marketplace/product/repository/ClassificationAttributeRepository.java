package com.b2b.marketplace.product.repository;

import com.b2b.marketplace.product.entity.ClassificationAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassificationAttributeRepository extends JpaRepository<ClassificationAttribute, Long> {
    List<ClassificationAttribute> findByClassIdAndIsActiveTrueOrderByDisplayOrderAsc(Long classId);
    List<ClassificationAttribute> findByClassIdInAndIsActiveTrueOrderByClassIdAscDisplayOrderAsc(List<Long> classIds);
}
