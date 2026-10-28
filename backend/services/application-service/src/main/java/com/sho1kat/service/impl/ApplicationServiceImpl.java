package com.sho1kat.service.impl;

import com.sho1kat.dto.applicationServiceDto.request.ApplicationRequest;
import com.sho1kat.dto.applicationServiceDto.request.CompanyApplicationFilterRequest;
import com.sho1kat.dto.applicationServiceDto.request.WithdrawApplicationRequest;
import com.sho1kat.dto.applicationServiceDto.response.ApplicationResponse;
import com.sho1kat.entity.Application;
import com.sho1kat.enums.ApplicationStatus;
import com.sho1kat.exception.ApiException;
import com.sho1kat.mapper.ApplicationMapper;
import com.sho1kat.mapper.ApplicationNoteMapper;
import com.sho1kat.repository.ApplicationNoteRepository;
import com.sho1kat.repository.ApplicationRepository;
import com.sho1kat.repository.ApplicationSpecification;
import com.sho1kat.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {


    private static final Map<ApplicationStatus, Set<ApplicationStatus>> ALLOWED_TRANSITIONS = Map.of(
            ApplicationStatus.PENDING,
            Set.of(ApplicationStatus.REVIEWING, ApplicationStatus.SHORTLISTED,
                    ApplicationStatus.INTERVIEW_SCHEDULED, ApplicationStatus.REJECTED),
            ApplicationStatus.REVIEWING,
            Set.of(ApplicationStatus.SHORTLISTED, ApplicationStatus.INTERVIEW_SCHEDULED,
                    ApplicationStatus.REJECTED),
            ApplicationStatus.SHORTLISTED,
            Set.of(ApplicationStatus.INTERVIEW_SCHEDULED, ApplicationStatus.HIRED,
                    ApplicationStatus.REJECTED),
            ApplicationStatus.INTERVIEW_SCHEDULED,
            Set.of(ApplicationStatus.HIRED, ApplicationStatus.REJECTED),
            ApplicationStatus.REJECTED, Set.of(),
            ApplicationStatus.HIRED, Set.of(),
            ApplicationStatus.WITHDRAWN, Set.of());

    /** Statuses the candidate may still withdraw from. */
    private static final Set<ApplicationStatus> WITHDRAWABLE = Set.of(
            ApplicationStatus.PENDING,
            ApplicationStatus.REVIEWING,
            ApplicationStatus.SHORTLISTED,
            ApplicationStatus.INTERVIEW_SCHEDULED);

    private final ApplicationRepository applicationRepository;
    private final ApplicationNoteRepository applicationNoteRepository;
    private final ApplicationMapper applicationMapper;
    private final ApplicationNoteMapper applicationNoteMapper;

    // ---- candidate ----

    @Override
    @Transactional
    public ApplicationResponse createApplication(Long candidateId, ApplicationRequest request) {
        if (applicationRepository.existsByCandidateIdAndJobIdAndStatusNot(
                candidateId, request.jobId(), ApplicationStatus.WITHDRAWN)) {
            throw ApiException.conflict("Candidate " + candidateId + " already has an application for job "
                    + request.jobId() + "; only withdrawn applications can be re-applied for");
        }
        Application application = applicationRepository.save(applicationMapper.toEntity(candidateId, request));
        // TODO: ask job-service to bump its applicationCount for this posting
        //  (JobService.incrementApplicationCount) once service discovery exists.
        return applicationMapper.toDetail(application, List.of());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getMyApplications(Long candidateId, int page, int size) {
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.clamp(size, 1, 100),
                Sort.by(
                        Sort.Order.desc("createdAt"),
                        Sort.Order.desc("id")
                ));

        return applicationRepository.findByCandidateId(candidateId, pageable)
                .map(application -> applicationMapper.toDetail(application, List.of()));
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationResponse getCandidateApplication(Long applicationId, Long candidateId) {
        Application application = requireOwnedApplication(applicationId, candidateId);
        return applicationMapper.toDetail(application, List.of());
    }

    @Override
    @Transactional
    public ApplicationResponse withdrawApplication(
            Long applicationId, Long candidateId, WithdrawApplicationRequest request) {
        Application application = requireOwnedApplication(applicationId, candidateId);
        if (application.getStatus() == ApplicationStatus.WITHDRAWN) {
            throw ApiException.conflict("Application " + applicationId + " is already withdrawn");
        }
        if (!WITHDRAWABLE.contains(application.getStatus())) {
            throw ApiException.conflict("Application " + applicationId + " cannot be withdrawn from status "
                    + application.getStatus());
        }
        application.setStatus(ApplicationStatus.WITHDRAWN);
        application.setWithdrawnReason(trimToNull(request == null ? null : request.withdrawnReason()));
        application.setWithdrawnAt(Instant.now());
        return applicationMapper.toDetail(application, List.of());
    }

    // ---- company (employer inbox) ----

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getCompanyApplications(
            Long companyId,
            CompanyApplicationFilterRequest criteria,
            int page,
            int size) {
        // default sort is appliedAt (stored as createdAt) descending, then id descending
        String sortBy = criteria.sortBy() == null ? "appliedAt" : criteria.sortBy().trim();

        if (criteria.minAiScore() != null && (criteria.minAiScore() < 0 || criteria.minAiScore() > 100)) {
            throw ApiException.badRequest("minAiScore must be between 0 and 100");
        }
        Sort sort = switch (sortBy) {
            // aiScore / starred orderings are attached by the Specification — the
            // coalesce keeps unscreened (null score) rows at the bottom portably
            case "aiScore", "aiScoreAsc", "aiScoreDesc", "starred" -> Sort.unsorted();
            default -> Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"));
        };
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, 100), sort);
        return applicationRepository
                .findAll(ApplicationSpecification.companyFilter(companyId, criteria), pageable)
                .map(application -> applicationMapper.toDetail(application, List.of()));
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationResponse getCompanyApplication(Long companyId, Long applicationId) {
        Application application = requireCompanyApplication(companyId, applicationId);
        return toDetail(application);
    }

    @Override
    @Transactional
    public ApplicationResponse setStar(Long companyId, Long applicationId, boolean starred) {
        Application application = requireCompanyApplication(companyId, applicationId);
        application.setStarred(starred);
        return toDetail(application);
    }

    @Override
    @Transactional
    public ApplicationResponse updateStatus(Long companyId, Long applicationId, ApplicationStatus targetStatus) {
        Application application = requireCompanyApplication(companyId, applicationId);
        ApplicationStatus current = application.getStatus();
        if (targetStatus == ApplicationStatus.WITHDRAWN) {
            throw ApiException.badRequest("Only candidates withdraw their own applications");
        }
        if (targetStatus == current) {
            throw ApiException.badRequest("Application " + applicationId + " is already in status " + current);
        }
        if (!ALLOWED_TRANSITIONS.getOrDefault(current, Set.of()).contains(targetStatus)) {
            throw ApiException.conflict(
                    "Status change from " + current + " to " + targetStatus + " is not allowed");
        }
        application.setStatus(targetStatus);
        return toDetail(application);
    }

    // ---- helpers ----

    private Application requireOwnedApplication(Long applicationId, Long candidateId) {
        return applicationRepository.findByIdAndCandidateId(applicationId, candidateId)
                .orElseThrow(() -> ApiException.notFound("Application not found with id: " + applicationId));
    }

    private Application requireCompanyApplication(Long companyId, Long applicationId) {
        return applicationRepository.findByIdAndCompanyId(applicationId, companyId)
                .orElseThrow(() -> ApiException.notFound("Application not found with id: " + applicationId));
    }

    private ApplicationResponse toDetail(Application application) {
        return applicationMapper.toDetail(application, applicationNoteRepository
                .findByApplicationIdOrderByCreatedAtAscIdAsc(application.getId())
                .stream()
                .map(applicationNoteMapper::toResponse)
                .toList());
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
