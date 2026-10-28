package com.sho1kat.repository;

import com.sho1kat.entity.SavedJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {

    boolean existsByCandidateIdAndJobId(Long candidateId, Long jobId);

    /** Newest bookmark first; id descending breaks same-instant ties. */
    List<SavedJob> findByCandidateIdOrderBySavedAtDescIdDesc(Long candidateId);

    /** Owner-scoped lookup: any other candidate sees 404, not the row. */
    Optional<SavedJob> findByIdAndCandidateId(Long id, Long candidateId);
}
