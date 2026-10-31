package com.sho1kat.controller;

import com.sho1kat.dto.ResumeServiceDto.request.ResumeRequest;
import com.sho1kat.dto.ResumeServiceDto.request.PersonalInfoRequest;
import com.sho1kat.dto.ResumeServiceDto.request.UpdateResumeRequest;
import com.sho1kat.dto.ResumeServiceDto.request.UpdateSummaryRequest;
import com.sho1kat.dto.ResumeServiceDto.response.ResumeResponse;
import com.sho1kat.client.ResumeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Resume shells and root fields. Resume data is personal, so every endpoint —
 * reads included — is owner-scoped via the temporary {@code X-User-Id} stand-in
 * (documents the same gateway-identity plan as the other services).
 */
@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping("/create")
    public ResponseEntity<ResumeResponse> createResume(
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId,
            @Valid @RequestBody ResumeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resumeService.createResume(RequesterId.from(candidateId), request));
    }

    /** All of the candidate's resumes, default one first (list view, no sections). */
    @GetMapping("/my-resumes")
    public ResponseEntity<List<ResumeResponse>> getMyResumes(
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId) {
        return ResponseEntity.ok(resumeService.getMyResumes(RequesterId.from(candidateId)));
    }

    /** Detailed resume; bumps lastViewedAt. */
    @GetMapping("/{resumeId}")
    public ResponseEntity<ResumeResponse> getResumeById(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId) {
        return ResponseEntity.ok(resumeService.getResumeById(resumeId, RequesterId.from(candidateId)));
    }

    /** Update title/template/visibility (null keeps current). */
    @PutMapping("/{resumeId}")
    public ResponseEntity<ResumeResponse> updateResume(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId,
            @Valid @RequestBody UpdateResumeRequest request) {
        return ResponseEntity.ok(resumeService.updateResume(resumeId, RequesterId.from(candidateId), request));
    }

    /** Patch-style personal info: only supplied fields change. */
    @PatchMapping("/{resumeId}/personal-info")
    public ResponseEntity<ResumeResponse> updatePersonalInfo(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId,
            @Valid @RequestBody PersonalInfoRequest request) {
        return ResponseEntity.ok(
                resumeService.updatePersonalInfo(resumeId, RequesterId.from(candidateId), request));
    }

    /** Replaces (or clears with an explicit null) the professional summary. */
    @PatchMapping("/{resumeId}/summary")
    public ResponseEntity<ResumeResponse> updateSummary(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId,
            @Valid @RequestBody UpdateSummaryRequest request) {
        return ResponseEntity.ok(
                resumeService.updateSummary(resumeId, RequesterId.from(candidateId), request));
    }

    /** Marks this resume as the apply-with default, demoting every other. */
    @PostMapping("/{resumeId}/set-default")
    public ResponseEntity<ResumeResponse> setDefaultResume(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId) {
        return ResponseEntity.ok(resumeService.setDefaultResume(resumeId, RequesterId.from(candidateId)));
    }

    /** Soft delete; the newest remaining resume becomes the default. */
    @DeleteMapping("/{resumeId}")
    public ResponseEntity<Void> deleteResume(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId) {
        resumeService.deleteResume(resumeId, RequesterId.from(candidateId));
        return ResponseEntity.noContent().build();
    }
}
