package com.sho1kat.repository;

import com.sho1kat.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {

    List<Resume> findByCandidateIdAndDeletedAtIsNullOrderByDefaultResumeDescCreatedAtDesc(Long candidateId);

    Optional<Resume> findByIdAndDeletedAtIsNull(Long id);

    Optional<Resume> findByCandidateIdAndDefaultResumeTrueAndDeletedAtIsNull(Long candidateId);

    boolean existsByCandidateIdAndTitleIgnoreCaseAndDeletedAtIsNull(Long candidateId, String title);

    /** Newest surviving resume, used to promote a default after a delete. */
    Optional<Resume> findFirstByCandidateIdAndDeletedAtIsNullOrderByCreatedAtDescIdDesc(Long candidateId);
}
