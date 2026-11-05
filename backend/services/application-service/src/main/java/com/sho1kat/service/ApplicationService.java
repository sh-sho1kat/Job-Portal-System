package com.sho1kat.service;

import com.sho1kat.dto.applicationServiceDto.request.ApplicationRequest;
import com.sho1kat.dto.applicationServiceDto.request.CompanyApplicationFilterRequest;
import com.sho1kat.dto.applicationServiceDto.request.WithdrawApplicationRequest;
import com.sho1kat.dto.applicationServiceDto.response.ApplicationResponse;
import com.sho1kat.enums.ApplicationStatus;
import org.springframework.data.domain.Page;


public interface ApplicationService {

    // ---- candidate ----

    ApplicationResponse createApplication(Long candidateId, ApplicationRequest request);

    /** Paged list view for the candidate; internal notes never appear here. */
    Page<ApplicationResponse> getMyApplications(Long candidateId, int page, int size);

    /** Candidate detail; internal notes are withheld from candidate views. */
    ApplicationResponse getCandidateApplication(Long applicationId, Long candidateId);

    /** Any of the reviewing statuses -> WITHDRAWN; terminal states answer 409-conflict/400. */
    ApplicationResponse withdrawApplication(Long applicationId, Long candidateId, WithdrawApplicationRequest request);

    // ---- company (employer inbox) ----

    Page<ApplicationResponse> getCompanyApplications(
            Long companyId, CompanyApplicationFilterRequest criteria,
            Long requesterId, String requesterRole, int page, int size);

    /** Company-scoped detail view, including the notes the requester authored. */
    ApplicationResponse getCompanyApplication(Long companyId, Long applicationId,
                                              Long requesterId, String requesterRole);

    /** Bookmark toggle for the reviewing employer. */
    ApplicationResponse setStar(Long companyId, Long applicationId, boolean starred,
                                Long requesterId, String requesterRole);

    /** Employer status move (see ApplicationServiceImpl for the allowed steps). */
    ApplicationResponse updateStatus(Long companyId, Long applicationId, ApplicationStatus targetStatus,
                                     Long requesterId, String requesterRole);
}
