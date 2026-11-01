package com.sho1kat.controller;

import com.sho1kat.dto.applicationServiceDto.request.ApplicationRequest;
import com.sho1kat.dto.applicationServiceDto.request.WithdrawApplicationRequest;
import com.sho1kat.dto.applicationServiceDto.response.ApplicationResponse;
import com.sho1kat.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping("/create")
    public ResponseEntity<ApplicationResponse> createApplication(
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId,
            @Valid @RequestBody ApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(applicationService.createApplication(RequesterId.from(candidateId), request));
    }

    @GetMapping("/my-applications")
    public ResponseEntity<Page<ApplicationResponse>> getMyApplications(
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(applicationService.getMyApplications(
                RequesterId.from(candidateId), page, size));
    }

    @GetMapping("/{applicationId}")
    public ResponseEntity<ApplicationResponse> getApplication(
            @PathVariable Long applicationId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId) {
        return ResponseEntity.ok(applicationService.getCandidateApplication(
                applicationId, RequesterId.from(candidateId)));
    }

    /**
     * Candidate withdrawal from a reviewing status (PENDING, REVIEWING,
     * SHORTLISTED, INTERVIEW_SCHEDULED); terminal states answer 409. The
     * reason is optional (empty body allowed).
     */
    @PostMapping("/{applicationId}/withdraw")
    public ResponseEntity<ApplicationResponse> withdrawApplication(
            @PathVariable Long applicationId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId,
            @RequestBody(required = false) @Valid WithdrawApplicationRequest request) {
        return ResponseEntity.ok(applicationService.withdrawApplication(
                applicationId, RequesterId.from(candidateId), request));
    }
}
