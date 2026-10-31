package com.sho1kat.controller;

import com.sho1kat.dto.jobServiceDto.request.JobSkillRequest;
import com.sho1kat.dto.jobServiceDto.response.JobSkillResponse;
import com.sho1kat.client.JobSkillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Job skills (named, e.g. "Spring Boot", with a skill category). CRUD is open
 * to employers/admins for now via the temporary {@code X-User-Id} stand-in;
 * reads are public. When real role enforcement lands, write access should
 * tighten to admins only.
 */
@RestController
@RequestMapping("/api/job-skills")
@RequiredArgsConstructor
public class JobSkillController {

    private final JobSkillService jobSkillService;

    // ---- public ----

    /** Active skills, sorted by name. */
    @GetMapping
    public ResponseEntity<List<JobSkillResponse>> getAllJobSkills() {
        return ResponseEntity.ok(jobSkillService.getAllJobSkills());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobSkillResponse> getJobSkillById(@PathVariable Long id) {
        return ResponseEntity.ok(jobSkillService.getJobSkillById(id));
    }

    // ---- admin / employer ----

    /** Flat list including inactive skills. */
    @GetMapping("/all")
    public ResponseEntity<List<JobSkillResponse>> getAllJobSkillsIncludingInactive(
            @RequestHeader(name = RequesterId.HEADER, required = false) String requesterId) {
        RequesterId.from(requesterId); // authenticated callers only
        return ResponseEntity.ok(jobSkillService.getAllJobSkillsIncludingInactive());
    }

    @PostMapping
    public ResponseEntity<JobSkillResponse> createJobSkill(
            @RequestHeader(name = RequesterId.HEADER, required = false) String requesterId,
            @Valid @RequestBody JobSkillRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(jobSkillService.createJobSkill(RequesterId.from(requesterId), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobSkillResponse> updateJobSkill(
            @PathVariable Long id,
            @RequestHeader(name = RequesterId.HEADER, required = false) String requesterId,
            @Valid @RequestBody JobSkillRequest request) {
        return ResponseEntity.ok(jobSkillService.updateJobSkill(id, RequesterId.from(requesterId), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobSkill(
            @PathVariable Long id,
            @RequestHeader(name = RequesterId.HEADER, required = false) String requesterId) {
        jobSkillService.deleteJobSkill(id, RequesterId.from(requesterId));
        return ResponseEntity.noContent().build();
    }
}
