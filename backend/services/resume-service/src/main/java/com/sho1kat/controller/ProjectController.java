package com.sho1kat.controller;

import com.sho1kat.dto.ResumeServiceDto.request.ProjectRequest;
import com.sho1kat.dto.ResumeServiceDto.response.ProjectResponse;
import com.sho1kat.security.RequesterContext;
import com.sho1kat.service.ProjectService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(
        name = "Project Controller",
        description = "Controller for managing personal projects of a resume"
)
@RestController
@RequestMapping("/api/resumes/{resumeId}/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getProjects(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId) {
        return ResponseEntity.ok(projectService.getProjects(resumeId, RequesterContext.from(candidateId)));
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> addProject(
            @PathVariable Long resumeId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId,
            @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.addProject(resumeId, RequesterContext.from(candidateId), request));
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long resumeId,
            @PathVariable Long projectId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId,
            @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(projectService.updateProject(
                projectId, resumeId, RequesterContext.from(candidateId), request));
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long resumeId,
            @PathVariable Long projectId,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String candidateId) {
        projectService.deleteProject(projectId, resumeId, RequesterContext.from(candidateId));
        return ResponseEntity.noContent().build();
    }
}
