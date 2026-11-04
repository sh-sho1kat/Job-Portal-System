package com.sho1kat.controller;

import com.sho1kat.dto.jobServiceDto.request.JobTagRequest;
import com.sho1kat.dto.jobServiceDto.response.JobTagResponse;
import com.sho1kat.security.RequesterContext;
import com.sho1kat.service.JobTagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-tags")
@RequiredArgsConstructor
public class JobTagController {

    private final JobTagService jobTagService;

    // ---- public ----

    @GetMapping
    public ResponseEntity<List<JobTagResponse>> getAllJobTags() {
        return ResponseEntity.ok(jobTagService.getAllJobTags());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobTagResponse> getJobTagById(@PathVariable Long id) {
        return ResponseEntity.ok(jobTagService.getJobTagById(id));
    }

    // ---- admin / employer ----

    @PostMapping
    public ResponseEntity<JobTagResponse> createJobTag(
            @RequestHeader(name = RequesterContext.HEADER, required = false) String requesterId,
            @Valid @RequestBody JobTagRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(jobTagService.createJobTag(RequesterContext.from(requesterId), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobTagResponse> updateJobTag(
            @PathVariable Long id,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String requesterId,
            @Valid @RequestBody JobTagRequest request) {
        return ResponseEntity.ok(jobTagService.updateJobTag(id, RequesterContext.from(requesterId), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobTag(
            @PathVariable Long id,
            @RequestHeader(name = RequesterContext.HEADER, required = false) String requesterId) {
        jobTagService.deleteJobTag(id, RequesterContext.from(requesterId));
        return ResponseEntity.noContent().build();
    }
}
