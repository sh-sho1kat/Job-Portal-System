package com.sho1kat.repository;

import com.sho1kat.entity.Award;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AwardRepository extends JpaRepository<Award, Long> {

    List<Award> findByResumeIdOrderByDisplayOrderAscIdAsc(Long resumeId);

    Optional<Award> findByIdAndResumeId(Long id, Long resumeId);

    boolean existsByResumeId(Long resumeId);
}
