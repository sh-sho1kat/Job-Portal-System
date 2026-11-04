package com.sho1kat.controller;

import com.sho1kat.dto.ResumeServiceDto.request.EducationRequest;
import com.sho1kat.dto.ResumeServiceDto.response.EducationResponse;
import com.sho1kat.security.RequesterContext;
import com.sho1kat.service.EducationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(
        name = "Education Controller",
        description = "Controller for managing education entries of a resume"
)
@RestController
@RequestMapping("/api/resumes/{resumeId}/educations")
@RequiredArgsConstructor
public class EducationController {

    private final EducationService educationService;

    @GetMapping
    public ResponseEntity<List<EducationResponse>> getEducations(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId) {
        return ResponseEntity.ok(educationService.getEducations(resumeId, RequesterContext.from(candidateId)));
    }

    @PostMapping
    public ResponseEntity<EducationResponse> addEducation(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId,
            @Valid @RequestBody EducationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(educationService.addEducation(resumeId, RequesterContext.from(candidateId), request));
    }

    @PutMapping("/{educationId}")
    public ResponseEntity<EducationResponse> updateEducation(
            @PathVariable Long resumeId,
            @PathVariable Long educationId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId,
            @Valid @RequestBody EducationRequest request) {
        return ResponseEntity.ok(educationService.updateEducation(
                educationId, resumeId, RequesterContext.from(candidateId), request));
    }

    @DeleteMapping("/{educationId}")
    public ResponseEntity<Void> deleteEducation(
            @PathVariable Long resumeId,
            @PathVariable Long educationId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId) {
        educationService.deleteEducation(educationId, resumeId, RequesterContext.from(candidateId));
        return ResponseEntity.noContent().build();
    }
}
