package com.sho1kat.mapper;

import com.sho1kat.dto.applicationServiceDto.request.ApplicationRequest;
import com.sho1kat.dto.applicationServiceDto.response.ApplicationNoteResponse;
import com.sho1kat.dto.applicationServiceDto.response.ApplicationResponse;
import com.sho1kat.dto.applicationServiceDto.response.ApplicationScreeningResponse;
import com.sho1kat.dto.applicationServiceDto.response.WithdrawalResponse;
import com.sho1kat.dto.jobServiceDto.response.CompanySummaryResponse;
import com.sho1kat.dto.jobServiceDto.response.JobSummaryResponse;
import com.sho1kat.dto.user_service.response.UserResponse;
import com.sho1kat.entity.Application;
import com.sho1kat.enums.ApplicationStatus;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ApplicationMapper {

    public Application toEntity(Long candidateId, ApplicationRequest request) {
        return Application.builder()
                .candidateId(candidateId)
                .jobId(request.jobId())
                .companyId(request.companyId())
                .resumeId(request.resumeId())
                .coverLetter(trim(request.coverLetter()))
                .expectedSalary(request.expectedSalary())
                .availableFrom(request.availableFrom())
                .build();
    }

    /**
     * Detailed application, including whatever notes are supplied by the
     * service (list views pass an empty list, same pattern as resume-service).
     */
    public ApplicationResponse toDetail(Application application, List<ApplicationNoteResponse> notes) {
        boolean withdrawn = application.getStatus() == ApplicationStatus.WITHDRAWN;
        return new ApplicationResponse(
                application.getId(),
                candidateSummary(application),
                application.getEmployerId(),
                companySummary(application),
                jobSummary(application),
                application.getResumeId(),
                application.getCoverLetter(),
                application.getExpectedSalary(),
                application.getAvailableFrom(),
                application.getStatus(),
                application.isStarred(),
                notes,
                withdrawn
                        ? new WithdrawalResponse(application.getWithdrawnReason(), application.getWithdrawnAt())
                        : null,
                application.getCreatedAt(), // appliedAt == creation time
                application.getUpdatedAt(),
                new ApplicationScreeningResponse(application.getAiShortListStatus(), application.getAiScore())
        );
    }

    // ---- cross-service stand-ins (only the ids are known locally) ----

    /**
     * TODO: populated once application-service can look candidates up in
     * user-service (service discovery pending); only the id is known here.
     */
    private UserResponse candidateSummary(Application application) {
        return new UserResponse(
                application.getCandidateId(),
                null, null, null, null, null,
                null, null, null, null, null, null);
    }

    /**
     * TODO: populated once application-service can look companies up in
     * company-service (service discovery pending); only the id is known here.
     */
    private CompanySummaryResponse companySummary(Application application) {
        return new CompanySummaryResponse(application.getCompanyId(), null, null, null, null);
    }

    /**
     * TODO: populated once application-service can look jobs up in
     * job-service (service discovery pending); only the id is known here.
     */
    private JobSummaryResponse jobSummary(Application application) {
        return new JobSummaryResponse(application.getJobId(), null, null, null, null);
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }
}
