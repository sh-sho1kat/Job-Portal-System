package com.sho1kat.repository;

import com.sho1kat.entity.JobSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JobSkillRepository extends JpaRepository<JobSkill, Long> {

    Optional<JobSkill> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
