package com.sho1kat.repository;

import com.sho1kat.entity.JobTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JobTagRepository extends JpaRepository<JobTag, Long> {

    Optional<JobTag> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
