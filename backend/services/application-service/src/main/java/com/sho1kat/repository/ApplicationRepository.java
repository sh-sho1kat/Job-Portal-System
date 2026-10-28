package com.sho1kat.repository;

import com.sho1kat.entity.Application;
import com.sho1kat.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApplicationRepository
        extends JpaRepository<Application, Long>, JpaSpecificationExecutor<Application> {

    Page<Application> findByCandidateId(Long candidateId, Pageable pageable);

    Optional<Application> findByIdAndCandidateId(Long id, Long candidateId);

    boolean existsByCandidateIdAndJobIdAndStatusNot(Long candidateId, Long jobId, ApplicationStatus status);

    Optional<Application> findByIdAndCompanyId(Long id, Long companyId);
}
