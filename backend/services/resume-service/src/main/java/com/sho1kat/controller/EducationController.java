package com.sho1kat.controller;

import com.sho1kat.dto.ResumeServiceDto.request.EducationRequest;
import com.sho1kat.dto.ResumeServiceDto.response.EducationResponse;
import com.sho1kat.service.EducationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Education entries of one resume; every endpoint is owner-scoped.
 */
@RestController
@RequestMapping("/api/resumes/{resumeId}/educations")
@RequiredArgsConstructor
public class EducationController {

    private final EducationService educationService;

    @GetMapping
    public ResponseEntity<List<EducationResponse>> getEducations(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId) {
        return ResponseEntity.ok(educationService.getEducations(resumeId, RequesterId.from(candidateId)));
    }

    @PostMapping
    public ResponseEntity<EducationResponse> addEducation(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId,
            @Valid @RequestBody EducationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(educationService.addEducation(resumeId, RequesterId.from(candidateId), request));
    }

    @PutMapping("/{educationId}")
    public ResponseEntity<EducationResponse> updateEducation(
            @PathVariable Long resumeId,
            @PathVariable Long educationId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId,
            @Valid @RequestBody EducationRequest request) {
        return ResponseEntity.ok(educationService.updateEducation(
                educationId, resumeId, RequesterId.from(candidateId), request));
    }

    @DeleteMapping("/{educationId}")
    public ResponseEntity<Void> deleteEducation(
            @PathVariable Long resumeId,
            @PathVariable Long educationId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId) {
        educationService.deleteEducation(educationId, resumeId, RequesterId.from(candidateId));
        return ResponseEntity.noContent().build();
    }
}
