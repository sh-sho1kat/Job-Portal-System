package com.sho1kat.repository;

import com.sho1kat.entity.JobCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JobCategoryRepository extends JpaRepository<JobCategory, Long> {

    Optional<JobCategory> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsByParentId(Long parentId);
}
