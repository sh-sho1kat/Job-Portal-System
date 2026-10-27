package com.sho1kat.repository;

import com.sho1kat.entity.Certification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificationRepository extends JpaRepository<Certification, Long> {

    List<Certification> findByResumeIdOrderByDisplayOrderAscIdAsc(Long resumeId);

    Optional<Certification> findByIdAndResumeId(Long id, Long resumeId);

    boolean existsByResumeId(Long resumeId);
}
