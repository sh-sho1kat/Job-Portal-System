package com.sho1kat.service.impl;

import com.sho1kat.client.CompanyClient;
import com.sho1kat.client.JobClient;
import com.sho1kat.client.ResumeClient;
import com.sho1kat.client.UserClient;
import com.sho1kat.dto.ResumeServiceDto.response.ResumeSummaryResponse;
import com.sho1kat.dto.applicationServiceDto.request.ApplicationRequest;
import com.sho1kat.dto.applicationServiceDto.request.CompanyApplicationFilterRequest;
import com.sho1kat.dto.applicationServiceDto.request.WithdrawApplicationRequest;
import com.sho1kat.dto.applicationServiceDto.response.ApplicationResponse;
import com.sho1kat.dto.companyServiceDto.response.CompanySummaryResponse;
import com.sho1kat.dto.jobServiceDto.response.JobSummaryResponse;
import com.sho1kat.dto.userServiceDto.response.CandidateSummaryResponse;
import com.sho1kat.entity.Application;
import com.sho1kat.enums.ApplicationStatus;
import com.sho1kat.event.ApplicationEventPublisher;
import com.sho1kat.exception.ApiException;
import com.sho1kat.mapper.ApplicationMapper;
import com.sho1kat.mapper.ApplicationNoteMapper;
import com.sho1kat.repository.ApplicationNoteRepository;
import com.sho1kat.repository.ApplicationRepository;
import com.sho1kat.repository.ApplicationSpecification;
import com.sho1kat.service.ApplicationService;
import jakarta.validation.constraints.NotNull;
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
    private final ApplicationEventPublisher applicationEventPublisher;
    private final ResumeClient resumeClient;
    private final JobClient jobClient;
    private final UserClient userClient;
    private final CompanyClient companyClient;

    // ---- candidate ----

    @Override
    @Transactional
    public ApplicationResponse createApplication(Long candidateId, ApplicationRequest request) {
        if (applicationRepository.existsByCandidateIdAndJobIdAndStatusNot(
                candidateId, request.jobId(), ApplicationStatus.WITHDRAWN)) {
            throw ApiException.conflict("Candidate " + candidateId + " already has an application for job "
                    + request.jobId() + "; only withdrawn applications can be re-applied for");
        }
        JobSummaryResponse job = fetchJobSummary(request.jobId(), request.companyId());
        CompanySummaryResponse company = fetchCompanySummary(request.companyId());
        CandidateSummaryResponse candidate = fetchCandidateSummary(candidateId);
        ResumeSummaryResponse resume = fetchResumeSummary(request.resumeId(), candidateId);
        Application application = applicationRepository.save(applicationMapper.toEntity(candidateId, request));
        // TODO: ask job-service to bump its applicationCount for this posting
        //  (JobService.incrementApplicationCount) once service discovery exists.
        return applicationMapper.toDetail(
                application,
                candidate,
                company,
                job,
                resume,
                List.of());
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

        CandidateSummaryResponse candidate = fetchCandidateSummary(candidateId);

        return applicationRepository.findByCandidateId(candidateId, pageable)
                .map(application -> applicationMapper.toDetail(application,
                        candidate,
                        fetchCompanySummary(application.getCompanyId()),
                        fetchJobSummary(application.getJobId(), application.getCompanyId()),
                        fetchResumeSummary(application.getResumeId(), candidateId),
                        applicationNoteRepository.findByApplicationIdAndAuthorIdOrderByCreatedAtAscIdAsc(application.getId(), application.getCandidateId())
                                .stream()
                                .map(applicationNoteMapper::toResponse)
                                .toList()));
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationResponse getCandidateApplication(Long applicationId, Long candidateId) {
        Application application = requireOwnedApplication(applicationId, candidateId);
        return applicationMapper.toDetail(
                application,
                fetchCandidateSummary(candidateId),
                fetchCompanySummary(application.getCompanyId()),
                fetchJobSummary(application.getJobId(), application.getCompanyId()),
                fetchResumeSummary(application.getResumeId(), candidateId),
                applicationNoteRepository.findByApplicationIdAndAuthorIdOrderByCreatedAtAscIdAsc(application.getId(), application.getCandidateId())
                        .stream()
                        .map(applicationNoteMapper::toResponse)
                        .toList());
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
        return applicationMapper.toDetail(
                application,
                fetchCandidateSummary(candidateId),
                fetchCompanySummary(application.getCompanyId()),
                fetchJobSummary(application.getJobId(), application.getCompanyId()),
                fetchResumeSummary(application.getResumeId(), candidateId),
                applicationNoteRepository.findByApplicationIdAndAuthorIdOrderByCreatedAtAscIdAsc(application.getId(), application.getCandidateId())
                        .stream()
                        .map(applicationNoteMapper::toResponse)
                        .toList());
    }

    // ---- company (employer inbox) ----

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getCompanyApplications(
            Long companyId,
            CompanyApplicationFilterRequest criteria,
            Long requesterId,
            String requesterRole,
            int page,
            int size) {
        CompanySummaryResponse company = requireInboxAccess(companyId, requesterRole);

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

        Page<Application> applications = applicationRepository
                .findAll(ApplicationSpecification.companyFilter(companyId, criteria), pageable);

        return applications.map(application -> applicationMapper.toDetail(
                application,
                fetchCandidateSummary(application.getCandidateId()),
                company,
                fetchJobSummary(application.getJobId(), application.getCompanyId()),
                fetchResumeSummary(application.getResumeId(), application.getCandidateId()),
                applicationNoteRepository.findByApplicationIdAndAuthorIdOrderByCreatedAtAscIdAsc(application.getId(), requesterId)
                        .stream()
                        .map(applicationNoteMapper::toResponse)
                        .toList()
        ));
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationResponse getCompanyApplication(Long companyId, Long applicationId,
                                                     Long requesterId, String requesterRole) {
        CompanySummaryResponse company = requireInboxAccess(companyId, requesterRole);
        Application application = requireCompanyApplication(companyId, applicationId);
        return applicationMapper.toDetail(
                application,
                fetchCandidateSummary(application.getCandidateId()),
                company,
                fetchJobSummary(application.getJobId(), application.getCompanyId()),
                fetchResumeSummary(application.getResumeId(), application.getCandidateId()),
                applicationNoteRepository.findByApplicationIdAndAuthorIdOrderByCreatedAtAscIdAsc(application.getId(), requesterId)
                        .stream()
                        .map(applicationNoteMapper::toResponse)
                        .toList());
    }

    @Override
    @Transactional
    public ApplicationResponse setStar(Long companyId, Long applicationId, boolean starred,
                                       Long requesterId, String requesterRole) {
        CompanySummaryResponse company = requireInboxAccess(companyId, requesterRole);
        Application application = requireCompanyApplication(companyId, applicationId);
        application.setStarred(starred);
        return applicationMapper.toDetail(
                application,
                fetchCandidateSummary(application.getCandidateId()),
                company,
                fetchJobSummary(application.getJobId(), application.getCompanyId()),
                fetchResumeSummary(application.getResumeId(), application.getCandidateId()),
                applicationNoteRepository.findByApplicationIdAndAuthorIdOrderByCreatedAtAscIdAsc(application.getId(), requesterId)
                        .stream()
                        .map(applicationNoteMapper::toResponse)
                        .toList());
    }

    @Override
    @Transactional
    public ApplicationResponse updateStatus(Long companyId, Long applicationId, ApplicationStatus targetStatus,
                                            Long requesterId, String requesterRole) {
        CompanySummaryResponse company = requireInboxAccess(companyId, requesterRole);
        Application application = requireCompanyApplication(companyId, applicationId);
        ApplicationStatus oldStatus = application.getStatus();
        if (targetStatus == ApplicationStatus.WITHDRAWN) {
            throw ApiException.badRequest("Only candidates withdraw their own applications");
        }
        if (targetStatus == oldStatus) {
            throw ApiException.badRequest("Application " + applicationId + " is already in status " + oldStatus);
        }
        if (!ALLOWED_TRANSITIONS.getOrDefault(oldStatus, Set.of()).contains(targetStatus)) {
            throw ApiException.conflict(
                    "Status change from " + oldStatus + " to " + targetStatus + " is not allowed");
        }
        application.setStatus(targetStatus);
        applicationEventPublisher.publishApplicationStatusUpdateEvent(application, oldStatus, targetStatus);
        return applicationMapper.toDetail(
                application,
                fetchCandidateSummary(application.getCandidateId()),
                company,
                fetchJobSummary(application.getJobId(), application.getCompanyId()),
                fetchResumeSummary(application.getResumeId(), application.getCandidateId()),
                applicationNoteRepository.findByApplicationIdAndAuthorIdOrderByCreatedAtAscIdAsc(application.getId(), requesterId)
                        .stream()
                        .map(applicationNoteMapper::toResponse)
                        .toList());
    }

    // ---- helpers ----


    private ResumeSummaryResponse fetchResumeSummary(
            @NotNull(message = "resumeId is required") Long resumeId,
            Long candidateId) {

        ResumeSummaryResponse resume = resumeClient.getResume(resumeId, candidateId);
        if (resume == null || !resume.candidateId().equals(candidateId)) {
            throw ApiException.notFound("Resume not found with id: " + resumeId);
        }
        return resume;
    }

    private CandidateSummaryResponse fetchCandidateSummary(Long candidateId) {
        return userClient.getUserSummary(candidateId);
    }

    private CompanySummaryResponse fetchCompanySummary(@NotNull(message = "companyId is required") Long companyId) {
        CompanySummaryResponse company = companyClient.getCompanyById(companyId);
        if (company == null || company.id() == null) {
            throw ApiException.serviceUnavailable(
                    "Company details are unavailable right now; the posting could not be verified. Please retry.");
        }
        return company;
    }

    private JobSummaryResponse fetchJobSummary(
            @NotNull(message = "jobId is required") Long jobId,
            @NotNull(message = "companyId is required") Long companyId) {
        JobSummaryResponse job = jobClient.getJobById(jobId);
        if (job == null || job.id() == null || job.companyId() == null) {
            throw ApiException.serviceUnavailable(
                    "Job details are unavailable right now; the posting could not be verified. Please retry.");
        }
        if (!job.companyId().equals(companyId)) {
            throw ApiException.badRequest("companyId " + companyId
                    + " does not match job " + jobId + " (the posting belongs to company "
                    + job.companyId() + ")");
        }
        return job;
    }

    private Application requireOwnedApplication(Long applicationId, Long candidateId) {
        return applicationRepository.findByIdAndCandidateId(applicationId, candidateId)
                .orElseThrow(() -> ApiException.notFound("Application not found with id: " + applicationId));
    }

    private Application requireCompanyApplication(Long companyId, Long applicationId) {
        return applicationRepository.findByIdAndCompanyId(applicationId, companyId)
                .orElseThrow(() -> ApiException.notFound("Application not found with id: " + applicationId));
    }

    /**
     * Verifies the requester may open the given company's inbox. Employers must own
     * the company — resolved inside company-service from the forwarded X-User-Id via
     * my-company; ADMINs (and SUPER_ADMINs) may view any inbox. Fail-closed: tunnels
     * a 503 when ownership cannot be verified, 403 on a mismatch. Returns the verified
     * company so every row of the response carries the same, correct company.
     */
    private CompanySummaryResponse requireInboxAccess(Long companyId, String requesterRole) {
        if ("ADMIN".equals(requesterRole) || "SUPER_ADMIN".equals(requesterRole)) {
            return fetchCompanySummary(companyId);
        }
        CompanySummaryResponse myCompany = companyClient.getMyCompany();
        if (myCompany == null || myCompany.id() == null) {
            throw ApiException.serviceUnavailable(
                    "Company ownership could not be verified right now. Please retry.");
        }
        if (!myCompany.id().equals(companyId)) {
            throw ApiException.forbidden(
                    "Company " + companyId + " does not belong to the requesting employer");
        }
        return myCompany;
    }


    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
