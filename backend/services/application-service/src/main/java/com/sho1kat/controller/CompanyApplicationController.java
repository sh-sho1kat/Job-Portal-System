package com.sho1kat.controller;

import com.sho1kat.dto.applicationServiceDto.request.CompanyApplicationFilterRequest;
import com.sho1kat.dto.applicationServiceDto.response.ApplicationResponse;
import com.sho1kat.enums.ApplicationStatus;
import com.sho1kat.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Company-side (employer) application inbox, scoped by {@code companyId} — the
 * same stand-in as job-service: the id is unverified until company-service
 * integration (TODO). Note writes additionally carry the acting user's
 * {@code X-User-Id} so notes record their author.
 */
@RestController
@RequestMapping("/api/companies/{companyId}/applications")
@RequiredArgsConstructor
public class CompanyApplicationController {

    private final ApplicationService applicationService;

    /**
     * Paged inbox. Optional filters via query params matching
     * CompanyApplicationFilterRequest: {@code job}, {@code status},
     * {@code isStarred}, {@code aiShortListStatus}, {@code minAiScore},
     * {@code sortBy} (appliedAt | starred | aiScore); plus {@code page}, {@code size}.
     */
    @GetMapping
    public ResponseEntity<Page<ApplicationResponse>> listApplications(
            @PathVariable Long companyId,
            @ModelAttribute CompanyApplicationFilterRequest criteria,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(applicationService.getCompanyApplications(companyId, criteria, page, size));
    }

    /** Company-scoped detail view including notes. */
    @GetMapping("/{applicationId}")
    public ResponseEntity<ApplicationResponse> getApplication(
            @PathVariable Long companyId,
            @PathVariable Long applicationId) {
        return ResponseEntity.ok(applicationService.getCompanyApplication(companyId, applicationId));
    }

    /** Bookmark for the reviewing employer. */
    @PostMapping("/{applicationId}/star")
    public ResponseEntity<ApplicationResponse> star(
            @PathVariable Long companyId,
            @PathVariable Long applicationId) {
        return ResponseEntity.ok(applicationService.setStar(companyId, applicationId, true));
    }

    /** Removes the bookmark. */
    @PostMapping("/{applicationId}/unstar")
    public ResponseEntity<ApplicationResponse> unstar(
            @PathVariable Long companyId,
            @PathVariable Long applicationId) {
        return ResponseEntity.ok(applicationService.setStar(companyId, applicationId, false));
    }

    /**
     * Employer status move. Allowed steps: PENDING -> REVIEWING / SHORTLISTED /
     * INTERVIEW_SCHEDULED / REJECTED; REVIEWING -> SHORTLISTED /
     * INTERVIEW_SCHEDULED / REJECTED; SHORTLISTED -> INTERVIEW_SCHEDULED / HIRED
     * / REJECTED; INTERVIEW_SCHEDULED -> HIRED / REJECTED. REJECTED, HIRED and
     * WITHDRAWN are terminal; illegal jumps answer 409.
     */
    @PostMapping("/{applicationId}/status")
    public ResponseEntity<ApplicationResponse> updateStatus(
            @PathVariable Long companyId,
            @PathVariable Long applicationId,
            @RequestParam ApplicationStatus status) {
        return ResponseEntity.ok(applicationService.updateStatus(companyId, applicationId, status));
    }
}
