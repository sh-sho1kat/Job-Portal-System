package com.sho1kat.controller;

import com.sho1kat.dto.ResumeServiceDto.request.ProjectRequest;
import com.sho1kat.dto.ResumeServiceDto.response.ProjectResponse;
import com.sho1kat.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Personal projects of one resume; every endpoint is owner-scoped.
 */
@RestController
@RequestMapping("/api/resumes/{resumeId}/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getProjects(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId) {
        return ResponseEntity.ok(projectService.getProjects(resumeId, RequesterId.from(candidateId)));
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> addProject(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId,
            @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.addProject(resumeId, RequesterId.from(candidateId), request));
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long resumeId,
            @PathVariable Long projectId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId,
            @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(projectService.updateProject(
                projectId, resumeId, RequesterId.from(candidateId), request));
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long resumeId,
            @PathVariable Long projectId,
            @RequestHeader(name = RequesterId.HEADER, required = false) String candidateId) {
        projectService.deleteProject(projectId, resumeId, RequesterId.from(candidateId));
        return ResponseEntity.noContent().build();
    }
}
