package com.sho1kat.repository;

import com.sho1kat.entity.WorkExperience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkExperienceRepository extends JpaRepository<WorkExperience, Long> {

    List<WorkExperience> findByResumeIdOrderByDisplayOrderAscIdAsc(Long resumeId);

    Optional<WorkExperience> findByIdAndResumeId(Long id, Long resumeId);

    boolean existsByResumeId(Long resumeId);
}
