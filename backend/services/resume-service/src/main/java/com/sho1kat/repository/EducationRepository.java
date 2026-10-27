package com.sho1kat.repository;

import com.sho1kat.entity.Education;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EducationRepository extends JpaRepository<Education, Long> {

    List<Education> findByResumeIdOrderByDisplayOrderAscIdAsc(Long resumeId);

    Optional<Education> findByIdAndResumeId(Long id, Long resumeId);

    boolean existsByResumeId(Long resumeId);
}
