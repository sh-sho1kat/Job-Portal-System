package com.sho1kat.controller;

import com.sho1kat.dto.jobServiceDto.request.JobTagRequest;
import com.sho1kat.dto.jobServiceDto.response.JobTagResponse;
import com.sho1kat.client.JobTagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Job tags (free-form labels, e.g. "AI/ML"). CRUD is open to employers/admins
 * for now via the temporary {@code X-User-Id} stand-in; reads are public.
 * When real role enforcement lands, write access should tighten to admins only.
 */
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
            @RequestHeader(name = RequesterId.HEADER, required = false) String requesterId,
            @Valid @RequestBody JobTagRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(jobTagService.createJobTag(RequesterId.from(requesterId), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobTagResponse> updateJobTag(
            @PathVariable Long id,
            @RequestHeader(name = RequesterId.HEADER, required = false) String requesterId,
            @Valid @RequestBody JobTagRequest request) {
        return ResponseEntity.ok(jobTagService.updateJobTag(id, RequesterId.from(requesterId), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobTag(
            @PathVariable Long id,
            @RequestHeader(name = RequesterId.HEADER, required = false) String requesterId) {
        jobTagService.deleteJobTag(id, RequesterId.from(requesterId));
        return ResponseEntity.noContent().build();
    }
}
