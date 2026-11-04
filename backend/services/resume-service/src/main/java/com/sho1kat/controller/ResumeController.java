package com.sho1kat.controller;

import com.sho1kat.dto.ResumeServiceDto.request.ResumeRequest;
import com.sho1kat.dto.ResumeServiceDto.request.PersonalInfoRequest;
import com.sho1kat.dto.ResumeServiceDto.request.UpdateResumeRequest;
import com.sho1kat.dto.ResumeServiceDto.request.UpdateSummaryRequest;
import com.sho1kat.dto.ResumeServiceDto.response.ResumeResponse;
import com.sho1kat.security.RequesterContext;
import com.sho1kat.service.ResumeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(
        name = "Resume Controller",
        description = "Resume shells and root fields. Resume data is personal."
)
@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping("/create")
    public ResponseEntity<ResumeResponse> createResume(
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId,
            @Valid @RequestBody ResumeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resumeService.createResume(RequesterContext.from(candidateId), request));
    }

    @Operation(summary = "Get all resumes for the authenticated candidate", description = "All of the candidate's resumes, default one first (list view, no sections).")
    @GetMapping("/my-resumes")
    public ResponseEntity<List<ResumeResponse>> getMyResumes(
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId) {
        return ResponseEntity.ok(resumeService.getMyResumes(RequesterContext.from(candidateId)));
    }

    @Operation(summary = "Get a resume by ID", description = "Retrieves the details of a specific resume, updating the last viewed timestamp.")
    @GetMapping("/{resumeId}")
    public ResponseEntity<ResumeResponse> getResumeById(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId) {
        return ResponseEntity.ok(resumeService.getResumeById(resumeId, RequesterContext.from(candidateId)));
    }

    @Operation(summary = "Update a resume", description = "Updates the title, template, and visibility of a specific resume. Fields not provided will remain unchanged.")
    @PutMapping("/{resumeId}")
    public ResponseEntity<ResumeResponse> updateResume(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId,
            @Valid @RequestBody UpdateResumeRequest request) {
        return ResponseEntity.ok(resumeService.updateResume(resumeId, RequesterContext.from(candidateId), request));
    }

    @Operation(summary = "Update personal information", description = "supplied field updated, other unchanged")
    @PatchMapping("/{resumeId}/personal-info")
    public ResponseEntity<ResumeResponse> updatePersonalInfo(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId,
            @Valid @RequestBody PersonalInfoRequest request) {
        return ResponseEntity.ok(
                resumeService.updatePersonalInfo(resumeId, RequesterContext.from(candidateId), request));
    }

    @Operation(summary = "Update professional summary", description = "Replaces (or clears with a null) the summary.")
    @PatchMapping("/{resumeId}/summary")
    public ResponseEntity<ResumeResponse> updateSummary(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId,
            @Valid @RequestBody UpdateSummaryRequest request) {
        return ResponseEntity.ok(
                resumeService.updateSummary(resumeId, RequesterContext.from(candidateId), request));
    }

    @Operation(summary = "Set default resume", description = "Marks this resume as the apply-with default, demoting other.")
    @PostMapping("/{resumeId}/set-default")
    public ResponseEntity<ResumeResponse> setDefaultResume(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId) {
        return ResponseEntity.ok(resumeService.setDefaultResume(resumeId, RequesterContext.from(candidateId)));
    }

    @Operation(summary = "Delete a resume", description = "Soft delete; the newest remaining resume becomes the default.")
    @DeleteMapping("/{resumeId}")
    public ResponseEntity<Void> deleteResume(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId) {
        resumeService.deleteResume(resumeId, RequesterContext.from(candidateId));
        return ResponseEntity.noContent().build();
    }
}
