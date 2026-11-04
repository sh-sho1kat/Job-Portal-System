package com.sho1kat.controller;

import com.sho1kat.dto.jobServiceDto.request.JobSkillRequest;
import com.sho1kat.dto.jobServiceDto.response.JobSkillResponse;
import com.sho1kat.security.RequesterContext;
import com.sho1kat.service.JobSkillService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-skills")
@RequiredArgsConstructor
public class JobSkillController {

    private final JobSkillService jobSkillService;

    // ---- public ----

    @Operation(summary = "Get all active job skills", description = "Returns a list of active job skills, sorted by name.")
    @GetMapping
    public ResponseEntity<List<JobSkillResponse>> getAllJobSkills() {
        return ResponseEntity.ok(jobSkillService.getAllJobSkills());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobSkillResponse> getJobSkillById(@PathVariable Long id) {
        return ResponseEntity.ok(jobSkillService.getJobSkillById(id));
    }

    // ---- admin / employer ----

    @Operation(summary = "Get all job skills including inactive ones", description = "Returns a flat list of all job skills, including inactive ones, sorted by name.")
    @GetMapping("/all")
    public ResponseEntity<List<JobSkillResponse>> getAllJobSkillsIncludingInactive(
            @RequestHeader(name = RequesterContext.HEADER, required = false) String requesterId) {
        RequesterContext.from(requesterId); // authenticated callers only
        return ResponseEntity.ok(jobSkillService.getAllJobSkillsIncludingInactive());
    }

    @PostMapping
    public ResponseEntity<JobSkillResponse> createJobSkill(
            @RequestHeader(name = RequesterContext.HEADER, required = false) String requesterId,
            @Valid @RequestBody JobSkillRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(jobSkillService.createJobSkill(RequesterContext.from(requesterId), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobSkillResponse> updateJobSkill(
            @PathVariable Long id,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String requesterId,
            @Valid @RequestBody JobSkillRequest request) {
        return ResponseEntity.ok(jobSkillService.updateJobSkill(id, RequesterContext.from(requesterId), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobSkill(
            @PathVariable Long id,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String requesterId) {
        jobSkillService.deleteJobSkill(id, RequesterContext.from(requesterId));
        return ResponseEntity.noContent().build();
    }
}
