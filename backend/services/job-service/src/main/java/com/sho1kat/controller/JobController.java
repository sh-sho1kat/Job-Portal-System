package com.sho1kat.controller;

import com.sho1kat.dto.jobServiceDto.request.CreateJobRequest;
import com.sho1kat.dto.jobServiceDto.request.JobSearchCriteria;
import com.sho1kat.dto.jobServiceDto.request.UpdateJobRequest;
import com.sho1kat.dto.jobServiceDto.response.DetailedJobResponse;
import com.sho1kat.dto.jobServiceDto.response.JobResponse;
import com.sho1kat.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    // ---- public ----

    @GetMapping
    public ResponseEntity<Page<JobResponse>> searchJobs(
            @ModelAttribute JobSearchCriteria criteria,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(jobService.searchJobs(criteria, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @GetMapping("/company/{company-id}")
    public ResponseEntity<JobResponse> getJobByCompanyId(@PathVariable Long companyId) {
        return ResponseEntity.ok(jobService.getJobByCompanyId(companyId));
    }

    // ---- employer / owner ----

    @PostMapping("/create")
    public ResponseEntity<DetailedJobResponse> createJob(
            @RequestHeader(name = RequesterId.HEADER, required = false) String ownerId,
            @Valid @RequestBody CreateJobRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(jobService.createJob(RequesterId.from(ownerId), request));
    }

    @GetMapping("/my-jobs")
    public ResponseEntity<Page<DetailedJobResponse>> getMyJobs(
            @RequestHeader(name = RequesterId.HEADER, required = false) String ownerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(jobService.getMyJobs(RequesterId.from(ownerId), page, size));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DetailedJobResponse> updateJob(
            @PathVariable Long id,
            @RequestHeader(name = RequesterId.HEADER, required = false) String requesterId,
            @Valid @RequestBody UpdateJobRequest request) {
        return ResponseEntity.ok(jobService.updateJob(id, RequesterId.from(requesterId), request));
    }

    /** ACTIVE -> CLOSED */
    @PostMapping("/{id}/close")
    public ResponseEntity<DetailedJobResponse> closeJob(
            @PathVariable Long id,
            @RequestHeader(name = RequesterId.HEADER, required = false) String requesterId) {
        return ResponseEntity.ok(jobService.closeJob(id, RequesterId.from(requesterId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(
            @PathVariable Long id,
            @RequestHeader(name = RequesterId.HEADER, required = false) String requesterId) {
        jobService.deleteJob(id, RequesterId.from(requesterId));
        return ResponseEntity.noContent().build();
    }
}
