package com.sho1kat.controller;

import com.sho1kat.dto.ResumeServiceDto.request.WorkExperienceRequest;
import com.sho1kat.dto.ResumeServiceDto.response.WorkExperienceResponse;
import com.sho1kat.service.WorkExperienceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Employment history entries of one resume; every endpoint is owner-scoped.
 */
@RestController
@RequestMapping("/api/resumes/{resumeId}/work-experiences")
@RequiredArgsConstructor
public class WorkExperienceController {

    private final WorkExperienceService workExperienceService;

    @GetMapping
    public ResponseEntity<List<WorkExperienceResponse>> getAllWorkExperiences(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId) {
        return ResponseEntity.ok(
                workExperienceService.getAllWorkExperiences(resumeId, RequesterId.from(candidateId)));
    }

    @PostMapping
    public ResponseEntity<WorkExperienceResponse> createWorkExperience(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId,
            @Valid @RequestBody WorkExperienceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(workExperienceService.createWorkExperience(
                        resumeId, RequesterId.from(candidateId), request));
    }

    @PutMapping("/{workExperienceId}")
    public ResponseEntity<WorkExperienceResponse> updateWorkExperience(
            @PathVariable Long resumeId,
            @PathVariable Long workExperienceId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId,
            @Valid @RequestBody WorkExperienceRequest request) {
        return ResponseEntity.ok(workExperienceService.updateWorkExperience(
                workExperienceId, resumeId, RequesterId.from(candidateId), request));
    }

    @DeleteMapping("/{workExperienceId}")
    public ResponseEntity<Void> deleteWorkExperience(
            @PathVariable Long resumeId,
            @PathVariable Long workExperienceId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId) {
        workExperienceService.deleteWorkExperience(
                workExperienceId, resumeId, RequesterId.from(candidateId));
        return ResponseEntity.noContent().build();
    }
}
