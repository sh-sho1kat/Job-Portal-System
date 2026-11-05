package com.sho1kat.mapper;

import com.sho1kat.client.CompanyClient;
import com.sho1kat.client.JobClient;
import com.sho1kat.client.UserClient;
import com.sho1kat.dto.ResumeServiceDto.response.ResumeResponse;
import com.sho1kat.dto.applicationServiceDto.request.ApplicationRequest;
import com.sho1kat.dto.applicationServiceDto.response.ApplicationNoteResponse;
import com.sho1kat.dto.applicationServiceDto.response.ApplicationResponse;
import com.sho1kat.dto.applicationServiceDto.response.ApplicationScreeningResponse;
import com.sho1kat.dto.applicationServiceDto.response.WithdrawalResponse;
import com.sho1kat.dto.companyServiceDto.response.CompanySummaryResponse;
import com.sho1kat.dto.jobServiceDto.response.JobSummaryResponse;
import com.sho1kat.dto.userServiceDto.response.CandidateSummaryResponse;
import com.sho1kat.dto.userServiceDto.response.UserResponse;
import com.sho1kat.entity.Application;
import com.sho1kat.enums.ApplicationStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ApplicationMapper {

    private final CompanyClient companyClient;
    private final JobClient jobClient;
    private final UserClient userClient;

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
    public ApplicationResponse toDetail(Application application,
                                        CandidateSummaryResponse candidate,
                                        CompanySummaryResponse company,
                                        JobSummaryResponse job,
                                        ResumeResponse resume,
                                        List<ApplicationNoteResponse> notes) {
        boolean withdrawn = application.getStatus() == ApplicationStatus.WITHDRAWN;
        return new ApplicationResponse(
                application.getId(),
                candidate,
                application.getEmployerId(),
                company,
                job,
                resume,
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

    private String trim(String value) {
        return value == null ? null : value.trim();
    }
}
