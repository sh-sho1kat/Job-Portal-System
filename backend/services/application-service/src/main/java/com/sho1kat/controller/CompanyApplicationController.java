package com.sho1kat.controller;

import com.sho1kat.dto.applicationServiceDto.request.CompanyApplicationFilterRequest;
import com.sho1kat.dto.applicationServiceDto.response.ApplicationResponse;
import com.sho1kat.enums.ApplicationStatus;
import com.sho1kat.security.RequesterContext;
import com.sho1kat.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/companies/{companyId}/applications")
@RequiredArgsConstructor
public class CompanyApplicationController {

    private final ApplicationService applicationService;

    @GetMapping
    public ResponseEntity<Page<ApplicationResponse>> listApplications(
            @PathVariable Long companyId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String requesterId,
            @RequestHeader(name = RequesterContext.ROLE_HEADER, required = false) String requesterRole,
            @ModelAttribute CompanyApplicationFilterRequest criteria,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(
                applicationService.getCompanyApplications(companyId, criteria,
                        RequesterContext.from(requesterId), RequesterContext.roleFrom(requesterRole),
                        page, size));
    }

    /** Company-scoped detail view including notes. */
    @GetMapping("/{applicationId}")
    public ResponseEntity<ApplicationResponse> getApplication(
            @PathVariable Long companyId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String requesterId,
            @RequestHeader(name = RequesterContext.ROLE_HEADER, required = false) String requesterRole,
            @PathVariable Long applicationId) {
        return ResponseEntity.ok(
                applicationService.getCompanyApplication(companyId, applicationId,
                        RequesterContext.from(requesterId), RequesterContext.roleFrom(requesterRole)));
    }

    /** Bookmark for the reviewing employer. */
    @PostMapping("/{applicationId}/star")
    public ResponseEntity<ApplicationResponse> star(
            @PathVariable Long companyId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String requesterId,
            @RequestHeader(name = RequesterContext.ROLE_HEADER, required = false) String requesterRole,
            @PathVariable Long applicationId) {
        return ResponseEntity.ok(
                applicationService.setStar(companyId, applicationId, true,
                        RequesterContext.from(requesterId), RequesterContext.roleFrom(requesterRole)));
    }

    /** Removes the bookmark. */
    @PostMapping("/{applicationId}/unstar")
    public ResponseEntity<ApplicationResponse> unstar(
            @PathVariable Long companyId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String requesterId,
            @RequestHeader(name = RequesterContext.ROLE_HEADER, required = false) String requesterRole,
            @PathVariable Long applicationId) {
        return ResponseEntity.ok(
                applicationService.setStar(companyId, applicationId, false,
                        RequesterContext.from(requesterId), RequesterContext.roleFrom(requesterRole)));
    }

    /**
     * PENDING -> REVIEWING / SHORTLISTED / INTERVIEW_SCHEDULED / REJECTED;
     * REVIEWING -> SHORTLISTED / INTERVIEW_SCHEDULED / REJECTED;
     * SHORTLISTED -> INTERVIEW_SCHEDULED / HIRED / REJECTED;
     * INTERVIEW_SCHEDULED -> HIRED / REJECTED. REJECTED, HIRED
     */
    @PostMapping("/{applicationId}/status")
    public ResponseEntity<ApplicationResponse> updateStatus(
            @PathVariable Long companyId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String requesterId,
            @RequestHeader(name = RequesterContext.ROLE_HEADER, required = false) String requesterRole,
            @PathVariable Long applicationId,
            @RequestParam ApplicationStatus status) {
        return ResponseEntity.ok(
                applicationService.updateStatus(companyId, applicationId, status,
                        RequesterContext.from(requesterId), RequesterContext.roleFrom(requesterRole)));
    }
}
